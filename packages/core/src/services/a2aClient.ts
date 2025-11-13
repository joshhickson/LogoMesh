import { A2ATaskPayload, A2ASubmissionPayload } from '@logomesh/contracts';

// We will use a standard fetch client for this.
// Ensure 'node-fetch' or a similar library is added as a dependency if needed for your Node version.

export class A2AClient {
  async sendTask(
    purpleAgentEndpoint: string,
    task: A2ATaskPayload
  ): Promise<A2ASubmissionPayload> {
    try {
      const response = await fetch(purpleAgentEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error(`A2A request failed with status: ${response.status}`);
      }

      const submission = (await response.json()) as A2ASubmissionPayload;

      // Basic validation
      if (submission.taskId !== task.taskId) {
        throw new Error('Received submission for the wrong task ID.');
      }

      return submission;
    } catch (error) {
      console.error(`Failed to communicate with Purple Agent at ${purpleAgentEndpoint}`, error);
      // Re-throw the original error to preserve specific details for the caller
      throw error;
    }
  }
}
