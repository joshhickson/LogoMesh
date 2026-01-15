---
status: ACTIVE
type: Plan
date: 2026-01-15
---

> **Context:**
> *   [2026-01-15]: Execution plan for spinning up a Lambda Labs instance to run Tier 1 battles.
> *   **Parent:** `docs/04-Operations/Intent-Log/Josh/20260115-Tier1-3-Review-Briefing.md`

# Lambda Provisioning Plan (Emergency Tier 1 Rerun)

## 1. Provisioning Checklist
*   [ ] **Login:** [Lambda Labs Dashboard](https://cloud.lambdalabs.com/instances)
*   [ ] **Region:** US-East or US-West (Avoid Europe/Asia for latency if possible, but availability is king).
*   [ ] **Instance Type:**
    *   **Preferred:** 1x A100 (80GB) SXM4.
    *   **Alternative:** 1x H100 (80GB) PCIe.
    *   **Minimum:** 1x A10 (24GB) - *Only if A100 unavailable, but Mistral Quantized fits here easily.*
*   [ ] **OS Image:** Ubuntu 22.04 (Default).
*   [ ] **SSH Key:** Add your local public key.

## 2. Setup Commands (Copy-Paste)

Once SSH'd into the instance (`ssh ubuntu@<ip>`), run these commands block by block.

### Block A: Environment Prep
```bash
# Update and install basic tools
sudo apt-get update && sudo apt-get install -y git htop tmux

# Verify NVIDIA Drivers (Should be pre-installed on Lambda)
nvidia-smi
```

### Block B: Clone Repository
```bash
# Clone the repo (Use HTTPS or setup SSH keys)
git clone https://github.com/YourOrg/LogoMesh.git
cd LogoMesh

# Checkout the correct branch
git checkout main
```

### Block C: Install Dependencies (uv)
```bash
# Install uv (Python Package Manager)
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.cargo/env
```

### Block D: Launch The Arena
This script handles Docker build and container startup automatically.
```bash
# Make script executable
chmod +x scripts/bash/launch_arena.sh

# Run the launch script (Builds Docker image + Starts vLLM/Agents)
sudo ./scripts/bash/launch_arena.sh
```

### Block E: Monitor Startup
Wait for the vLLM server to be ready.
```bash
# Tail the vLLM logs
docker logs -f vllm-server
# Ctrl+C to exit logs once you see "Uvicorn running on http://0.0.0.0:8000"
```

## 3. Execution (The Battle)
Once the arena is running:

```bash
# Enter the Green Agent container (or run from host if uv is setup)
# Ideally, run from host using the python script directly if environment allows,
# OR use the script that triggers the run.

# Assuming we run the python test script from the host:
uv run scripts/run_tier1_mistral.py
```

*Note: If `run_tier1_mistral.py` does not exist, use the manual command:*
```bash
uv run main.py --role GREEN --task "Evaluate Tier 1 Mistral"
```
*(Refine this step based on the exact entry point used in previous Tiers).*
