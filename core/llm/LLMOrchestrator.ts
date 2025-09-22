
import { LLMExecutor } from '../../contracts/llmExecutor';
import { EventBus } from '../services/eventBus';
import { logger } from '../utils/logger';

import { ModelRole, ConversationOrchestrator } from './ConversationOrchestrator';

/**
 * LLMOrchestrator manages multi-model conversations and hot-swapping
 * Enables collaborative AI sessions where models can converse and build on each other's work
 */

export class LLMOrchestrator {
  private modelRegistry: Map<string, ModelRole> = new Map();
  private eventBus: EventBus;
  private conversationOrchestrator: ConversationOrchestrator;
  private maxConcurrentModels = 4;

  constructor(eventBus: EventBus, conversationOrchestrator: ConversationOrchestrator) {
    this.eventBus = eventBus;
    this.conversationOrchestrator = conversationOrchestrator;
  }

  /**
   * Load a model with a specific role and specialization
   */
  async loadModel(
    roleId: string, 
    executor: LLMExecutor, 
    specialization: string,
    systemPrompt?: string
  ): Promise<void> {
    if (this.modelRegistry.size >= this.maxConcurrentModels) {
      throw new Error(`Maximum concurrent models (${this.maxConcurrentModels}) reached`);
    }

    const role: ModelRole = {
      id: roleId,
      executor,
      specialization,
      systemPrompt: systemPrompt || `You are a ${specialization} AI assistant participating in collaborative discussions.`,
      isActive: true
    };

    this.modelRegistry.set(roleId, role);
    
    logger.info(`[LLMOrchestrator] Loaded model ${roleId} with specialization: ${specialization}`);
    
    this.eventBus.emit('modelLoaded', { roleId, specialization });
  }

  /**
   * Hot-swap a model while preserving conversation context
   */
  async hotSwapModel(
    roleId: string,
    newExecutor: LLMExecutor,
    conversationId?: string
  ): Promise<void> {
    const existingRole = this.modelRegistry.get(roleId);
    if (!existingRole) {
      throw new Error(`Model role ${roleId} not found`);
    }

    // Preserve role configuration but swap executor
    const updatedRole: ModelRole = {
      ...existingRole,
      executor: newExecutor
    };

    // TODO: Implement model briefing in LLMGateway

    this.modelRegistry.set(roleId, updatedRole);
    
    logger.info(`[LLMOrchestrator] Hot-swapped model ${roleId}`);
    
    this.eventBus.emit('modelSwapped', { roleId, conversationId });
  }

  /**
   * Get active model registry
   */
  getActiveModels(): ModelRole[] {
    return Array.from(this.modelRegistry.values()).filter(role => role.isActive);
  }

  async startConversation(
    participantRoles: string[],
    initialPrompt: string,
    topic: string
  ): Promise<string> {
    const roles = participantRoles.map(roleId => {
      const role = this.modelRegistry.get(roleId);
      if (!role) {
        throw new Error(`Model role ${roleId} not found`);
      }
      return role;
    });

    return this.conversationOrchestrator.startConversation(roles, initialPrompt, topic);
  }

  sendMessage(
    conversationId: string,
    fromRole: string,
    toRoles: string[],
    content: string,
    messageType: 'analysis' | 'critique' | 'proposal' | 'question' | 'consensus' | 'code' = 'analysis'
  ): void {
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      from: fromRole,
      to: toRoles,
      content,
      messageType,
      confidence: 0.8, // TODO: Implement confidence scoring
      timestamp: new Date()
    };
    this.conversationOrchestrator.addMessage(conversationId, message);
  }
}
