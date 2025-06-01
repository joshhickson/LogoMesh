import { LLMExecutor } from '../../contracts/llmExecutor';
export interface LLMResponse {
    response: string;
    model: string;
    executionTimeMs: number;
    tokensUsed?: number;
}
export declare class LLMTaskRunner {
    private executor;
    private totalRequests;
    private lastHealthCheck?;
    constructor(executor: LLMExecutor);
    run(prompt: string, metadata?: Record<string, any>): Promise<string>;
    runPromptWithStreaming?(prompt: string, onChunk: (chunk: string) => void, metadata?: Record<string, any>): Promise<string>;
    executePrompt(prompt: string, metadata?: Record<string, any>): Promise<LLMResponse>;
    getStatus(): Promise<{
        isConnected: boolean;
        currentModel: string;
        lastHealthCheck?: Date;
        totalRequests: number;
    }>;
}
//# sourceMappingURL=LLMTaskRunner.d.ts.map