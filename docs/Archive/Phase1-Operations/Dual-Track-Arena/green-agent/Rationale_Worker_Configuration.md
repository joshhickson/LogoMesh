# Rationale Worker Configuration

This document explains how to configure the Rationale Worker to use an LLM provider (like OpenAI or a local vLLM instance) for analyzing "Rationale Debt".

## Overview

The `rationale-worker` is a background process that consumes analysis tasks from the `rationale-analysis` queue. It uses a Large Language Model (LLM) to evaluate the reasoning steps of an AI agent and detect potential flaws or "debt".

Previously, this worker used a mock client. It has now been upgraded to use a real HTTP-based LLM client (`OpenAiLlmClient`).

## Configuration

The worker is configured via environment variables.

| Variable | Description | Default | Example (vLLM) |
| :--- | :--- | :--- | :--- |
| `LLM_API_BASE_URL` | The base URL of the LLM API. | `https://api.openai.com/v1` | `http://localhost:8000/v1` |
| `LLM_API_KEY` | The API key for authentication. | `""` (Empty string) | `EMPTY` (for local vLLM) |
| `LLM_MODEL_NAME` | The name of the model to use. | `gpt-4o` | `Qwen/Qwen2.5-Coder-32B-Instruct-AWQ` |

## Connection Examples

### 1. Connecting to Local vLLM (Competition Standard)

This is the standard configuration for the AgentX competition, running a local model on the GPU instance.

```bash
export LLM_API_BASE_URL="http://localhost:8000/v1"
export LLM_API_KEY="EMPTY"
export LLM_MODEL_NAME="Qwen/Qwen2.5-Coder-32B-Instruct-AWQ"

# Start the worker
pnpm start:rationale
```

### 2. Connecting to OpenAI

Useful for development or testing if you don't have a local GPU.

```bash
export LLM_API_BASE_URL="https://api.openai.com/v1"
export LLM_API_KEY="sk-..."
export LLM_MODEL_NAME="gpt-4o"

# Start the worker
pnpm start:rationale
```

## How it Works

1.  The `rationale-worker` initializes the `OpenAiLlmClient` using the environment variables.
2.  When a job is received, it constructs a prompt containing the agent's goal, consumed context, and rationale.
3.  It sends this prompt to the configured LLM API.
4.  The LLM evaluates the rationale and returns a JSON object indicating if debt was incurred.
5.  The worker parses this response and returns a `RationaleDebtReport`.

## Troubleshooting

*   **Connection Refused:** Ensure your vLLM server is running and accessible at the `LLM_API_BASE_URL`.
*   **401 Unauthorized:** Check your `LLM_API_KEY`. For local vLLM, use "EMPTY".
*   **Model Not Found:** Ensure `LLM_MODEL_NAME` matches the model loaded in vLLM (check vLLM logs).
