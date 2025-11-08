import {
  StorageAdapter,
  A2ATaskPayload,
  Evaluation,
  ReasoningStep,
  RationaleDebtReport,
  EvaluationReport,
} from '@logomesh/contracts';
import { A2AClient } from '../services/a2aClient';
import { ulid } from 'ulid';
import { Queue, FlowProducer, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null
});

/**
 * The EvaluationOrchestrator is the core logic for the Green Agent.
 * It manages the entire process of evaluating a Purple Agent by dispatching
 * analysis tasks to a distributed network of workers.
 */
export class EvaluationOrchestrator {
  private evaluationResults = new Map<string, Evaluation>();
  private flowProducer: FlowProducer;
  private aggregatorWorker: Worker;

  constructor(
    private storageAdapter: StorageAdapter,
    private a2aClient: A2AClient,
  ) {
    this.flowProducer = new FlowProducer({ connection });

    // This worker's job is to listen for the completion of the entire evaluation flow.
    // When the parent job (the flow) is complete, this worker aggregates the results
    // from all the child jobs (the individual analyses).
    this.aggregatorWorker = new Worker('evaluation-flow', async (job) => {
      const { evaluationId } = job.data;
      console.log(`[Orchestrator] Aggregating results for evaluation ${evaluationId}...`);

      const childrenValues = await job.getChildrenValues();

      const rationaleResult = childrenValues.rationale;
      const archResult = childrenValues.architectural;
      const testResult = childrenValues.testing;

      const totalScore =
        (rationaleResult.overallScore + archResult.score + testResult.score) / 3;

      const finalEvaluation: Evaluation = {
        id: evaluationId,
        status: 'complete',
        contextualDebtScore: parseFloat(totalScore.toFixed(2)),
        report: {
          rationaleDebt: rationaleResult,
          architecturalCoherenceDebt: archResult,
          testingVerificationDebt: testResult,
        },
        createdAt: this.evaluationResults.get(evaluationId)!.createdAt,
        completedAt: new Date(),
      };

      this.evaluationResults.set(evaluationId, finalEvaluation);
      console.log(`[Orchestrator] Evaluation ${evaluationId} complete.`);
    }, { connection });
  }

  async startEvaluation(purpleAgentEndpoint: string): Promise<string> {
    const evaluationId = ulid();
    const initialEvaluation: Evaluation = {
      id: evaluationId,
      status: 'running',
      contextualDebtScore: null,
      report: null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.evaluationResults.set(evaluationId, initialEvaluation);

    // This doesn't need to be awaited. We kick off the background job and return.
    this._performEvaluation(evaluationId, purpleAgentEndpoint);

    return evaluationId;
  }

  async getEvaluation(evaluationId: string): Promise<Evaluation | undefined> {
    return this.evaluationResults.get(evaluationId);
  }

  private async _performEvaluation(
    evaluationId: string,
    purpleAgentEndpoint: string,
  ) {
    try {
      // 1. Fetch task and agent submission
      const thoughts = await this.storageAdapter.getAllThoughts();
      const taskThought = thoughts[0];
      if (!taskThought) throw new Error('No task thought found.');

      const taskPayload: A2ATaskPayload = {
        taskId: evaluationId,
        requirement: taskThought.description || taskThought.title,
      };
      const submission = await this.a2aClient.sendTask(
        purpleAgentEndpoint,
        taskPayload,
      );

      const reasoningTrace: readonly ReasoningStep[] = [
        {
          stepIndex: 0,
          goal: 'Implement the feature.',
          consumedContext: [{ id: ulid(), source: 'memory', content: 'irrelevant context'}],
          rationale: submission.rationale,
          action: { toolName: 'writeFile', toolInput: '...'},
          actionResult: 'ok'
        }
      ];

      // 2. Create a flow of analysis jobs.
      // The parent job ('evaluation-flow') will only complete after all its
      // children have completed successfully.
      await this.flowProducer.add({
        name: 'evaluation-flow',
        queueName: 'evaluation-flow',
        data: { evaluationId },
        children: [
          {
            name: 'rationale-job',
            queueName: 'rationale-analysis',
            data: { evaluationId, steps: reasoningTrace },
            opts: {
              jobId: `${evaluationId}-rationale`,
            }
          },
          {
            name: 'architectural-job',
            queueName: 'architectural-analysis',
            data: { evaluationId, sourceCode: submission.sourceCode },
             opts: {
              jobId: `${evaluationId}-architectural`,
            }
          },
          {
            name: 'testing-job',
            queueName: 'testing-analysis',
            data: {
              evaluationId,
              sourceCode: submission.sourceCode,
              testCode: submission.testCode,
            },
             opts: {
              jobId: `${evaluationId}-testing`,
            }
          },
        ],
      });
    } catch (error) {
      console.error(`Evaluation ${evaluationId} failed to start:`, error);
      const errorEvaluation: Evaluation = {
        id: evaluationId,
        status: 'error',
        contextualDebtScore: null,
        report: null,
        createdAt: this.evaluationResults.get(evaluationId)!.createdAt,
        completedAt: new Date(),
      };
      this.evaluationResults.set(evaluationId, errorEvaluation);
    }
  }
}
