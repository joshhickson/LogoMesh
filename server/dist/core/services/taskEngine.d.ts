import { EventBus } from './eventBus.js';
import { LLMTaskRunner } from '../llm/LLMTaskRunner.js';
import { PluginHost } from './pluginHost.js';
interface TaskStep {
    id: string;
    type: 'llm' | 'plugin' | 'system';
    executorId: string;
    input: Record<string, any>;
    output?: Record<string, any>;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: Date;
    endTime?: Date;
    error?: string;
}
interface Pipeline {
    id: string;
    name: string;
    description?: string;
    steps: TaskStep[];
    executionMode: 'sequential' | 'parallel';
    status: 'pending' | 'running' | 'completed' | 'failed';
    createdAt: Date;
    startTime?: Date;
    endTime?: Date;
    context: Record<string, any>;
}
/**
 * TaskEngine orchestrates execution of multi-step workflows using existing
 * LLMTaskRunner, LLMOrchestrator, and PluginHost components
 */
export declare class TaskEngine {
    private registry;
    private orchestrator;
    private eventBus;
    private activePipelines;
    constructor(eventBus: EventBus);
    /**
     * Register an LLM executor with the task engine
     */
    registerLLMExecutor(id: string, executor: LLMTaskRunner): void;
    /**
     * Register a plugin executor with the task engine
     */
    registerPluginExecutor(id: string, executor: PluginHost): void;
    /**
     * Create a new pipeline from JSON definition
     */
    createPipeline(definition: {
        name: string;
        description?: string;
        steps: Omit<TaskStep, 'id' | 'status' | 'startTime' | 'endTime'>[];
        executionMode: 'sequential' | 'parallel';
        context?: Record<string, any>;
    }): Promise<Pipeline>;
    /**
     * Execute a pipeline
     */
    executePipeline(pipelineId: string): Promise<Pipeline>;
    /**
     * Execute pipeline steps sequentially
     */
    private executeSequentially;
    /**
     * Execute pipeline steps in parallel
     */
    private executeInParallel;
    /**
     * Execute a single task step
     */
    private executeStep;
    /**
     * Execute an LLM step using registered LLMTaskRunner
     */
    private executeLLMStep;
    /**
     * Execute a plugin step using registered PluginHost
     */
    private executePluginStep;
    /**
     * Execute a system step (filesystem, API calls, etc.)
     */
    private executeSystemStep;
    /**
     * Get pipeline status
     */
    getPipelineStatus(pipelineId: string): Pipeline | null;
    /**
     * List all active pipelines
     */
    getActivePipelines(): Pipeline[];
    /**
     * Cancel a running pipeline
     */
    cancelPipeline(pipelineId: string): boolean;
    /**
     * Setup event handlers for TaskEngine events
     */
    private setupEventHandlers;
    /**
     * Get task engine status
     */
    getStatus(): {
        activePipelines: number;
        registeredExecutors: {
            llm: number;
            plugin: number;
            system: number;
        };
    };
}
export {};
//# sourceMappingURL=taskEngine.d.ts.map