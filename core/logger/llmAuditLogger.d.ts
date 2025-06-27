export interface LLMAuditEntry {
    id: string;
    timestamp: Date;
    prompt: string;
    response: string | null;
    model: string;
    metadata?: Record<string, any>;
    duration: number;
    success: boolean;
    error?: string;
}
export interface PipelineAuditEntry {
    id: string;
    pipelineId: string;
    pipelineName: string;
    stepId?: string;
    stepType?: 'llm' | 'plugin' | 'system';
    executorId?: string;
    timestamp: Date;
    event: 'created' | 'started' | 'step_started' | 'step_completed' | 'step_failed' | 'completed' | 'failed' | 'cancelled';
    details?: Record<string, any>;
    duration?: number;
}
export declare function logLLMInteraction(entry: Omit<LLMAuditEntry, 'id' | 'timestamp'>): Promise<void>;
export declare function logPipelineEvent(entry: Omit<PipelineAuditEntry, 'id' | 'timestamp'>): Promise<void>;
export declare function getAuditLogs(filter?: {
    model?: string;
    success?: boolean;
    since?: Date;
    limit?: number;
}): LLMAuditEntry[];
export declare function getPipelineAuditLogs(filter?: {
    pipelineId?: string;
    event?: string;
    since?: Date;
    limit?: number;
}): PipelineAuditEntry[];
//# sourceMappingURL=llmAuditLogger.d.ts.map