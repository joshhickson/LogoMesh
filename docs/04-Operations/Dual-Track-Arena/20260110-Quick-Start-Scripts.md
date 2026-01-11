---
status: ACTIVE
type: Guide
created: 2026-01-10
context: Operations / Quick Start
---

# Quick Start: Runnable Scripts & Commands

This table serves as the master reference for all operational scripts in the `scripts/bash/` directory.

> **Requirement:** All scripts must be run from the **repo root** (e.g., `sudo ./scripts/bash/launch_arena.sh`).
> **OS:** Ubuntu (Lambda Cloud).

## 🛑 Step 0: Prerequisites (Run Once)

Before running any scripts, you must configure the environment and install dependencies.

```bash
# 1. Create Environment Config
# Copilot/Agents: Do not skip this. The system fails without an .env file.
cp .env.example .env

# 2. Install Dependencies
# This project uses 'uv' for package management.
pip install uv
uv sync --python 3.11
```

## 🚀 Core Scripts

| Script Name | Command | Description | Ports Used |
| :--- | :--- | :--- | :--- |
| **Launch Arena** | `sudo ./scripts/bash/launch_arena.sh` | **The "Big Red Button".**<br>1. Builds Docker image (`polyglot-agent:latest`).<br>2. Cleans old containers.<br>3. Starts vLLM (Brain), Green Agent (Judge), Purple Agent (Defender). | `8000` (Brain)<br>`9000` (Judge)<br>`9001` (Defender) |
| **Test Agents** | `sudo ./scripts/bash/test_agents.sh` | **The "Smoke Test".**<br>Sends a sample `curl` request to the Green Agent (`:9000`) to verify the full A2A loop is working. | N/A |

## 🔍 Monitoring & Logs

Use these commands to check the health of the system.

| Target | Command | Expected Output |
| :--- | :--- | :--- |
| **vLLM (Brain)** | `sudo docker logs -f vllm-server` | Wait for: `Application startup complete`.<br>*(Takes ~2-3 mins)* |
| **Green Agent** | `sudo docker logs -f green-agent` | Watch for: `[GreenAgent] Result saved to data/battles.db`. |
| **Purple Agent** | `sudo docker logs -f purple-agent` | Watch for: `Generating solution...` |
| **Container Status** | `sudo docker ps` | Should list 3 containers: `vllm-server`, `green-agent`, `purple-agent`. |

## 🛠️ Maintenance

| Task | Command | Notes |
| :--- | :--- | :--- |
| **Kill All** | `sudo docker rm -f vllm-server green-agent purple-agent` | Hard reset. Stops everything immediately. |
| **Clean Build** | `sudo docker build --no-cache -t polyglot-agent:latest -f Dockerfile.gpu .` | Use if code changes aren't showing up. |
