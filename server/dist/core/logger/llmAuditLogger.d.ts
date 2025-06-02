export interface LLMInteractionData {
    prompt: string;
    response: string | null;
    model: string;
    metadata?: Record<string, any>;
    duration: number;
    success: boolean;
    error?: string;
}
export declare function logLLMInteraction(data: LLMInteractionData): Promise<void>;
//# sourceMappingURL=llmAuditLogger.d.ts.map