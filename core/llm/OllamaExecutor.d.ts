import { LLMExecutor } from '../../contracts/llmExecutor';
export declare class OllamaExecutor implements LLMExecutor {
    private baseUrl;
    private modelName;
    constructor(modelName?: string);
    executePrompt(prompt: string, metadata?: Record<string, any>): Promise<string>;
    get supportsStreaming(): boolean;
    getModelName(): string;
    executeWithContext(prompt: string, context?: any[], metadata?: Record<string, any>): Promise<string>;
}
//# sourceMappingURL=OllamaExecutor.d.ts.map