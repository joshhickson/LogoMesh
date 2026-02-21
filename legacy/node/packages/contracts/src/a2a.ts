/**
 * The standardized payload our Green Agent sends to a Purple Agent.
 * It contains the software requirement.
 */
export interface A2ATaskPayload {
  readonly taskId: string;
  readonly requirement: string; // e.g., "Implement a user authentication endpoint with JWT"
}

/**
 * The standardized payload a Purple Agent sends back to our Green Agent.
 */
export interface A2ASubmissionPayload {
  readonly taskId: string;
  readonly sourceCode: string;
  readonly testCode?: string;
  readonly rationale: string;
}
