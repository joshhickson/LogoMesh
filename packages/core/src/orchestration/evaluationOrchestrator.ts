import { StorageAdapter, A2ATaskPayload, Evaluation } from '@logomesh/contracts';
import { A2AClient } from '../services/a2aClient';
import { RationaleDebtAnalyzer } from '../analysis/rationaleDebtAnalyzer';
import { ArchitecturalDebtAnalyzer } from '../analysis/architecturalDebtAnalyzer';
import { TestingDebtAnalyzer } from '../analysis/testingDebtAnalyzer';
import { ulid } from 'ulid';

/**
 * The EvaluationOrchestrator is the core logic for the Green Agent.
 * It manages the entire process of evaluating a Purple Agent.
 */
export class EvaluationOrchestrator {
  constructor(
    private storageAdapter: StorageAdapter,
    private a2aClient: A2AClient,
    private rationaleAnalyzer: RationaleDebtAnalyzer,
    private archAnalyzer: ArchitecturalDebtAnalyzer,
    private testAnalyzer: TestingDebtAnalyzer
  ) {}

  /**
   * Runs a full evaluation workflow against a given Purple Agent.
   * @param purpleAgentEndpoint The endpoint of the agent to be evaluated.
   * @returns The final Evaluation record with score and report.
   */
  async runEvaluation(purpleAgentEndpoint: string): Promise<Evaluation> {
    // 1. Fetch a task "thought" from the database.
    // For the MVP, we'll assume there's a single task thought to retrieve.
    const thoughts = await this.storageAdapter.getAllThoughts();
    const taskThought = thoughts[0];
    if (!taskThought) {
      throw new Error('No task thought found in the database to issue.');
    }

    // 2. Create an initial Evaluation record in the database.
    const evaluationId = ulid();
    // This is a placeholder; in a real system, we'd create this record in the DB.
    let evaluation: Evaluation = {
      id: evaluationId,
      status: 'running',
      contextualDebtScore: null,
      report: null,
      createdAt: new Date(),
      completedAt: null,
    };

    // 3. Use A2AClient to send the task and receive the submission.
    const taskPayload: A2ATaskPayload = {
      taskId: evaluationId,
      requirement: taskThought.description || taskThought.title,
    };
    const submission = await this.a2aClient.sendTask(
      purpleAgentEndpoint,
      taskPayload
    );

    // 4. Pass the payload to the three Analyzer services in parallel.
    const [rationaleResult, archResult, testResult] = await Promise.all([
      this.rationaleAnalyzer.analyze(submission.rationale),
      this.archAnalyzer.analyze(submission.sourceCode),
      this.testAnalyzer.analyze(submission.sourceCode, submission.testCode),
    ]);

    // 5. Aggregate scores and store the final report.
    const totalScore = (rationaleResult.score + archResult.score + testResult.score) / 3;

    evaluation = {
      ...evaluation,
      status: 'complete',
      contextualDebtScore: parseFloat(totalScore.toFixed(2)),
      report: {
        rationaleDebt: rationaleResult,
        architecturalCoherenceDebt: archResult,
        testingVerificationDebt: testResult,
      },
      completedAt: new Date(),
    };

    // 6. Update the Evaluation record in the database (placeholder).
    // await this.storageAdapter.updateEvaluation(evaluation);

    return evaluation;
  }
}
