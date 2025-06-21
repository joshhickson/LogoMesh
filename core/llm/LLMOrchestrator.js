"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMOrchestrator = void 0;
const logger_1 = require("../utils/logger");
/**
 * LLMOrchestrator manages multi-model conversations and hot-swapping
 * Enables collaborative AI sessions where models can converse and build on each other's work
 */
class LLMOrchestrator {
    constructor(eventBus) {
        this.conversations = new Map();
        this.modelRegistry = new Map();
        this.maxConcurrentModels = 4;
        this.conversationTimeout = 3600000; // 1 hour
        this.eventBus = eventBus;
        this.setupEventHandlers();
    }
    /**
     * Load a model with a specific role and specialization
     */
    async loadModel(roleId, executor, specialization, systemPrompt) {
        if (this.modelRegistry.size >= this.maxConcurrentModels) {
            throw new Error(`Maximum concurrent models (${this.maxConcurrentModels}) reached`);
        }
        const role = {
            id: roleId,
            executor,
            specialization,
            systemPrompt: systemPrompt || `You are a ${specialization} AI assistant participating in collaborative discussions.`,
            isActive: true
        };
        this.modelRegistry.set(roleId, role);
        logger_1.logger.info(`[LLMOrchestrator] Loaded model ${roleId} with specialization: ${specialization}`);
        this.eventBus.emit('modelLoaded', { roleId, specialization });
    }
    /**
     * Hot-swap a model while preserving conversation context
     */
    async hotSwapModel(roleId, newExecutor, conversationId) {
        const existingRole = this.modelRegistry.get(roleId);
        if (!existingRole) {
            throw new Error(`Model role ${roleId} not found`);
        }
        // Preserve role configuration but swap executor
        const updatedRole = {
            ...existingRole,
            executor: newExecutor
        };
        // If part of active conversation, brief the new model
        if (conversationId) {
            const conversation = this.conversations.get(conversationId);
            if (conversation) {
                await this.briefNewModel(updatedRole, conversation);
            }
        }
        this.modelRegistry.set(roleId, updatedRole);
        logger_1.logger.info(`[LLMOrchestrator] Hot-swapped model ${roleId}`);
        this.eventBus.emit('modelSwapped', { roleId, conversationId });
    }
    /**
     * Start a multi-model conversation
     */
    async startConversation(participantRoles, initialPrompt, topic) {
        const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Validate all participants exist
        const participants = new Map();
        for (const roleId of participantRoles) {
            const role = this.modelRegistry.get(roleId);
            if (!role || !role.isActive) {
                throw new Error(`Model role ${roleId} not found or inactive`);
            }
            participants.set(roleId, role);
        }
        const conversation = {
            id: conversationId,
            participants,
            messageHistory: [],
            currentTopic: topic,
            consensusReached: false,
            startTime: new Date(),
            lastActivity: new Date()
        };
        this.conversations.set(conversationId, conversation);
        // Send initial prompt to all participants
        await this.broadcastMessage(conversationId, {
            id: `msg_${Date.now()}`,
            from: 'orchestrator',
            content: `${initialPrompt}\n\nTopic: ${topic}\n\nParticipants: ${participantRoles.join(', ')}`,
            messageType: 'question',
            confidence: 1.0,
            timestamp: new Date()
        });
        logger_1.logger.info(`[LLMOrchestrator] Started conversation ${conversationId} with ${participantRoles.length} participants`);
        return conversationId;
    }
    /**
     * Send a message from one model to specific others
     */
    async sendMessage(conversationId, fromRole, toRoles, content, messageType = 'analysis') {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }
        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            from: fromRole,
            to: toRoles,
            content,
            messageType,
            confidence: 0.8,
            timestamp: new Date()
        };
        conversation.messageHistory.push(message);
        conversation.lastActivity = new Date();
        // Send to target models and get their responses
        for (const toRole of toRoles) {
            const targetModel = conversation.participants.get(toRole);
            if (targetModel) {
                this.processMessageForModel(conversationId, message, targetModel);
            }
        }
        this.eventBus.emit('messageSent', { conversationId, message });
        return message;
    }
    /**
     * Broadcast message to all participants
     */
    async broadcastMessage(conversationId, message) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }
        conversation.messageHistory.push(message);
        conversation.lastActivity = new Date();
        // Process for all participants
        for (const [roleId, role] of conversation.participants) {
            if (message.from !== roleId) { // Don't send to sender
                this.processMessageForModel(conversationId, message, role);
            }
        }
        this.eventBus.emit('messageBroadcast', { conversationId, message });
    }
    /**
     * Get conversation history
     */
    getConversationHistory(conversationId) {
        const conversation = this.conversations.get(conversationId);
        return conversation ? conversation.messageHistory : [];
    }
    /**
     * Export conversation for training data
     */
    exportConversation(conversationId, format = 'json') {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }
        if (format === 'training-data') {
            return this.formatAsTrainingData(conversation);
        }
        return {
            id: conversation.id,
            topic: conversation.currentTopic,
            participants: Array.from(conversation.participants.keys()),
            messages: conversation.messageHistory,
            duration: conversation.lastActivity.getTime() - conversation.startTime.getTime(),
            messageCount: conversation.messageHistory.length
        };
    }
    /**
     * Private: Process incoming message for a specific model
     */
    async processMessageForModel(conversationId, message, targetModel) {
        try {
            const conversation = this.conversations.get(conversationId);
            if (!conversation)
                return;
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
            const response = await targetModel.executor.executePrompt(prompt);
            // Create response message
            const responseMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                from: targetModel.id,
                content: response,
                messageType: 'analysis',
                referencesTo: [message.id],
                confidence: 0.8,
                timestamp: new Date()
            };
            conversation.messageHistory.push(responseMessage);
            this.eventBus.emit('modelResponse', { conversationId, message: responseMessage });
        }
        catch (error) {
            logger_1.logger.error(`[LLMOrchestrator] Error processing message for model ${targetModel.id}:`, error);
        }
    }
    /**
     * Private: Brief new model on conversation context during hot-swap
     */
    async briefNewModel(role, conversation) {
        const recentHistory = conversation.messageHistory
            .slice(-5)
            .map(msg => `${msg.from}: ${msg.content}`)
            .join('\n\n');
        const briefingPrompt = `
You are joining an ongoing conversation about: ${conversation.currentTopic}

Your role: ${role.specialization}

Recent discussion:
${recentHistory}

Please acknowledge that you understand the context and are ready to contribute.
`;
        try {
            await role.executor.executePrompt(briefingPrompt);
            logger_1.logger.info(`[LLMOrchestrator] Briefed new model ${role.id} on conversation context`);
        }
        catch (error) {
            logger_1.logger.error(`[LLMOrchestrator] Error briefing new model ${role.id}:`, error);
        }
    }
    /**
     * Private: Format conversation as training data
     */
    formatAsTrainingData(conversation) {
        const trainingPairs = [];
        for (let i = 0; i < conversation.messageHistory.length - 1; i++) {
            const currentMsg = conversation.messageHistory[i];
            const nextMsg = conversation.messageHistory[i + 1];
            if (currentMsg.from !== nextMsg.from) {
                // Create prompt-response pair
                trainingPairs.push({
                    prompt: currentMsg.content,
                    response: nextMsg.content,
                    context: {
                        topic: conversation.currentTopic,
                        fromModel: currentMsg.from,
                        toModel: nextMsg.from,
                        messageType: nextMsg.messageType,
                        timestamp: nextMsg.timestamp
                    }
                });
            }
        }
        return {
            conversationId: conversation.id,
            topic: conversation.currentTopic,
            trainingPairs,
            metadata: {
                participantCount: conversation.participants.size,
                totalMessages: conversation.messageHistory.length,
                duration: conversation.lastActivity.getTime() - conversation.startTime.getTime()
            }
        };
    }
    /**
     * Private: Setup event handlers
     */
    setupEventHandlers() {
        // Cleanup inactive conversations
        setInterval(() => {
            const now = Date.now();
            for (const [id, conversation] of this.conversations) {
                if (now - conversation.lastActivity.getTime() > this.conversationTimeout) {
                    this.conversations.delete(id);
                    logger_1.logger.info(`[LLMOrchestrator] Cleaned up inactive conversation ${id}`);
                }
            }
        }, 300000); // Check every 5 minutes
    }
    /**
     * Get active model registry
     */
    getActiveModels() {
        return Array.from(this.modelRegistry.values()).filter(role => role.isActive);
    }
    /**
     * Get conversation statistics
     */
    getConversationStats(conversationId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation)
            return null;
        const messagesByModel = new Map();
        for (const msg of conversation.messageHistory) {
            messagesByModel.set(msg.from, (messagesByModel.get(msg.from) || 0) + 1);
        }
        return {
            id: conversation.id,
            topic: conversation.currentTopic,
            participantCount: conversation.participants.size,
            totalMessages: conversation.messageHistory.length,
            messagesByModel: Object.fromEntries(messagesByModel),
            duration: conversation.lastActivity.getTime() - conversation.startTime.getTime(),
            lastActivity: conversation.lastActivity
        };
    }
}
exports.LLMOrchestrator = LLMOrchestrator;
//# sourceMappingURL=LLMOrchestrator.js.map