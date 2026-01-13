# Team Briefing: The Daoist Testing Loop
**Date:** 2026-01-12
**Subject:** Execution Guide for Final Green Agent Testing

Team,

We have merged the **Daoist Testing Framework** (`feat/daoist-testing-implementation`) and the latest logic updates (`dev-sz01`). We are now entering the final testing phase for the "Contextual Debt" paper.

The testing process is split into two modes:
1.  **Yin (Execution):** The `Smart Campaign Runner` that quietly executes tests and manages H100 throttling.
2.  **Yang (Analysis):** The `Campaign Analyst` that generates insights from the data.

Since we are all starting fresh sessions, here is a guide with **exact Copilot prompts** to get up and running immediately.

---

## Phase 1: Yin (Execution)

**Goal:** Start the automated testing loop to fill our coverage buckets (Target: 400 battles).

### Step 1: Verification
Open a fresh VS Code terminal and ask Copilot:

> "I need to verify that the Daoist Testing Framework is installed. Can you check for the existence of `scripts/green_logic/smart_campaign.py` and `src/green_logic/server.py`? Also, check if `data/battles.db` exists or needs to be initialized."

### Step 2: Launching the Server
The runner needs the Green Agent server to be active.

> "I need to start the Green Agent server to listen for tasks. Write a terminal command to run the server entrypoint defined in `src/green_logic/server.py`. Make sure it listens on port 9040 as expected by the runner."

### Step 3: Running the Smart Campaign (The Loop)
Once the server is up, open a **second terminal** and start the Yin loop.

> "I want to start the 'Yin' phase of the Daoist loop. Write a command to run `scripts/green_logic/smart_campaign.py`. I need to ensure the necessary dependencies (like `rich` and `httpx`) are installed first. Please provide the pip install command followed by the execution command."

**Note:** If you see "Cooling down for 10s", this is normal. It is the H100 throttling mitigation. **Do not interrupt it.**

---

## Phase 2: Yang (Analysis)

**Goal:** Generate reports to see if we are hitting our integrity metrics (Logic Score > 0.8, etc.).

### Step 4: Generating the Report
You can run this at any time, even while the runner is active.

> "I want to perform the 'Yang' analysis. Write a command to run `scripts/green_logic/campaign_analyst.py`. After it runs, tell me where the markdown report is saved (it should be in `docs/04-Operations/Dual-Track-Arena/reports/`)."

### Step 5: Reading the Insights
Ask Copilot to summarize the latest report for you.

> "Please read the latest report file in `docs/04-Operations/Dual-Track-Arena/reports/` (sort by date). Summarize the 'Scoreboard' section and tell me which Task ID has the lowest 'Logic Score'. Also, list any 'Hall of Shame' battles I should investigate manually."

---

## Phase 3: Investigation (Deep Dive)

**Goal:** Inspect a specific failure found in the Hall of Shame.

> "I need to investigate battle ID `[INSERT_BATTLE_ID_FROM_REPORT]`. Can you write a Python script using `sqlite3` to query `data/battles.db` and pretty-print the `raw_result` JSON for this specific battle? I want to see the 'logic_critique' and the 'purple_response' source code."
