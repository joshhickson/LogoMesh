import express from 'express';
import { A2ATaskPayload, A2ASubmissionPayload } from '@logomesh/contracts';

const app = express();
app.use(express.json());

const PORT = 3002; // Use a different port from our main server

app.post('/a2a', (req, res) => {
const task = req.body as A2ATaskPayload;
console.log(`[Mock Agent] Received task: ${task.requirement}`);

// Return a canned, predictable response
const submission: A2ASubmissionPayload = {
taskId: task.taskId,
sourceCode: 'const server = express();',
testCode: 'describe("server", () => { it("should run", () => expect(true).toBe(true)); });',
rationale: 'A simple and effective implementation.',
};

res.status(200).json(submission);
});

app.listen(PORT, () => {
console.log(`[Mock Agent] Listening on http://localhost:${PORT}`);
});
