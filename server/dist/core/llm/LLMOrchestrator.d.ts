import { LLMExecutor } from '../../contracts/llmExecutor';
import { EventBus } from '../services/eventBus';
export interface LLMMessage {
    id: string;
    from: string;
    to?: string[];
    content: string;
    messageType: 'analysis' | 'critique' | 'proposal' | 'question' | 'consensus' | 'code';
    referencesTo?: string[];
    confidence: number;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export interface ModelRole {
    id: string;
    executor: LLMExecutor;
    specialization: string;
    systemPrompt: string;
    isActive: boolean;
}
export interface ConversationState {
    id: string;
    participants: Map<string, ModelRole>;
    messageHistory: LLMMessage[];
    currentTopic: string;
    consensusReached: boolean;
    startTime: Date;
    lastActivity: Date;
}
/**
 * LLMOrchestrator manages multi-model conversations and hot-swapping
 * Enables collaborative AI sessions where models can converse and build on each other's work
 */
export declare class LLMOrchestrator {
    private conversations;
    private modelRegistry;
    private eventBus;
    private maxConcurrentModels;
    private conversationTimeout;
    constructor(eventBus: EventBus);
    /**
     * Load a model with a specific role and specialization
     */
    loadModel(roleId: string, executor: LLMExecutor, specialization: string, systemPrompt?: string): Promise<void>;
    /**
     * Hot-swap a model while preserving conversation context
     */
    hotSwapModel(roleId: string, newExecutor: LLMExecutor, conversationId?: string): Promise<void>;
    /**
     * Start a multi-model conversation
     */
    startConversation(participantRoles: string[], initialPrompt: string, topic: string): Promise<string>;
    /**
     * Send a message from one model to specific others
     */
    sendMessage(conversationId: string, fromRole: string, toRoles: string[], content: string, messageType?: LLMMessage['messageType']): Promise<LLMMessage>;
    /**
     * Broadcast message to all participants
     */
    broadcastMessage(conversationId: string, message: LLMMessage): Promise<void>;
    /**
     * Get conversation history
     */
    getConversationHistory(conversationId: string): LLMMessage[];
    /**
     * Export conversation for training data
     */
    exportConversation(conversationId: string, format?: 'json' | 'training-data'): any;
    /**
     * Private: Process incoming message for a specific model
     */
    private processMessageForModel;
    /**
     * Private: Brief new model on conversation context during hot-swap
     */
    private briefNewModel;
    /**
     * Private: Format conversation as training data
     */
    private formatAsTrainingData;
    /**
     * Private: Setup event handlers
     */
    private setupEventHandlers;
    /**
     * Get active model registry
     */
    getActiveModels(): ModelRole[];
    /**
     * Get conversation statistics
     */
    getConversationStats(conversationId: string): any;
}
//# sourceMappingURL=LLMOrchestrator.d.ts.map