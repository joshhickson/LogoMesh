---
status: ACTIVE
type: Log
created: 2026-01-10
context: Operations / Testing / Green Agent Evaluation
---

# Evaluation Log: Green Agent (2026-01-10)

> **Context:**
> *   [2026-01-10]: Executing `20260109-Evaluation-Tasklist.md` to verify Green Agent functionality.

## 1. Environment Setup

### 1.1 Docker Status
*   **Status:** ✅ **PASS** (Manually Fixed)
*   **Notes:** Fixed permissions via `sudo chmod 666 /var/run/docker.sock`. Docker is now accessible without sudo.

### 1.2 GPU Access
*   **Status:** ✅ **PASS**
*   **Notes:** NVIDIA A100 detected. `nvidia-smi` successful.

### 1.3 API Keys / vLLM
*   **Status:** ✅ **PASS** (Manually Fixed)
*   **Root Cause:** The expected `.env` file was missing. This stops the agent from knowing where to find the LLM (vLLM or OpenAI).
*   **Action Taken:** Created `.env` manually with local vLLM settings (`OPENAI_API_KEY=EMPTY`).
*   **Recommendation for Future:** Setup scripts should check for `.env` and prompt to copy `.env.example` if missing.

## 2. Dependency Verification

### 2.1 Package Installation
*   **Status:** ✅ **PASS**
*   **Notes:** `uv` installed via pip. `uv sync --python 3.11` completed successfully.

### 2.2 Sentence Transformers
*   **Status:** ✅ **PASS**
*   **Notes:** `sentence_transformers` package verified in `.venv`.

## 3. Functional Testing (Session 1 - Pre-Merge)

### 3.1 Basic Connectivity
*   **Status:** ✅ **PASS**
*   **Notes:** Server started on port 9040. `curl` to `/docs` returned 200 OK.
*   **Context:** Tests are being executed in a standard background shell for reliability, not inside the `tmux` session. The `tmux` session remains available for human team collaboration.

### 3.2 Agent-to-Agent (A2A) Protocol
*   **Status:** ✅ **PASS**
*   **Notes:**
    *   Created `mock_purple.py` (FastAPI) to simulate Defender response on port 9041.
    *   Green Agent successfully sent task to Mock Purple Agent.
    *   Mock Purple Agent returned valid JSON-RPC response.
    *   Green Agent processed the response.
    *   **Observation:** Scoring failed (`Connection error`) because vLLM is not running. Protocol itself is verified.

### 3.3 Multi-File Support
*   **Status:** ✅ **PASS**
*   **Notes:**
    *   Sent request with `files` payload (`main.py`, `test_main.py`).
    *   Green Agent recognized it as "User Provided Task".
    *   Mock Purple Agent responded.

## 4. Infrastructure Preparation

### 4.1 Docker Build
*   **Status:** ✅ **PASS**
*   **Notes:** Built `polyglot-agent:latest` successfully.

### 4.2 vLLM Launch & Model Download
*   **Status:** ⚠️ **WARNING**
*   **Notes:**
    *   Attempted to launch `Qwen/Qwen2.5-Coder-32B-Instruct` (BF16).
    *   **Error:** `CUDA out of memory`. GPU has 40GB, model requires ~64GB.
    *   **Correction:** Switching to **`Qwen/Qwen2.5-Coder-32B-Instruct-AWQ`** (4-bit Quantized) to fit in 40GB VRAM.

### 4.3 vLLM Retry (AWQ)
*   **Status:** ✅ **PASS**
*   **Notes:**
    *   Launched `Qwen/Qwen2.5-Coder-32B-Instruct-AWQ`.
    *   Quantization: `awq_marlin`.
    *   Context Length: `16384` (Successful so far).
    *   Status: Loading model weights.

---

## 5. Session 2: Post-Merge Verification (Planned)

**Objective:** Verify the new "Aeduee" Pull Request changes, specifically the Runtime Sandbox (Docker + File Injection) and Authoritative Grading (DBOM + Vector Math).

### 5.1 Updated Connectivity Check
*   [ ] **Verify Ports:** Green Agent should now be on **Port 9000** (previously 9040).
*   [ ] **Verify Script:** `sudo ./scripts/bash/launch_arena.sh` runs successfully.

### 5.2 Manual Task Override
*   [ ] **Action:** Modify `src/green_logic/server.py` to force Task 004 (Fibonacci).
*   [ ] **Verify:** Send request -> Logs show "Fibonacci" task selected.

### 5.3 Grading Integrity (The "Iron Sharpens Iron" Test)
*   [ ] **Vector Math:** Check logs for `[VectorScorer]` loading `all-MiniLM-L6-v2`.
*   [ ] **Sandbox Isolation:**
    *   [ ] Verify logs show "File Injection" (no volume mounts).
    *   [ ] Verify score is **capped at 0.5** if the code fails execution (Simulate a failure if possible).
*   [ ] **DBOM Generation:**
    *   [ ] Check `data/dboms/` for JSON file.
    *   [ ] Check `data/battles.db` for corresponding hash.

### 5.4 Notes & Observations
*   *(Log outcomes here during the session)*
