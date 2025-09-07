import { EventBus } from './eventBus';
import { LLMOrchestrator } from '../llm/LLMOrchestrator';
import { LLMTaskRunner } from '../llm/LLMTaskRunner';
import { PluginHost } from './pluginHost';
import { logger } from '../utils/logger';

// TaskEngine interfaces
export interface TaskStep {
  id: string;
  type: 'llm' | 'plugin' | 'system';
  executorId: string;
  input: Record<string, unknown>; // any -> unknown
  output?: Record<string, unknown>; // any -> unknown
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  steps: TaskStep[];
  executionMode: 'sequential' | 'parallel';
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  startTime?: Date;
  endTime?: Date;
  context: Record<string, unknown>; // any -> unknown
}

export interface ExecutorRegistry {
  llmExecutors: Map<string, LLMTaskRunner>;
  pluginExecutors: Map<string, PluginHost>;
  systemExecutors: Map<string, SystemExecutor>; // Replaced any with SystemExecutor
}

// --- System Executor Types (New) ---
export interface SystemExecutorInput {
  command: string;
  params?: Record<string, unknown>;
}

export interface SystemExecutorOutput {
  result: unknown;
  [key: string]: unknown;
}

export type SystemExecutor = (
  input: SystemExecutorInput, // Using a more structured input type
  context: Record<string, unknown>
) => Promise<SystemExecutorOutput>; // Using a more structured output type


// Audit logging function stub
async function logPipelineEvent(event: {
  pipelineId: string;
  pipelineName: string;
  event: string;
  details?: Record<string, unknown>; // any -> unknown
}) {
  logger.info(`[Pipeline Audit] ${event.event}:`, event);
}

/**
 * TaskEngine orchestrates execution of multi-step workflows using existing
 * LLMTaskRunner, LLMOrchestrator, and PluginHost components
 */
export class TaskEngine {
  private registry: ExecutorRegistry;
  // Removed unused _orchestrator field to fix TS6133
  private eventBus: EventBus;
  private activePipelines: Map<string, Pipeline> = new Map();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    // Removed _orchestrator initialization to fix TS6133
    this.registry = {
      llmExecutors: new Map(),
      pluginExecutors: new Map(),
      systemExecutors: new Map()
    };

    this.setupEventHandlers();
  }

  /**
   * Register an LLM executor with the task engine
   */
  registerLLMExecutor(id: string, executor: LLMTaskRunner): void {
    this.registry.llmExecutors.set(id, executor);
    logger.info(`[TaskEngine] Registered LLM executor: ${id}`);
  }

  /**
   * Register a plugin executor with the task engine
   */
  registerPluginExecutor(id: string, executor: PluginHost): void {
    this.registry.pluginExecutors.set(id, executor);
    logger.info(`[TaskEngine] Registered plugin executor: ${id}`);
  }

  /**
   * Create a new pipeline from JSON definition
   */
  async createPipeline(definition: {
    name: string;
    description?: string;
    steps: Omit<TaskStep, 'id' | 'status' | 'startTime' | 'endTime'>[];
    executionMode: 'sequential' | 'parallel';
    context?: Record<string, unknown>; // any -> unknown
  }): Promise<Pipeline> {
    const pipelineId = `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const pipelineObject: Pipeline = { // Changed variable name for clarity
      id: pipelineId,
      name: definition.name,
      // description will be added conditionally
      steps: definition.steps.map((step, index) => ({
        ...step,
        id: `step_${index}_${step.type}_${step.executorId}`,
        status: 'pending'
      })),
      executionMode: definition.executionMode,
      status: 'pending',
      createdAt: new Date(),
      context: definition.context || {} // context is Record<string, unknown> which is fine
    };
    if (definition.description !== undefined) {
      pipelineObject.description = definition.description;
    }

    this.activePipelines.set(pipelineId, pipelineObject);

    logger.info(`[TaskEngine] Created pipeline: ${pipelineObject.name} (${pipelineId})`);

    // Audit log pipeline creation
    await logPipelineEvent({
      pipelineId,
      pipelineName: pipelineObject.name,
      event: 'created',
      details: {
        stepCount: pipelineObject.steps.length,
        executionMode: pipelineObject.executionMode
      }
    });

    this.eventBus.emit('pipelineCreated', { pipeline: pipelineObject });

    return pipelineObject;
  }

  /**
   * Execute a pipeline
   */
  async executePipeline(pipelineId: string): Promise<Pipeline> {
    const pipeline = this.activePipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }

    pipeline.status = 'running';
    pipeline.startTime = new Date();

    logger.info(`[TaskEngine] Starting pipeline execution: ${pipeline.name}`);

    // Audit log pipeline start
    await logPipelineEvent({
      pipelineId,
      pipelineName: pipeline.name,
      event: 'started'
    });

    this.eventBus.emit('pipelineStarted', { pipeline });

    try {
      if (pipeline.executionMode === 'sequential') {
        await this.executeSequentially(pipeline);
      } else {
        await this.executeInParallel(pipeline);
      }

      pipeline.status = 'completed';
      pipeline.endTime = new Date();

      logger.info(`[TaskEngine] Pipeline completed: ${pipeline.name}`);
      this.eventBus.emit('pipelineCompleted', { pipeline });

    } catch (error) {
      pipeline.status = 'failed';
      pipeline.endTime = new Date();

      logger.error(`[TaskEngine] Pipeline failed: ${pipeline.name}`, error);
      this.eventBus.emit('pipelineFailed', { pipeline, error });

      throw error;
    }

    return pipeline;
  }

  /**
   * Execute pipeline steps sequentially
   */
  private async executeSequentially(pipeline: Pipeline): Promise<void> {
    for (const step of pipeline.steps) {
      await this.executeStep(step, pipeline.context);

      if (step.status === 'failed') {
        throw new Error(`Step ${step.id} failed: ${step.error}`);
      }
    }
  }

  /**
   * Execute pipeline steps in parallel
   */
  private async executeInParallel(pipeline: Pipeline): Promise<void> {
    const stepPromises = pipeline.steps.map(step => 
      this.executeStep(step, pipeline.context).catch((error: unknown) => { // Typed error here
        step.status = 'failed';
        step.error = error instanceof Error ? error.message : String(error); // Safer error handling
        logger.error(`[TaskEngine] Parallel step failed: ${step.id}`, error);
      })
    );

    await Promise.allSettled(stepPromises);

    // Check if any steps failed
    const failedSteps = pipeline.steps.filter(step => step.status === 'failed');
    if (failedSteps.length > 0) {
      throw new Error(`${failedSteps.length} steps failed in parallel execution`);
    }
  }

  /**
   * Execute a single task step
   */
  private async executeStep(step: TaskStep, context: Record<string, unknown>): Promise<void> { // any -> unknown
    step.status = 'running';
    step.startTime = new Date();

    logger.info(`[TaskEngine] Executing step: ${step.id} (${step.type})`);
    this.eventBus.emit('stepStarted', { step });

    try {
      switch (step.type) {
        case 'llm':
          step.output = await this.executeLLMStep(step, context);
          break;
        case 'plugin':
          step.output = await this.executePluginStep(step);
          break;
        case 'system':
          step.output = await this.executeSystemStep(step);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      step.status = 'completed';
      step.endTime = new Date();

      logger.info(`[TaskEngine] Step completed: ${step.id}`);
      this.eventBus.emit('stepCompleted', { step });

    } catch (error: unknown) { // any -> unknown
      step.status = 'failed';
      step.error = error instanceof Error ? error.message : String(error); // Safer error handling
      step.endTime = new Date();

      logger.error(`[TaskEngine] Step failed: ${step.id}`, error);
      this.eventBus.emit('stepFailed', { step, error });

      throw error;
    }
  }

  /**
   * Execute an LLM step using registered LLMTaskRunner
   */
  private async executeLLMStep(step: TaskStep, context: Record<string, unknown>): Promise<Record<string, unknown>> { // any -> unknown
    const executor = this.registry.llmExecutors.get(step.executorId);
    if (!executor) {
      throw new Error(`LLM executor ${step.executorId} not found`);
    }

    // Assuming step.input.prompt is string and step.input.metadata is Record<string, unknown>
    // Need to ensure these accesses are safe if input is Record<string, unknown>
    const prompt = typeof step.input.prompt === 'string' ? step.input.prompt : '';
    const stepMetadata = typeof step.input.metadata === 'object' && step.input.metadata !== null
                         ? step.input.metadata
                         : {};
    const metadata = { ...stepMetadata, context }; // context is Record<string, unknown>

    // executor.run now accepts Record<string, unknown> for metadata, so no cast needed.
    const response = await executor.run(prompt, metadata);

    return {
      response,
      model: step.executorId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute a plugin step using registered PluginHost
   */
  private async executePluginStep(step: TaskStep): Promise<Record<string, unknown>> { // context -> _context
    const executor = this.registry.pluginExecutors.get(step.executorId);
    if (!executor) {
      throw new Error(`Plugin executor ${step.executorId} not found`);
    }

    // For now, return a mock response - will be implemented when PluginHost is enhanced
    logger.warn(`[TaskEngine] Plugin execution is stubbed for: ${step.executorId}`);

    // When implemented, ensure safe access to step.input properties if needed for PluginHost
    // const pluginInput = step.input.pluginSpecificInput; // Example, would need type check

    return {
      result: `Plugin ${step.executorId} executed successfully`,
      input: step.input, // step.input is Record<string, unknown>
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute a system step (filesystem, API calls, etc.)
   */
  private async executeSystemStep(step: TaskStep): Promise<Record<string, unknown>> { // context -> _context
    const executor = this.registry.systemExecutors.get(step.executorId);
    if (!executor) {
      throw new Error(`System executor ${step.executorId} not found`);
    }

    // For now, return a mock response - system execution will be implemented in DevShell
    logger.warn(`[TaskEngine] System execution is stubbed for: ${step.executorId}`);

    // When implemented, need to ensure step.input is correctly shaped for SystemExecutorInput
    // const systemInput: SystemExecutorInput = {
    //   command: typeof step.input.command === 'string' ? step.input.command : 'default',
    //   params: typeof step.input.params === 'object' ? step.input.params as Record<string, unknown> : {}
    // };
    // await executor(systemInput, context);


    return {
      result: `System command ${step.executorId} executed successfully`,
      input: step.input, // step.input is Record<string, unknown>
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get pipeline status
   */
  getPipelineStatus(pipelineId: string): Pipeline | null {
    return this.activePipelines.get(pipelineId) || null;
  }

  /**
   * List all active pipelines
   */
  getActivePipelines(): Pipeline[] {
    return Array.from(this.activePipelines.values());
  }

  /**
   * Cancel a running pipeline
   */
  cancelPipeline(pipelineId: string): boolean {
    const pipeline = this.activePipelines.get(pipelineId);
    if (!pipeline || pipeline.status !== 'running') {
      return false;
    }

    pipeline.status = 'failed';
    pipeline.endTime = new Date();

    logger.info(`[TaskEngine] Pipeline cancelled: ${pipeline.name}`);
    this.eventBus.emit('pipelineCancelled', { pipeline });

    return true;
  }

  /**
   * Setup event handlers for TaskEngine events
   */
  private setupEventHandlers(): void {
    // Clean up completed pipelines after 1 hour
    setInterval(() => {
      const now = Date.now();
      for (const [id, pipeline] of this.activePipelines) {
        if (pipeline.status === 'completed' || pipeline.status === 'failed') {
          const completedTime = pipeline.endTime?.getTime() || 0;
          if (now - completedTime > 3600000) { // 1 hour
            this.activePipelines.delete(id);
            logger.info(`[TaskEngine] Cleaned up pipeline: ${pipeline.name}`);
          }
        }
      }
    }, 300000); // Check every 5 minutes
  }

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
  } {
    return {
      activePipelines: this.activePipelines.size,
      registeredExecutors: {
        llm: this.registry.llmExecutors.size,
        plugin: this.registry.pluginExecutors.size,
        system: this.registry.systemExecutors.size
      }
    };
  }
}