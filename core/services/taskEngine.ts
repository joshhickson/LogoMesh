import { EventBus } from './eventBus.js';
import { LLMOrchestrator } from '../llm/LLMOrchestrator.js';
import { LLMTaskRunner } from '../llm/LLMTaskRunner.js';
import { PluginHost } from './pluginHost.js';
import { logger } from '../utils/logger.js';

// TaskEngine interfaces
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

interface ExecutorRegistry {
  llmExecutors: Map<string, LLMTaskRunner>;
  pluginExecutors: Map<string, PluginHost>;
  systemExecutors: Map<string, any>;
}

// Audit logging function stub
async function logPipelineEvent(event: {
  pipelineId: string;
  pipelineName: string;
  event: string;
  details?: Record<string, any>;
}) {
  logger.info(`[Pipeline Audit] ${event.event}:`, event);
}

/**
 * TaskEngine orchestrates execution of multi-step workflows using existing
 * LLMTaskRunner, LLMOrchestrator, and PluginHost components
 */
export class TaskEngine {
  private registry: ExecutorRegistry;
  private orchestrator: LLMOrchestrator;
  private eventBus: EventBus;
  private activePipelines: Map<string, Pipeline> = new Map();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.orchestrator = new LLMOrchestrator(eventBus);
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
    context?: Record<string, any>;
  }): Promise<Pipeline> {
    const pipelineId = `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const pipeline: Pipeline = {
      id: pipelineId,
      name: definition.name,
      description: definition.description,
      steps: definition.steps.map((step, index) => ({
        ...step,
        id: `step_${index}_${step.type}_${step.executorId}`,
        status: 'pending'
      })),
      executionMode: definition.executionMode,
      status: 'pending',
      createdAt: new Date(),
      context: definition.context || {}
    };

    this.activePipelines.set(pipelineId, pipeline);

    logger.info(`[TaskEngine] Created pipeline: ${pipeline.name} (${pipelineId})`);

    // Audit log pipeline creation
    await logPipelineEvent({
      pipelineId,
      pipelineName: pipeline.name,
      event: 'created',
      details: {
        stepCount: pipeline.steps.length,
        executionMode: pipeline.executionMode
      }
    });

    this.eventBus.emit('pipelineCreated', { pipeline });

    return pipeline;
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
      this.executeStep(step, pipeline.context).catch(error => {
        step.status = 'failed';
        step.error = error.message;
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
  private async executeStep(step: TaskStep, context: Record<string, any>): Promise<void> {
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
          step.output = await this.executePluginStep(step, context);
          break;
        case 'system':
          step.output = await this.executeSystemStep(step, context);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      step.status = 'completed';
      step.endTime = new Date();

      logger.info(`[TaskEngine] Step completed: ${step.id}`);
      this.eventBus.emit('stepCompleted', { step });

    } catch (error: any) {
      step.status = 'failed';
      step.error = error.message;
      step.endTime = new Date();

      logger.error(`[TaskEngine] Step failed: ${step.id}`, error);
      this.eventBus.emit('stepFailed', { step, error });

      throw error;
    }
  }

  /**
   * Execute an LLM step using registered LLMTaskRunner
   */
  private async executeLLMStep(step: TaskStep, context: Record<string, any>): Promise<Record<string, any>> {
    const executor = this.registry.llmExecutors.get(step.executorId);
    if (!executor) {
      throw new Error(`LLM executor ${step.executorId} not found`);
    }

    const prompt = step.input.prompt || '';
    const metadata = { ...step.input.metadata, context };

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
  private async executePluginStep(step: TaskStep, context: Record<string, any>): Promise<Record<string, any>> {
    const executor = this.registry.pluginExecutors.get(step.executorId);
    if (!executor) {
      throw new Error(`Plugin executor ${step.executorId} not found`);
    }

    // For now, return a mock response - will be implemented when PluginHost is enhanced
    logger.warn(`[TaskEngine] Plugin execution is stubbed for: ${step.executorId}`);

    return {
      result: `Plugin ${step.executorId} executed successfully`,
      input: step.input,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute a system step (filesystem, API calls, etc.)
   */
  private async executeSystemStep(step: TaskStep, context: Record<string, any>): Promise<Record<string, any>> {
    // For now, return a mock response - system execution will be implemented in DevShell
    logger.warn(`[TaskEngine] System execution is stubbed for: ${step.executorId}`);

    return {
      result: `System command ${step.executorId} executed successfully`,
      input: step.input,
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