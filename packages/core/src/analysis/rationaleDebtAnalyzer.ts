import { EvaluationReport } from '@logomesh/contracts';

// A simplified interface for a local LLM client (e.g., Ollama)
interface LlmClient {
  prompt(systemMessage: string, userMessage: string): Promise<string>;
}

export class RationaleDebtAnalyzer {
  private llmClient: LlmClient;

  constructor(llmClient: LlmClient) {
    this.llmClient = llmClient;
  }

  async analyze(rationale: string): Promise<EvaluationReport> {
    const systemMessage = `
      You are an expert software architect. Your task is to evaluate a rationale provided
      by an AI agent for a piece of code it generated. Score the rationale from 0.0 (high debt)
      to 1.0 (low debt) based on its clarity, completeness, and discussion of trade-offs
      and edge cases. Respond ONLY with a JSON object in the format:
      { "score": number, "details": "string" }
    `;

    const responseJson = await this.llmClient.prompt(systemMessage, rationale);

    try {
      // Basic validation, will need to be more robust
      const result = JSON.parse(responseJson);
      return result as EvaluationReport;
    } catch (error) {
      console.error("Failed to parse LLM response for rationale analysis:", error);
      return { score: 0.0, details: "Failed to analyze rationale due to an internal error." };
    }
  }
}
