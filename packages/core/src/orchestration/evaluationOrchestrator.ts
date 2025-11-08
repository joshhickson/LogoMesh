import {
  StorageAdapter,
  A2ATaskPayload,
  Evaluation,
  ReasoningStep,
} from '@logomesh/contracts';
import { A2AClient } from '../services/a2aClient';
import { RationaleDebtAnalyzer } from '../analysis/rationaleDebtAnalyzer';
import { ArchitecturalDebtAnalyzer } from '../analysis/architecturalDebtAnalyzer';
import { TestingDebtAnalyzer } from '../analysis/testingDebtAnalyzer';
import { ulid } from 'ulid';
import { evaluationEvents } from '../events';

/**
 * The EvaluationOrchestrator is the core logic for the Green Agent.
 * It manages the entire process of evaluating a Purple Agent.
 */
export class EvaluationOrchestrator {
  // In-memory store for evaluation results for the E2E test.
  // In a real system, this would be in a persistent database.
  private evaluationResults = new Map<string, Evaluation>();

  constructor(
    private storageAdapter: StorageAdapter,
    private a2aClient: A2AClient,
    private rationaleAnalyzer: RationaleDebtAnalyzer,
    private archAnalyzer: ArchitecturalDebtAnalyzer,
    private testAnalyzer: TestingDebtAnalyzer,
  ) {
    // Listen for the start event to perform the evaluation asynchronously.
    evaluationEvents.on(
      'evaluation:start',
      this._performEvaluation.bind(this),
    );
  }

  /**
   * Kicks off a new evaluation workflow. This method returns immediately.
   * @param purpleAgentEndpoint The endpoint of the agent to be evaluated.
   * @returns The ID of the newly created evaluation.
   */
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

    // Store the initial state
    this.evaluationResults.set(evaluationId, initialEvaluation);

    // Emit an event to start the actual processing in the background.
    evaluationEvents.emit('evaluation:start', evaluationId, purpleAgentEndpoint);

    return evaluationId;
  }

  /**
   * Retrieves the current state of an evaluation.
   * @param evaluationId The ID of the evaluation to fetch.
   * @returns The Evaluation record.
   */
  async getEvaluation(evaluationId: string): Promise<Evaluation | undefined> {
    return this.evaluationResults.get(evaluationId);
  }

  /**
   * The private, long-running evaluation process.
   */
  private async _performEvaluation(
    evaluationId: string,
    purpleAgentEndpoint: string,
  ) {
    try {
      // 1. Fetch task and create initial record (already done in startEvaluation)
      const thoughts = await this.storageAdapter.getAllThoughts();
      const taskThought = thoughts[0];
      if (!taskThought) throw new Error('No task thought found.');

      // 2. Use A2AClient to send the task and receive the submission.
      const taskPayload: A2ATaskPayload = {
        taskId: evaluationId,
        requirement: taskThought.description || taskThought.title,
      };
      const submission = await this.a2aClient.sendTask(
        purpleAgentEndpoint,
        taskPayload,
      );

      // This is a placeholder for the multi-step trace. In a real scenario,
      // the submission itself would contain this trace.
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


      // 4. Pass the payload to the three Analyzer services in parallel.
      const [rationaleResult, archResult, testResult] = await Promise.all([
        this.rationaleAnalyzer.analyze(reasoningTrace),
        this.archAnalyzer.analyze(submission.sourceCode),
        this.testAnalyzer.analyze(submission.sourceCode, submission.testCode),
      ]);

      // 5. Aggregate scores and create the final report.
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

      // 6. Update the record and emit completion event.
      this.evaluationResults.set(evaluationId, finalEvaluation);
      evaluationEvents.emit('evaluation:complete', finalEvaluation);
    } catch (error) {
      console.error(`Evaluation ${evaluationId} failed:`, error);
      const errorEvaluation: Evaluation = {
        id: evaluationId,
        status: 'error',
        contextualDebtScore: null,
        report: null,
        createdAt: this.evaluationResults.get(evaluationId)!.createdAt,
        completedAt: new Date(),
      };
      this.evaluationResults.set(evaluationId, errorEvaluation);
      evaluationEvents.emit('evaluation:error', errorEvaluation);
    }
  }
}
