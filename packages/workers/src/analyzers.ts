import {
  ReasoningStep,
  DebtEvent,
  RationaleDebtReport,
  EvaluationReport,
  ArchitecturalDebtReport,
} from '@logomesh/contracts';
import { analyse as escomplexAnalyse } from 'escomplex';

// A simplified interface for a local LLM client (e.g., Ollama)
interface LlmClient {
  prompt(systemMessage: string, userMessage: string): Promise<string>;
}

export class RationaleDebtAnalyzer {
  private llmClient: LlmClient;

  constructor(llmClient: LlmClient) {
    this.llmClient = llmClient;
  }

  async analyze(
    steps: readonly ReasoningStep[],
  ): Promise<RationaleDebtReport> {
    const debtTrace: DebtEvent[] = [];

    for (const step of steps) {
      const systemMessage = `
        You are an expert software architect and AI evaluator. Your task is to analyze a single
        step from an AI agent's reasoning process. The agent was given a goal and a set of
        context items. Based on its rationale, it chose to use a specific tool.

        Your job is to determine if the agent's rationale was flawed *due to a specific piece
        of irrelevant or misleading context*.

        - If the rationale is sound and uses the correct context, respond with: { "debtIncurred": false }
        - If the rationale is flawed because it relies on a bad piece of context, respond with:
          {
            "debtIncurred": true,
            "incurredByContextId": "ULID of the bad context item",
            "debtScore": <a score from 0.0 (no debt) to 1.0 (max debt) for this step>,
            "details": "A brief explanation of why this context led to a flawed rationale."
          }

        Respond ONLY with the JSON object. Do not add any extra commentary.
      `;

      // For this analysis, we need to provide the LLM with the full context of the step.
      const userMessage = `
        Goal: ${step.goal}
        Consumed Context: ${JSON.stringify(step.consumedContext, null, 2)}
        Rationale: ${step.rationale}
      `;

      const responseJson = await this.llmClient.prompt(
        systemMessage,
        userMessage,
      );

      try {
        const result = JSON.parse(responseJson);
        if (result.debtIncurred) {
          debtTrace.push({
            stepIndex: step.stepIndex,
            incurredByContextId: result.incurredByContextId,
            debtScore: result.debtScore,
            details: result.details,
          });
        }
      } catch (error) {
        console.error(
          `Failed to parse LLM response for step ${step.stepIndex}:`,
          error,
        );
        // Optionally, add a debt event to signify an analysis failure
        debtTrace.push({
          stepIndex: step.stepIndex,
          incurredByContextId: 'SYSTEM_ERROR',
          debtScore: 1.0,
          details: 'Failed to analyze this step due to an internal error.',
        });
      }
    }

    // Aggregate the scores. For now, a simple average.
    // A score of 0.0 means high debt, so we invert the average.
    const totalDebt = debtTrace.reduce((sum, event) => sum + event.debtScore, 0);
    const overallScore =
      debtTrace.length > 0 ? 1.0 - totalDebt / debtTrace.length : 1.0;

    return {
      overallScore,
      trace: debtTrace,
    };
  }
}


import { analyse } from 'escomplex';
import { ArchitecturalDebtReport } from '@logomesh/contracts';

export class ArchitecturalDebtAnalyzer {
  async analyze(sourceCode: string): Promise<ArchitecturalDebtReport> {
    try {
      const report = escomplexAnalyse(sourceCode);

      // Normalize the maintainability score (higher is better, max ~171) to our 0.0-1.0 scale.
      // We'll cap the score at 171 to prevent scores > 1.0.
      const normalizedScore = Math.min(report.maintainability, 171) / 171;

      let details = `Maintainability score is ${report.maintainability.toFixed(
        2,
      )}.`;
      if (report.aggregate.cyclomatic > 10) {
        details += ` High cyclomatic complexity (${report.aggregate.cyclomatic}) detected, suggesting complex and potentially hard-to-maintain logic.`;
      } else {
        details += ' Code complexity is within acceptable limits.';
      }

      return {
        score: normalizedScore,
        details,
        metrics: report,
      };
    } catch (error: any) {
      // If escomplex fails (e.g., syntax error), return a high-debt report.
      const errorMessage = error.message || 'Unknown error';
      const match = errorMessage.match(/line (\d+)/i);
      const line = match ? parseInt(match[1], 10) : 'N/A';

      return {
        score: 0.0,
        details: `Static analysis failed. Could not parse the source code. Error at line ${line}: ${errorMessage}`,
        metrics: null,
      };
    }
  }
}

export class TestingDebtAnalyzer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async analyze(
    sourceCode: string,
    testCode?: string
  ): Promise<EvaluationReport['testingVerificationDebt']> {
    if (!testCode || testCode.trim() === '') {
      return {
        score: 0.0,
        details: 'No tests were provided.',
      };
    }

    const hasEdgeCaseTests = /edge case|invalid|null|undefined|error/i.test(testCode);

    if (!hasEdgeCaseTests) {
      return {
        score: 0.6,
        details: 'Tests cover the happy path, but no explicit tests for edge cases were found.',
      };
    }

    return {
      score: 0.9,
      details: 'Unit tests cover happy path and appear to consider edge cases.',
    };
  }
}
