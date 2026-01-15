# ⚖️ Judges: Start Here

**Welcome to the Green Agent (The Judge).**

This repository houses the **Green Agent**, an automated evaluator designed to measure "Contextual Debt" in AI-generated code. It serves as a benchmark for the AgentBeats competition.

If you are evaluating this submission, follow these exact steps to spin up the entire arena (Judge, Defender, and LLM Brain) in under 5 minutes.

---

## 1. Setup Options

We assume you are on a standard Linux environment (e.g., Lambda Cloud, Ubuntu). Choose your preferred setup method:

### ⭐ Option A: Automated Setup (Recommended)

**Fastest method - runs all prerequisites automatically:**

```bash
cd /home/ubuntu/LogoMesh
./scripts/bash/setup_all.sh
```

This single script will:
- Create .env file
- Install Python 3.11 (if needed)
- Install uv and sync dependencies
- Upgrade Node.js to v20 (if needed)
- Install pnpm and Node dependencies
- Verify Docker access

**Time:** ~15-20 minutes (one-time setup)

Then skip to **Section 2: The "Big Red Button"** below.

---

### Option B: Manual Setup

If you prefer to run commands individually:

#### A. Configure Environment
The system needs an environment file to run (even if API keys are empty/mocked).
```bash
cp .env.example .env
```

#### B. Install Dependencies (`uv`)
We use `uv` for fast Python package management.
```bash
pip install uv
uv sync --python 3.11
```

#### C. Verify Docker
Ensure Docker is running and you have `sudo` access.
```bash
sudo docker ps
# If this lists headers (CONTAINER ID...), you are good.
```

**Note:** For complete step-by-step instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md).

---

## 2. The "Big Red Button" (Launch)

We have consolidated the entire build and launch process into a single script. This script will:
1.  **Build** the `polyglot-agent` Docker image (includes all dependencies).
2.  **Launch vLLM** (The "Brain" - Qwen 2.5 Coder 32B).
3.  **Launch Green Agent** (The Judge) on Port **9000**.
4.  **Launch Purple Agent** (The Defender) on Port **9001**.

**Run this command:**
```bash
sudo ./scripts/bash/launch_arena.sh
```

> **Wait:** It will take **2-3 minutes** for the vLLM server to load the model weights. The script will poll until it is ready.

---

## 3. Run Your First Evaluation

Once the arena is live, act as the "User" and send a task to the Judge.

**Run the Test Script:**
```bash
sudo ./scripts/bash/test_agents.sh
```

**Or run manually via curl:**
```bash
curl -X POST http://localhost:9000/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{
    "battle_id": "judge-eval-001",
    "purple_agent_url": "http://localhost:9001"
  }'
```

---

## 4. Verify the Evidence

The core novelty of this submission is the **Decision Bill of Materials (DBOM)**—a cryptographic proof of the evaluation.

### A. Check the Logs
Look at the Green Agent logs to see the "Contextual Integrity Score" (CIS) being calculated in real-time.
```bash
sudo docker logs -f green-agent
```

### B. Find the Artifacts
After a successful run, verify that the cryptographic proof was generated:
```bash
ls -l data/dboms/
# You should see: dbom_judge-eval-001.json
```

---

## 5. Advanced QA

For detailed test cases (including negative testing and security constraints), see the **[QA Testing Plan](docs/04-Operations/Intent-Log/Josh/20260110-pr-88-testing-plan.md)**.

---

## 📚 Deep Dive
*   **Full Documentation:** [docs/04-Operations/Dual-Track-Arena/green-agent/20260109-Green-Agent-README.md](docs/04-Operations/Dual-Track-Arena/green-agent/20260109-Green-Agent-README.md)
*   **Troubleshooting:** [docs/04-Operations/Dual-Track-Arena/20260110-Quick-Start-Scripts.md](docs/04-Operations/Dual-Track-Arena/20260110-Quick-Start-Scripts.md)
