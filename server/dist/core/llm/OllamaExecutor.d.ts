import { LLMExecutor } from '../../contracts/llmExecutor';
export declare class OllamaExecutor implements LLMExecutor {
    private baseUrl;
    private modelName;
    constructor(modelName?: string);
    executePrompt(prompt: string, metadata?: Record<string, any>): Promise<string>;
    execute(prompt: string, options?: import('../../contracts/llmExecutor').LLMExecutionOptions): Promise<import('../../contracts/llmExecutor').LLMFullResponse>;
    get supportsStreaming(): boolean;
    getModelName(): string;
    executeWithContext(prompt: string, context?: any[], metadata?: Record<string, any>): Promise<string>;
}
//# sourceMappingURL=OllamaExecutor.d.ts.map