# Team Briefing: The Daoist Testing Loop
**Date:** 2026-01-12
**Subject:** Execution Guide for Final Green Agent Testing

Team,

We have merged the **Daoist Testing Framework** (`feat/daoist-testing-implementation`) and the latest logic updates (`dev-sz01`). We are now entering the final testing phase for the "Contextual Debt" paper.

The testing process is split into three modes:
1.  **Preparation (Setup):** Getting the environment ready for the first time.
2.  **Yin (Execution):** The `Smart Campaign Runner` that quietly executes tests and manages H100 throttling.
3.  **Yang (Analysis):** The `Campaign Analyst` that generates insights from the data.

Since we are all starting fresh sessions, here is a guide with **exact Copilot prompts** to get up and running immediately.

---

## Phase 0: Environment Setup (The "Do Not Assume" Phase)

**Goal:** Ensure the environment is authenticated, installed, and the Arena is live.

### Step 1: Authentication & Cloning
Open a fresh VS Code terminal (or Lambda Shell) and ask Copilot:

> "I need to set up this environment from scratch. First, please check if `gh` (GitHub CLI) is installed. If not, install it. Then, guide me to run `gh auth login` so I can authenticate with my browser (use `-w` flag). Once authenticated, clone the repository `https://github.com/joshhickson/LogoMesh` (master branch) and `cd` into it."

### Step 2: Dependencies
Once inside the repo, we need to hydrate the environment.

> "Now that we are in the repo, I need to set up the dependencies.
> 1. Copy `.env.example` to `.env`.
> 2. Ensure `uv` is installed (`pip install uv`).
> 3. Run `uv sync` to install Python dependencies.
> 4. Run `pnpm install` to install Node.js dependencies (for tools).
> Please write the exact commands for me to run."

### Step 3: Launching the Arena (The "Big Red Button")
We use the unified launch script.

> "I need to start the Agent Arena (Green Agent, Purple Agent, and vLLM Brain). Write a command to run `sudo ./scripts/bash/launch_arena.sh`. Tell me to wait until I see the message 'Brain is online' before proceeding."

---

## Phase 1: Yin (Execution)

**Goal:** Start the automated testing loop to fill our coverage buckets (Target: 400 battles).

### Step 4: Starting the Smart Campaign
The `launch_arena.sh` script starts the Green Agent server on port **9000** (mapped from the container). The runner script needs to target this port explicitly.

> "I want to start the 'Yin' phase of the Daoist loop. Write a command to run `scripts/green_logic/smart_campaign.py` using `uv run`.
> **Critical:** You must append the flag `--url http://localhost:9000` because the Docker container exposes the agent on port 9000 (the script defaults to 9040).
> The command should look like: `uv run scripts/green_logic/smart_campaign.py --url http://localhost:9000`."

**Note:** If you see "Cooling down for 10s", this is normal. It is the H100 throttling mitigation. **Do not interrupt it.**

---

## Phase 2: Yang (Analysis)

**Goal:** Generate reports to see if we are hitting our integrity metrics (Logic Score > 0.8, etc.).

### Step 5: Generating the Report
You can run this at any time. The script reads from `data/battles.db` (which is mounted from the host).

> "I want to perform the 'Yang' analysis.
> 1. First, ensure the report directory exists: `mkdir -p docs/04-Operations/Dual-Track-Arena/reports/`.
> 2. Then, run `scripts/green_logic/campaign_analyst.py` using `uv run`.
> After it runs, tell me the filename of the generated markdown report."

### Step 6: Reading the Insights
Ask Copilot to summarize the latest report for you.

> "Please read the latest report file in `docs/04-Operations/Dual-Track-Arena/reports/` (sort by date). Summarize the 'Scoreboard' section and tell me which Task ID has the lowest 'Logic Score'. Also, list any 'Hall of Shame' battles I should investigate manually."

---

## Phase 3: Investigation (Deep Dive)

**Goal:** Inspect a specific failure found in the Hall of Shame.

### Step 7: Inspecting the Evidence
> "I need to investigate battle ID `[INSERT_BATTLE_ID_FROM_REPORT]`. Can you write a Python script using `sqlite3` to query `data/battles.db` and pretty-print the `raw_result` JSON for this specific battle? I want to see the 'logic_critique' and the 'purple_response' source code."
