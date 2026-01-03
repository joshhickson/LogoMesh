> **Status:** ACTIVE
> **Type:** Log
> **Context:**
> *   [2026-01-03]: Session log for setting up and testing the Green Agent on Lambda Cloud (H100).

# Session Log: Lambda Instance Setup (2026-01-03)

## Objectives
1.  Execute `20260101-Lambda-Test-Protocol.md`.
2.  Deploy Green Agent on H100.
3.  Verify `vLLM` with `Qwen/Qwen2.5-Coder-32B-Instruct`.
4.  Run `debugdump` scenario.

## Log
*   **04:30**: Connected to H100 instance.
*   **04:35**: Verified Docker and Nvidia drivers.
*   **04:40**: Installed `nvidia-container-toolkit` and configured Docker runtime.
*   **04:45**: Successfully built `polyglot-agent:latest` Docker image (GPU enabled).
*   **04:50**: Confirmed model choice: `Qwen/Qwen2.5-Coder-32B-Instruct`.
*   **04:55**: Started `vLLM` container (downloading dependencies and model).
*   **05:00**: Started `green-agent` and `purple-agent` containers (downloading dependencies).
*   **05:12**: `vllm-server` startup complete. Model `Qwen/Qwen2.5-Coder-32B-Instruct` serving on port 8000.
*   **05:15**: **Troubleshooting**: `green-agent` failed with `IndentationError` in `src/green_logic/server.py`.
    *   *Action*: Patched `server.py` to fix indentation.
    *   *Action*: Rebuilt `polyglot-agent:latest` image.
*   **05:25**: **Troubleshooting**: Agents failed with `OpenAIError: The api_key client option must be set`.
    *   *Action*: Restarted containers with `OPENAI_BASE_URL=http://localhost:8000/v1` and `OPENAI_API_KEY=EMPTY`.
*   **05:35**: **Troubleshooting**: `green-agent` failed with `[Errno 98] Address already in use`.
    *   *Action*: Identified zombie process holding port 9000. Force removed containers and restarted.
*   **05:40**: **Success**: Verified `green-agent` (Port 9000) and `purple-agent` (Port 9001) are running and listening.
*   **05:45**: **Troubleshooting**: `green-agent` failed to parse Purple Agent's response (JSON decode error).
    *   *Action*: Patched `server.py` to strip Markdown code blocks before parsing JSON.
    *   *Action*: Rebuilt `polyglot-agent:latest` image.
*   **05:55**: **Observation**: "NVIDIA Driver not detected" warning in agent logs.
    *   *Analysis*: Agents are running as API clients (CPU-only) connecting to `vllm-server` (GPU). Warning is expected from CUDA base image but harmless for client logic.
*   **06:45**: **Troubleshooting**: `green-agent` failed to parse Purple Agent's response (JSON decode error).
    *   *Action*: Patched `server.py` to correctly extract text from A2A protocol structure (`result.status.message.parts[0].text`).
    *   *Action*: Rebuilt `polyglot-agent:latest` image.
*   **07:00**: **Success**: Executed "Iron Sharpens Iron" loop (Battle ID: `test-009`).
    *   **Task**: Rate Limiter.
    *   **Result**: Purple Agent generated valid code. Green Agent evaluated it with CIS Score **0.83**.

## Technical Details: Code Fixes
To achieve operational stability, the following changes were applied to `src/green_logic/server.py`:

1.  **Indentation Fix**: Corrected a Python indentation error in the `send_coding_task` endpoint logic.
2.  **Markdown Stripping**: Added logic to strip Markdown code block markers (```json ... ```) from the Purple Agent's response before parsing.
3.  **A2A Protocol Path Correction**: Updated the JSON extraction path to match the actual A2A protocol response structure.
    *   *Old Path*: `purple_result.get("result", {}).get("message", {})...`
    *   *New Path*: `purple_result.get("result", {}).get("status", {}).get("message", {})...`

## Next Steps
*   Run `debugdump` scenario if required.
*   Proceed with full evaluation suite.

