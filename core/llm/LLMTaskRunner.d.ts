import { LLMExecutor } from '../../contracts/llmExecutor';
export declare class LLMTaskRunner {
    private executor;
    constructor(executor: LLMExecutor);
    run(prompt: string, metadata?: Record<string, any>): Promise<string>;
    runPromptWithStreaming?(prompt: string, onChunk: (chunk: string) => void, metadata?: Record<string, any>): Promise<string>;
}
//# sourceMappingURL=LLMTaskRunner.d.ts.map