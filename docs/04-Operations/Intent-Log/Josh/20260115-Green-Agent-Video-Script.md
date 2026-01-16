---
status: DRAFT
type: Plan
---
> **Context:**
> *   [2026-01-15]: Video Submission Script for AgentX Green Agent Track.
> *   **Video Constraint:** 3 Minutes Max.
> *   **Presenter:** Josh (Voiceover).

# Green Agent Submission: "The Contextual Integrity Benchmark" - Video Script

## 1. The "What & Why" (0:00 – 0:30)

**(0:00) [Visual: Split screen. Left side: "Technical Debt" (Messy Code). Right side: "Contextual Debt" (Clean Code, Wrong Purpose). Fade to Title: "The Crisis of Intent"]**

**Voiceover:**
"We’ve spent twenty years managing **Technical Debt**—a failure of the 'how'. But the liability of the AI era is **Contextual Debt**—a failure of the 'why'. This Green Agent, the **Contextual Integrity Judge**, specifically benchmarks an agent's ability to maintain human intent, architectural rationale, and safety compliance in generated code."

**(0:15) [Visual: Zoom into text from the Whitepaper, highlighting "The Liability of Amnesiac Systems"]**
> **Source Material:** `docs/00-Strategy/IP/archive/20251118-Copyright-Edition-Contextual-Debt-Paper_v1_2026-01-14.md` (Executive Summary)

**Voiceover:**
"Existing benchmarks verify if code *runs*. We built this benchmark to verify if code *remembers*. It measures the 'Liability of Amnesiac Systems'—identifying when an AI agent produces functional code that silently violates business logic or security constraints."

**(0:25) [Visual: Code Editor showing the "Prompt" sent to the agent. "Task: Implement a Rate Limiter... Constraint: Do not use global state." ]**

**Voiceover:**
"Here is the test: We send the Purple Agent a coding task with hidden 'Intent Vectors'—specific architectural constraints that a standard LLM often ignores in favor of generic boilerplate."

---

## 2. The Architecture (0:30 – 1:00)

**(0:30) [Visual: Architecture Diagram. box[Green Agent (Assessor)] <--> box[A2A Protocol] <--> box[Purple Agent (Subject)]. Background: Docker Logos]**

**Voiceover:**
"The architecture is fully containerized. The Green Agent acts as the Assessor, communicating with the Participant via the **Agent-to-Agent (A2A)** protocol. We strictly enforce isolation: every battle spins up a fresh environment."

**(0:45) [Visual: Split terminal. Top: Purple Agent generating code. Bottom: Red Agent log showing `[ATTACK] Injecting SQLi vector into context...`]**
> **Source Material:** `src/green_logic/agent.py` & `scenarios/security_arena/agents/generic_attacker.py`

**Voiceover:**
"Crucially, our benchmark includes an adversarial 'Red Agent' sidecar. While the Purple Agent codes, the Red Agent attempts real-time injection attacks. The Green Agent evaluates not just the code's function, but its resilience."

**(0:55) [Visual: Screen flash of `docker-compose.yml` or `launch_arena.sh` script running]**

**Voiceover:**
"It’s a single-command deploy. `sudo ./scripts/bash/launch_arena.sh` spins up the Judge, the Defender, and the vLLM 'Brain', fully orchestrated via Docker."

---

## 3. The "Receipts" (The Actual Run) (1:00 – 2:00)

**(1:00) [Visual: Terminal Screen Recording (Accelerated 20x). Text scrolling rapidly in `terminal_green`. Highlighting "Analyzing Submission..."]**
> **Source Material:** `results/c_new_001_diversity_test/tier2_stdout.log`

**Voiceover:**
"This is a live run against **Qwen-2.5-Coder-32B**. You can see the Green Agent issuing the task 'Implement an LRU Cache'. The agent thinks, executes, and submits."

**(1:20) [Visual: Highlight specific log line: `CIS Calculation: R=0.8 A=0.7 T=1.0 L=0.9 => Final=0.85`]**

**Voiceover:**
"Here is the **Contextual Integrity Score (CIS)** calculation in real-time. Unlike binary pass/fail tests, we verify four dimensions equally:"

**(1:30) [Visual: Overlay the CIS Formula]**
> **Source Material:** `src/green_logic/scoring.py` (Lines 496-517)

**Voiceover:**
"We verify four dimensions equally: Requirements, Architecture, Testing, and Logic. A failure in *any* sector drags down the total Contextual Integrity score."

**(1:45) [Visual: Animated score drop. "0.85" in Green, "Red Penalty" stamp appears, number counts down to "0.34" in Red.]**

**Voiceover:**
"...we see the **Red Penalty** in action. The code worked, but the Red Agent found a vulnerability. The Green Agent detects this and crushes the score from a passing 0.85 to a failing 0.34. The penalty is tangible—and the system works."

---

## 4. Reproducibility & Leaderboard (2:00 – 2:45)

**(2:00) [Visual: AgentBeats Leaderboard (Localhost Replica). Showing "Baseline Model (Score 0.45)" vs "Advanced Model (Score 0.82)"]**
> **Source Material:** `results/c_new_001_diversity_test/tier1_execution.log` vs `tier2_execution.log`

**Voiceover:**
"We validated this pipeline across 75 battles. The leaderboard shows a clear separation: The **Baseline Model** fails to grasp architectural intent, scoring a 0.45. Meanwhile, the **Advanced Model**—equipped with reasoning capabilities—succeeds with a score of 0.82."

**Script Note:**
For clarity, refer to Tier 2 as the "Baseline Model (Qwen-32B)" and Tier 3 as the "Advanced Model (GPT-OSS-20B)" throughout the video. This helps the audience distinguish their roles:
	- Baseline Model (Qwen-32B): Represents the current open-source standard for code generation.
	- Advanced Model (GPT-OSS-20B): Demonstrates next-generation agentic reasoning and security awareness.

**How to Present Results from Database:**
Show a visual summary (bar chart or table) of CIS scores for both models, directly extracted from the SQLite databases (`battles_tier2_qwen.db` and `battles_tier3_gptoss.db`).
Highlight:
	- Mean CIS score for each model
	- Score distribution (histogram or boxplot)
	- Outlier removal (e.g., scores ≤ 0.16)
	- Bimodal distribution for Advanced Model (Tier 3)
Use animated overlays to walk through the results, emphasizing the difference in variance and the impact of adversarial testing.

**(2:20) [Visual: Side-by-side terminal windows running identical tests. "Run A" and "Run B".]**
> **Source Material:** `JUDGES_START_HERE.md` (The "Decision Bill of Materials")

**Voiceover:**
"Determinism is proven via our **Decision Bill of Materials (DBOM)**. We generate a cryptographic proof for every run, ensuring that if you run this benchmark in your lab, you get the exact same CIS score for the same code input."

---

## 5. Compliance & Closing (2:45 – 3:00)

**(2:45) [Visual: DBOM Proof – Terminal showing cryptographic hash and reproducibility check]**
> **Source Material:** `JUDGES_START_HERE.md` (The "Decision Bill of Materials")

**Voiceover:**
"Every run generates a Decision Bill of Materials—a cryptographic proof that guarantees reproducibility. This means anyone can verify the exact CIS score for a given code input, making our benchmark truly scientific."

**(2:55) [Visual: "AgentBeats.dev" text. Fade to Black.]**

**Voiceover:**
"We invite all participants to test their agents against the Contextual Integrity Benchmark. Measure the 'Why', not just the 'How' at AgentBeats.dev."

---
