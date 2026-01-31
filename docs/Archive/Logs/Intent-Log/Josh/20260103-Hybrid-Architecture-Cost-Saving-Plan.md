---
status: ACTIVE
type: Plan
---
> **Context:**
> *   [2026-01-03]: Strategy guide for developing the Agent Arena using a hybrid Local + Google Cloud Platform (GCP) architecture. The focus is on **optimizing Vector Math and Agent Tools** to ensure success in the final Lambda deployment.

# Hybrid Architecture & Development Optimization Plan

## 1. The Strategy: "Optimization First, Power Second"

Our primary competitive advantage lies in the **Vector Math** (Contextual Integrity Score) and **Historical Storage** (Decision Bill of Materials), not raw model intelligence. Therefore, development should focus on perfecting these mechanisms.

You have two distinct cost-saving levers: **GCP Credits ($300)** and your **Local Hardware (RTX 3060 12GB)**. We can use a "Hybrid" approach to minimize the need for the expensive Lambda H100 rental ($1-$2/hr) until the final validation phase.

### A. Local Development (The "Optimization" Lab)
Your RTX 3060 (12GB VRAM) is the perfect environment for testing the **logic** of the Contextual Debt system.
*   **The Concept:** Since we are measuring *intent* and *debt*, we don't need a genius model to verify that our vector math works. We just need a model that produces embeddings and JSON.
*   **Feasibility:** `Qwen-2.5-Coder-32B` (Target) won't fit locally.
*   **The Fix:** Use `Qwen-2.5-Coder-7B-Instruct` or even `1.5B`.
*   **Why this is okay:**
    *   **Vector Math:** The cosine similarity logic (`src/green_logic/scoring.py`) works the same way whether the embedding comes from a 7B or 70B model.
    *   **Storage (DBOM):** The "Write-Ahead Log" and "Crash Proofing" (`src/green_logic/storage.py`) can be fully perfected using a lightweight model that responds instantly.
*   **Goal:** Optimize the **Agent Tools** (Scorer, Recorder) so they are bulletproof. When we switch to the H100, we simply swap the model, and the tools will work faster and better.

### B. Google Cloud Platform ($300 Credits)
Use your credits to verify that your optimized tools work with a **production-grade architecture** (Networked API).
*   **Best Option:** **GCE VM with L4 GPU (24GB VRAM)**.
    *   The Nvidia L4 GPU has 24GB VRAM, which **can** fit the 4-bit quantized 32B model (~18GB).
    *   **Cost:** Approx $0.50 - $0.80 / hour (check spot pricing). Your $300 credits will last ~400+ hours.
    *   **Usage:** Use this to test the "Network Protocol" (A2A) and ensuring your local agent handles remote API latency correctly.

---

## 2. API Policy (The "Green" Side)

**Technically:** Yes. Your `server.py` supports `OPENAI_BASE_URL`.
**Competitively:** Use with intent.

*   **For the "Green Agent" (The Judge):**
    *   **Risk:** Using GPT-4 as a judge might be seen as "Cheating".
    *   **Safe Bet:** Use the API for *development*. If your Vector Math works on GPT-4 embeddings, it will work on local embeddings. Use the API to generate "Golden Data" to test your scorers against.

*   **For the "Purple Agent" (The Defender):**
    *   **Recommendation:** Stick to local/cloud-hosted open models. We want to test *our* defense logic, not OpenAI's safety filters.

---

## 3. The "Hybrid" Architecture Plan

This configuration maximizes development speed and mathematical optimization:

| Component | Location | Hardware/Cost | Aim of the Game |
| :--- | :--- | :--- | :--- |
| **Green Agent (Logic)** | **Local (Your PC)** | CPU / 32GB RAM | **Optimize Math:** Perfect the `ContextualIntegrityScorer` and DBOM storage. |
| **Purple Agent (Logic)** | **Local (Your PC)** | CPU / 32GB RAM | **Optimize Defense:** Refine the `GenericDefender` logic (e.g., HTML inspection). |
| **Model Backend (vLLM)** | **GCP (L4 GPU)** | **$0 (Credits)** | **Verify Network:** Ensure A2A protocol handles network calls correctly. |
| **The "Battle"** | **Hybrid Network** | N/A | Point your local agents to `http://<GCP_IP>:8000/v1`. |

### Why this wins:
1.  **Logic Verification:** You prove the *math* works before paying for the *compute*.
2.  **Tool Hardening:** You fix bugs in the "Filing System" (Session Persistence) locally, where debugging is free.
3.  **Final Polish:** When you deploy to Lambda (H100) for the judges, the system is already proven; it just gets a "Brain Upgrade" (32B/70B model).

---

## 4. Next Steps

1.  **GCP Quota:** Request **1x NVIDIA L4 GPU** (Region: `us-central1` or similar).
2.  **Local Setup:** Install `uv` and run the agents with a local, tiny model first (e.g., `Qwen-1.5B`) to ensure the *plumbing* works.
3.  **Environment Config:** Create a `.env.hybrid` file to switch between `localhost` (Dev/Optimize) and `GCP_IP` (Staging).
