import { EventBus } from '../services/eventBus';
import { logger } from '../utils/logger';

// TODO: Move these interfaces to a common types file
export interface LLMMessage {
  id: string;
  from: string;
  to?: string[];
  content: string;
  messageType: 'analysis' | 'critique' | 'proposal' | 'question' | 'consensus' | 'code';
  referencesTo?: string[];
  confidence: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

import { LLMExecutor } from '../../contracts/llmExecutor';

export interface ModelRole {
  id: string;
  executor: LLMExecutor;
  specialization: string;
  systemPrompt: string;
  isActive: boolean;
}

export interface ConversationState {
  id:string;
  participants: Map<string, ModelRole>;
  messageHistory: LLMMessage[];
  currentTopic: string;
  consensusReached: boolean;
  startTime: Date;
  lastActivity: Date;
}

export class ConversationOrchestrator {
  private conversations: Map<string, ConversationState> = new Map();
  private eventBus: EventBus;
  private conversationTimeout = 3600000; // 1 hour

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupEventHandlers();
  }

  async startConversation(
    participantRoles: ModelRole[],
    initialPrompt: string,
    topic: string
  ): Promise<string> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const participants = new Map<string, ModelRole>();
    for (const role of participantRoles) {
      participants.set(role.id, role);
    }

    const conversation: ConversationState = {
      id: conversationId,
      participants,
      messageHistory: [],
      currentTopic: topic,
      consensusReached: false,
      startTime: new Date(),
      lastActivity: new Date()
    };

    this.conversations.set(conversationId, conversation);

    const initialMessage: LLMMessage = {
      id: `msg_${Date.now()}`,
      from: 'orchestrator',
      content: `${initialPrompt}\n\nTopic: ${topic}\n\nParticipants: ${participantRoles.map(r => r.id).join(', ')}`,
      messageType: 'question',
      confidence: 1.0,
      timestamp: new Date()
    };

    conversation.messageHistory.push(initialMessage);

    this.eventBus.emit('conversationStarted', { conversationId, initialMessage });

    logger.info(`[ConversationOrchestrator] Started conversation ${conversationId} with ${participantRoles.length} participants`);

    return conversationId;
  }

  addMessage(conversationId: string, message: LLMMessage): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    conversation.messageHistory.push(message);
    conversation.lastActivity = new Date();

    this.eventBus.emit('messageAdded', { conversationId, message });
  }

  getConversationHistory(conversationId: string): LLMMessage[] {
    const conversation = this.conversations.get(conversationId);
    return conversation ? conversation.messageHistory : [];
  }

  getConversation(conversationId: string): ConversationState | undefined {
    return this.conversations.get(conversationId);
  }

  private setupEventHandlers(): void {
    // Cleanup inactive conversations
    setInterval(() => {
      const now = Date.now();
      for (const [id, conversation] of this.conversations) {
        if (now - conversation.lastActivity.getTime() > this.conversationTimeout) {
          this.conversations.delete(id);
          logger.info(`[ConversationOrchestrator] Cleaned up inactive conversation ${id}`);
        }
      }
    }, 300000); // Check every 5 minutes
  }
}
