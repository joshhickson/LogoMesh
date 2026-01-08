---
status: ACTIVE
type: Plan
---
> **Context:**
> *   [2026-01-01]: Protocol for the first end-to-end test of the Polyglot Agent on Lambda Cloud.

# Lambda Cloud Test Protocol (2026-01-01)

## Executive Summary
This document outlines the step-by-step protocol for executing the first "Green Agent" test run on Lambda Cloud infrastructure. The goal is to verify that the containerized agent can boot, accept the A2A protocol handshake, and execute a basic scenario (`debugdump`) on an H100 GPU instance.

---

## 1. Pre-Flight Verification (Local)

Before renting the instance, ensure the Docker image is ready.

1.  **Build the Image:**
    ```bash
    docker build -t polyglot-agent:latest -f Dockerfile.gpu .
    ```
2.  **Verify Entrypoint:**
    ```bash
    docker run --rm polyglot-agent:latest --help
    ```
    *Expectation:* Output should show arguments for `--role {GREEN,PURPLE,RED}`.

---

## 2. Infrastructure Setup (Lambda Cloud)

1.  **Instance Selection:**
    *   **Region:** us-east-1 (or cheapest available).
    *   **Type:** 1x H100 (80GB VRAM) or A100 (80GB VRAM).
    *   **OS:** Ubuntu 22.04 LTS.

2.  **Environment Setup (On Instance):**
    *   SSH into the instance: `ssh ubuntu@<ip>`
    *   Install Docker (if not present):
        ```bash
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        ```
    *   Install Nvidia Container Toolkit (Crucial for GPU access):
        ```bash
        sudo apt-get install -y nvidia-container-toolkit
        sudo nvidia-ctk runtime configure --runtime=docker
        sudo systemctl restart docker
        ```

---

## 3. Deployment & Execution

1.  **Transfer Code (or Pull Image):**
    *   *Option A (Git):* Clone the repo.
    *   *Option B (SCP):* `scp -r . ubuntu@<ip>:~/agent-arena`
    *   *Recommended:* Build locally and push to GHCR, then pull on Lambda.

2.  **Run the Green Agent (Server):**
    ```bash
    docker run --gpus all \
      -p 8000:8000 \
      --name green-agent \
      polyglot-agent:latest \
      --role GREEN \
      --port 8000
    ```

3.  **Run the Rationale Worker:**
    ```bash
    docker run -d --name rationale-worker --network host \
      -e LLM_API_BASE_URL=http://localhost:8000/v1 \
      -e LLM_API_KEY=EMPTY \
      -e LLM_MODEL_NAME=Qwen/Qwen2.5-Coder-32B-Instruct \
      polyglot-agent:latest \
      pnpm start:rationale
    ```

4.  **Run the Purple Agent (Client/Test Subject):**
    *   Open a second SSH terminal.
    *   Run the Purple Agent to connect to the Green Agent:
    ```bash
    docker run --network host \
      polyglot-agent:latest \
      --role PURPLE \
      --target-url http://localhost:8000
    ```

---

## 4. Success Criteria

*   [ ] **Handshake:** Green Agent logs show "New session started."
*   [ ] **Task Execution:** Purple Agent receives a task (from `debugdump` scenario).
*   [ ] **Completion:** Green Agent logs "Evaluation Complete" and prints a score.
*   [ ] **GPU Usage:** Run `watch -n 1 nvidia-smi` during inference to confirm the GPU is being utilized by `vLLM`.

---

## 5. Troubleshooting

*   **Error:** `CUDA out of memory`.
    *   **Fix:** Reduce `gpu_memory_utilization` in `src/green_logic/agent.py` (Default is 0.9).
*   **Error:** `Connection refused`.
    *   **Fix:** Ensure `--network host` is used or ports are correctly mapped. Check `ufw` firewall settings on Lambda.
