# LogoMesh Development Environment Setup Guide

**Complete Setup Instructions for Lambda Labs Ubuntu + NVIDIA A100 GPU Instance**

---

## 📋 Overview

This guide provides step-by-step instructions for setting up the LogoMesh development environment on a Lambda Labs instance (or similar Ubuntu + NVIDIA GPU environment). The setup process takes approximately **15-20 minutes** and includes all dependencies needed to run the Green Agent security benchmark.

**Tested Environment:**
- **OS:** Ubuntu 22.04 LTS (Jammy)
- **GPU:** NVIDIA A100 (CUDA-enabled)
- **Base Python:** 3.10.12 (system default)
- **Instance Type:** Lambda Labs 1x A100 (80GB)

---

## ⚡ Quick Start (TL;DR)

### Option A: Automated Setup (Recommended)

Run the unified setup script that handles everything:

```bash
cd /home/ubuntu/LogoMesh
./scripts/bash/setup_all.sh
```

Then launch the Arena:
```bash
sudo ./scripts/bash/launch_arena.sh
```

### Option B: Manual Setup

If you prefer to run commands individually:

```bash
# 1. Configure environment
cd /home/ubuntu/LogoMesh
cp .env.example .env

# 2. Install Python 3.11
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv

# 3. Install uv and sync Python dependencies
pip install uv
uv sync --python 3.11

# 4. Install Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get remove -y libnode-dev
sudo apt-get install -y nodejs

# 5. Enable pnpm and install Node dependencies
sudo corepack enable
pnpm install

# 6. Verify Docker
sudo docker ps

# 7. Launch the Arena
sudo ./scripts/bash/launch_arena.sh
```

---

## 📦 Prerequisites

The Lambda Labs instance comes pre-configured with:
- ✅ Docker (v28.x)
- ✅ NVIDIA Container Toolkit
- ✅ CUDA drivers
- ✅ Python 3.10.12 (base system)
- ✅ Git

**You will need to install:**
- Python 3.11+ (for ray and vllm compatibility)
- Node.js v20+ (current system has v12.x)
- uv (Python package manager)
- pnpm (Node.js package manager)

---

## 🔧 Detailed Setup Instructions

### Step 1: Navigate to Project Directory

```bash
cd /home/ubuntu/LogoMesh
```

Verify you're in the correct location:
```bash
pwd
# Should output: /home/ubuntu/LogoMesh
```

---

### Step 2: Configure Environment File

Create the `.env` file from the example template:

```bash
cp .env.example .env
```

**View the contents:**
```bash
cat .env
# Output: OPENAI_API_KEY=sk-proj-your-key-here
```

**Note:** The system can run in "mock mode" without real API keys for testing purposes. If you have an OpenAI API key, you can edit `.env`:

```bash
nano .env
# Replace 'sk-proj-your-key-here' with your actual key
# Press Ctrl+X, then Y, then Enter to save
```

---

### Step 3: Install Python 3.11

The project requires Python 3.11+ due to dependencies like `ray==2.53.0` which don't support Python 3.14, and vllm which needs 3.11-3.13.

**Install Python 3.11:**
```bash
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv
```

**Verify installation:**
```bash
python3.11 --version
# Expected output: Python 3.11.14
```

**Why not use system Python 3.10?**
The `pyproject.toml` specifies `requires-python = ">=3.11"` for compatibility with modern type hints and async features used throughout the codebase.

---

### Step 4: Install uv (Python Package Manager)

LogoMesh uses `uv` for fast, reliable Python dependency management (10-100x faster than pip).

```bash
pip install uv
```

**Verify installation:**
```bash
uv --version
# Expected output: uv 0.9.26 (or higher)
```

---

### Step 5: Sync Python Dependencies

This step creates a virtual environment (`.venv/`) and installs all 234 Python packages needed for the project.

```bash
uv sync --python 3.11
```

**Expected behavior:**
- Creates `.venv/` directory
- Downloads ~3.5GB of packages (including CUDA libraries, vllm, torch, transformers)
- Takes 5-10 minutes depending on network speed

**Key packages installed:**
- `vllm>=0.6.0` - LLM inference engine
- `ray==2.53.0` - Distributed computing framework
- `sentence-transformers>=3.0.0` - Embedding models for CIS computation
- `a2a-sdk>=0.3.5` - Agent-to-Agent protocol implementation
- `openai>=2.8.1`, `pydantic>=2.11.9`, `uvicorn>=0.35.0`

**Troubleshooting:**

If you see this error:
```
error: Distribution `ray==2.53.0` can't be installed because it doesn't have a source distribution or wheel for the current platform
hint: You're using CPython 3.14 (`cp314`), but `ray` only has wheels for: `cp311`, `cp312`, `cp313`
```

**Solution:** Ensure you used `--python 3.11` flag. The system may default to Python 3.14 if installed.

---

### Step 6: Install Node.js v20

The project requires Node.js v20+ for modern JavaScript features and TypeScript 5.9 compatibility. Lambda instances ship with Node.js v12.22.9 which is incompatible.

**Install Node.js v20 from NodeSource:**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

**Remove conflicting packages:**
```bash
sudo apt-get remove -y libnode-dev
```

**Install Node.js v20:**
```bash
sudo apt-get install -y nodejs
```

**Verify installation:**
```bash
node --version
# Expected output: v20.20.0 (or higher)

npm --version
# Expected output: 10.8.2 (or higher)
```

**Why remove `libnode-dev`?**
The old `libnode-dev` package (v12.x) contains header files that conflict with Node.js v20 installation. Removing it prevents file collision errors during upgrade.

---

### Step 7: Enable pnpm (Node Package Manager)

LogoMesh uses `pnpm` for efficient Node.js dependency management (uses hard links to save disk space).

```bash
sudo corepack enable
```

**Verify pnpm is available:**
```bash
pnpm --version
# Expected output: 8.15.7 (or higher)
```

**What is corepack?**
Corepack is a Node.js tool that manages package manager versions. It downloads and installs pnpm automatically on first use.

---

### Step 8: Install Node.js Dependencies

Install all 553 Node.js packages (TypeScript tools, testing frameworks, build tools):

```bash
pnpm install
```

**Expected behavior:**
- Downloads ~500MB of packages
- Compiles native modules (`sqlite3`, `isolated-vm`, `esbuild`)
- Takes 3-5 minutes

**Key packages installed:**
- `typescript@5.9.3` - TypeScript compiler
- `turbo@2.6.0` - Monorepo build tool
- `vitest@1.6.1` - Testing framework
- `express@4.21.2` - Web server (for Node.js components)
- `sqlite3@5.1.7` - Database for battle logs

---

### Step 9: Verify Docker Access

Docker is pre-installed on Lambda instances, but you need `sudo` privileges to use it (unless you add your user to the `docker` group).

```bash
sudo docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

**To avoid using `sudo` with every Docker command** (optional):
```bash
sudo usermod -aG docker $USER
newgrp docker
docker ps  # Should work without sudo now
```

**Verify Docker version:**
```bash
docker --version
# Expected output: Docker version 28.5.1, build e180ab8 (or higher)
```

---

### Step 10: Verify Complete Setup

Run this verification command to confirm all tools are installed:

```bash
cd /home/ubuntu/LogoMesh
python3.11 --version && \
uv --version && \
node --version && \
pnpm --version && \
docker --version
```

**Expected output:**
```
Python 3.11.14
uv 0.9.26
v20.20.0
8.15.7
Docker version 28.5.1, build e180ab8
```

**Verify virtual environment:**
```bash
source .venv/bin/activate
python --version
# Should output: Python 3.11.14
```

**Verify main entry point:**
```bash
uv run main.py --help
```

**Expected output:**
```
usage: main.py [-h] --role {GREEN,PURPLE,RED} [--host HOST] [--port PORT]
               [--card-url CARD_URL]

AgentBeats Polyglot Entrypoint

options:
  -h, --help            show this help message and exit
  --role {GREEN,PURPLE,RED}
                        The role to play (Evaluator vs Defender vs Attacker)
  --host HOST           Host to bind to
  --port PORT           Port to listen on
  --card-url CARD_URL   URL to advertise in the agent card
```

---

## � Alternative: Automated Setup Script

If you prefer automation, we provide a unified setup script that performs all the steps above:

```bash
cd /home/ubuntu/LogoMesh
./scripts/bash/setup_all.sh
```

**What it does:**
- Creates .env file if missing
- Installs Python 3.11 if needed
- Installs and runs uv sync
- Upgrades Node.js to v20 if needed
- Enables pnpm and installs Node dependencies
- Verifies Docker access
- Shows final verification summary

**Benefits:**
- Single command execution
- Idempotent (safe to run multiple times)
- Built-in error checking
- Progress feedback at each step

---

## �🚀 Running the System

Once setup is complete, you have three options to run LogoMesh:

### Option 1: Quick Launch (Docker Arena) - **RECOMMENDED FOR JUDGES**

This is the "Big Red Button" approach - launches everything with one command.

```bash
sudo ./scripts/bash/launch_arena.sh
```

**What this does:**
1. Builds the `polyglot-agent` Docker image (~5 minutes first time)
2. Launches vLLM server with Qwen 2.5 Coder 32B model (Port 8000)
3. Launches Green Agent (Judge/Evaluator) on Port 9000
4. Launches Purple Agent (Baseline Defender) on Port 9001
5. Waits for vLLM to be ready (~2-3 minutes for model loading)

**Expected behavior:**
- Script polls vLLM health endpoint until ready
- Displays "vLLM is ready!" when complete
- All agents available for testing

**Test the setup:**
```bash
sudo ./scripts/bash/test_agents.sh
```

---

### Option 2: Local Development (Direct Python)

Run the Green Agent locally without Docker (useful for debugging):

```bash
cd /home/ubuntu/LogoMesh
uv run main.py --role GREEN --host 0.0.0.0 --port 9000
```

**For other roles:**
```bash
# Purple Agent (Defender)
uv run main.py --role PURPLE --host 0.0.0.0 --port 9001

# Red Agent (Attacker)
uv run main.py --role RED --host 0.0.0.0 --port 9002
```

---

### Option 3: Individual Docker Containers

Build and run components separately:

```bash
# Build image
docker build -t logomesh-green-agent .

# Run Green Agent
docker run -p 9000:9000 logomesh-green-agent --role GREEN

# Run Purple Agent
docker run -p 9001:9001 logomesh-green-agent --role PURPLE
```

---

## 📊 Accessing the System

### Green Agent (Evaluator/Judge)
- **URL:** http://localhost:9000
- **Agent Card:** http://localhost:9000/.well-known/agent.json
- **Health Check:** http://localhost:9000/health

### Purple Agent (Baseline Defender)
- **URL:** http://localhost:9001
- **Agent Card:** http://localhost:9001/.well-known/agent.json

### vLLM Brain (Model Server)
- **URL:** http://localhost:8000
- **Health Check:** http://localhost:8000/health
- **Model:** Qwen/Qwen2.5-Coder-32B-Instruct

---

## 🧪 Running Tests

### Full Security Benchmark Test
```bash
sudo ./scripts/bash/test_agents.sh
```

### Python Unit Tests
```bash
cd /home/ubuntu/LogoMesh
uv run pytest
```

### Streaming Battle Test
```bash
uv run python test_streaming_battle.py
```

### Persistence Verification
```bash
uv run python verify_persistence.py
```

---

## 📂 Project Structure

```
LogoMesh/
├── main.py                  # Entry point (GREEN/PURPLE/RED roles)
├── src/                     # Source code
│   ├── green_logic/         # Green Agent (Orchestrator, Evaluator)
│   ├── purple_logic/        # Purple Agent (Defense Interface)
│   ├── red_logic/           # Red Agent (Attack Engine)
│   └── agentbeats/          # Shared evaluation library
├── scenarios/               # Attack scenarios (DockerDoo, SolarSpike, etc.)
├── scripts/                 # Utility scripts
│   └── bash/                # Launch/test scripts
├── docs/                    # Documentation
├── packages/                # Node.js packages (legacy)
├── .venv/                   # Python virtual environment (created by uv)
├── node_modules/            # Node.js dependencies (created by pnpm)
├── .env                     # Environment configuration (you create this)
├── pyproject.toml           # Python project config
└── package.json             # Node.js project config
```

---

## 🐛 Troubleshooting

### Issue: `uv sync` fails with "Distribution `ray==2.53.0` can't be installed"

**Cause:** Using Python 3.14 instead of 3.11-3.13.

**Solution:**
```bash
uv sync --python 3.11
```

---

### Issue: Node.js upgrade fails with "trying to overwrite '/usr/include/node/common.gypi'"

**Cause:** Conflicting `libnode-dev` package from Node.js v12.

**Solution:**
```bash
sudo apt-get remove -y libnode-dev
sudo apt-get install -y nodejs
```

---

### Issue: `docker ps` returns "permission denied"

**Cause:** User not in `docker` group.

**Quick fix (use sudo):**
```bash
sudo docker ps
```

**Permanent fix:**
```bash
sudo usermod -aG docker $USER
newgrp docker
docker ps  # Works without sudo
```

---

### Issue: vLLM fails to load model with CUDA errors

**Cause:** Insufficient GPU memory or CUDA mismatch.

**Check GPU:**
```bash
nvidia-smi
```

**Verify CUDA:**
```bash
nvcc --version
```

**Ensure you have 40GB+ GPU RAM for Qwen 2.5 Coder 32B.**

---

### Issue: `pnpm install` fails with "EACCES: permission denied"

**Cause:** Running pnpm as root or in a protected directory.

**Solution:**
```bash
cd /home/ubuntu/LogoMesh
pnpm install  # Run as ubuntu user, not root
```

---

### Issue: `.venv/bin/python` points to wrong Python version

**Cause:** uv selected wrong Python interpreter.

**Solution:**
```bash
rm -rf .venv
uv sync --python 3.11
```

---

## 🔍 Verification Checklist

### Automated Verification

Run the prerequisite checker to see your environment status:

```bash
./scripts/bash/check_prerequisites.sh
```

**Expected output:**
```
✅ Python 3.11: Python 3.11.14
✅ uv: uv 0.9.26
✅ Node.js: v20.20.0
✅ pnpm: 8.15.7
✅ Docker: Docker version 28.5.1
✅ GPU: NVIDIA A100-SXM4-40GB
✅ Virtual environment: .venv exists
✅ Node modules: installed
```

### Manual Checklist

Alternatively, use this checklist to confirm your setup manually:

- [ ] `.env` file exists in project root
- [ ] Python 3.11.14 is installed (`python3.11 --version`)
- [ ] uv is installed (`uv --version`)
- [ ] `.venv/` directory exists and contains Python 3.11
- [ ] Node.js v20+ is installed (`node --version`)
- [ ] pnpm is available (`pnpm --version`)
- [ ] `node_modules/` directory exists
- [ ] Docker is accessible (`sudo docker ps` works)
- [ ] `main.py --help` displays usage information
- [ ] vLLM container can be launched (if testing with GPU)

---

## 📖 Next Steps

After completing setup:

1. **For Judges:** Read [JUDGES_START_HERE.md](JUDGES_START_HERE.md) for evaluation instructions
2. **For Developers:** Review [docs/00_CURRENT_TRUTH_SOURCE.md](docs/00_CURRENT_TRUTH_SOURCE.md) for architecture
3. **For Researchers:** See [docs/03-Research/Theory/](docs/03-Research/Theory/) for Contextual Debt theory
4. **For Onboarding:** Launch the interactive docs: `cd onboarding && pnpm start`

---

## 💡 Tips for Lambda Labs Instances

### Ephemeral Storage
Lambda instances use ephemeral storage - **all data is lost on shutdown**. To preserve work:

```bash
# Create a backup of your environment
cd /home/ubuntu
tar -czf logomesh-backup.tar.gz LogoMesh/

# Restore from backup (after restart)
tar -xzf logomesh-backup.tar.gz
cd LogoMesh
# Re-run setup steps if needed
```

### Cost Optimization
- **Shut down instances** when not actively developing
- vLLM model loading takes 2-3 minutes - keep containers running during active testing
- Use `docker stop` instead of killing containers to preserve state

### GPU Monitoring
```bash
# Watch GPU usage in real-time
watch -n 1 nvidia-smi

# Check GPU memory usage
nvidia-smi --query-gpu=memory.used,memory.total --format=csv
```

---

## 🙋 Getting Help

**Documentation:**
- [README.md](README.md) - Project overview
- [JUDGES_START_HERE.md](JUDGES_START_HERE.md) - Competition evaluation guide
- [docs/](docs/) - Full documentation library

**Common Commands:**
```bash
# Full system logs
docker logs -f <container_id>

# Green Agent logs
tail -f logs/green_agent.log

# Battle database inspection
sqlite3 data/battles.db "SELECT * FROM battles LIMIT 10;"
```

**Emergency Reset:**
```bash
cd /home/ubuntu/LogoMesh
rm -rf .venv node_modules

# Option 1: Use automated setup
./scripts/bash/setup_all.sh

# Option 2: Manual reinstall
uv sync --python 3.11
pnpm install
```

---

## ✅ Setup Complete!

You should now have a fully functional LogoMesh development environment. The setup typically takes **15-20 minutes** on a Lambda Labs instance with good network connectivity.

**Total disk usage:** ~8-10GB (Python packages + Node modules + Docker images)

**Ready to launch the Arena?**
```bash
sudo ./scripts/bash/launch_arena.sh
```

---

*Last Updated: January 15, 2026*  
*Tested on: Lambda Labs 1x A100 (80GB) Ubuntu 22.04*
