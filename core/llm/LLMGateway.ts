import { RunnerPool } from './RunnerPool';
import { ConversationOrchestrator, LLMMessage } from './ConversationOrchestrator';
import { EventBus } from '../services/eventBus';
import { logger } from '../utils/logger';

export class LLMGateway {
  private runnerPool: RunnerPool;
  private conversationOrchestrator: ConversationOrchestrator;
  private eventBus: EventBus;

  constructor(
    runnerPool: RunnerPool,
    conversationOrchestrator: ConversationOrchestrator,
    eventBus: EventBus
  ) {
    this.runnerPool = runnerPool;
    this.conversationOrchestrator = conversationOrchestrator;
    this.eventBus = eventBus;

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.on('messageAdded', this.handleMessageAdded.bind(this));
  }

  private async handleMessageAdded({ conversationId, message }: { conversationId: string, message: LLMMessage }): Promise<void> {
    if (!message.to) {
      // This is a broadcast message, send to all participants except the sender
      const conversation = this.conversationOrchestrator.getConversation(conversationId);
      if (conversation) {
        for (const [roleId, role] of conversation.participants) {
          if (message.from !== roleId) {
            this.processMessageForModel(conversationId, message, role.id);
          }
        }
      }
    } else {
      // This is a targeted message
      for (const roleId of message.to) {
        this.processMessageForModel(conversationId, message, roleId);
      }
    }
  }

  private async processMessageForModel(conversationId: string, message: LLMMessage, targetModelId: string): Promise<void> {
    try {
      const runner = await this.runnerPool.getRunner(targetModelId);
      const conversation = this.conversationOrchestrator.getConversation(conversationId);
      if (!conversation) return;

      const targetModel = conversation.participants.get(targetModelId);
      if (!targetModel) return;

      // Build context from recent conversation history
      const contextMessages = conversation.messageHistory
        .slice(-10) // Last 10 messages for context
        .map(msg => `${msg.from}: ${msg.content}`)
        .join('\n\n');

      const prompt = `
${targetModel.systemPrompt}

Current conversation topic: ${conversation.currentTopic}

Recent conversation:
${contextMessages}

Latest message from ${message.from}:
${message.content}

Please respond thoughtfully, building on the discussion. Reference specific points from other participants when relevant.
`;

      const response = await runner.run(prompt);

      const responseMessage: LLMMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        from: targetModel.id,
        content: response,
        messageType: 'analysis',
        referencesTo: [message.id],
        confidence: 0.8,
        timestamp: new Date()
      };

      this.conversationOrchestrator.addMessage(conversationId, responseMessage);

    } catch (error) {
      logger.error(`[LLMGateway] Error processing message for model ${targetModelId}:`, error);
    }
  }
}
