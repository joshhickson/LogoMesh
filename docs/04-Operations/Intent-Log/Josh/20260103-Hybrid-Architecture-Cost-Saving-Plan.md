---
status: ACTIVE
type: Plan
---
> **Context:**
> *   [2026-01-03]: Strategy guide for developing the Agent Arena using a hybrid Local + Google Cloud Platform (GCP) architecture to save money on Lambda Labs credits.

# Hybrid Architecture & Cost-Saving Battle Plan

## 1. The Strategy: "Develop Locally, Verify on Cloud"

You have two distinct cost-saving levers: **GCP Credits ($300)** and your **Local Hardware (RTX 3060 12GB)**. We can use a "Hybrid" approach to minimize the need for the expensive Lambda H100 rental ($1-$2/hr).

### A. Local Development (The "Purple" Side)
Your RTX 3060 (12GB VRAM) is powerful enough to run **quantized** versions of smaller models, or act as the code execution environment.
*   **Feasibility:** `Qwen-2.5-Coder-32B` (our target model) in 4-bit quantization (AWQ/GPTQ) requires ~18GB VRAM. **This will not fit on your 3060.**
*   **The Fix:** Develop using `Qwen-2.5-Coder-14B-Instruct-GPTQ-Int4` (approx. 9-10GB VRAM) or `Qwen-2.5-Coder-7B-Instruct`.
*   **Workflow:** Use these smaller models locally to write and debug your agent logic (the Python code, the JSON parsing, the A2A protocol). If your agent works with the 7B model, it will likely work *better* with the 32B model on the cloud.

### B. Google Cloud Platform ($300 Credits)
You can use your credits to run the "Heavy" compute for short bursts without paying cash.
*   **Best Option:** **GCE VM with L4 GPU (24GB VRAM)**.
    *   The Nvidia L4 GPU has 24GB VRAM, which **can** fit the 4-bit quantized 32B model (~18GB).
    *   **Cost:** Approx $0.50 - $0.80 / hour (check spot pricing). Your $300 credits will last ~400+ hours. **This is your winning move.**
*   **Alternative:** Vertex AI "Model Garden". Deploy `Qwen-2.5-Coder-32B` as an endpoint. You only pay for active minutes, but setup is more complex.

---

## 2. Can I use APIs? (The "Green" Side)

**Technically:** Yes. Your `server.py` supports `OPENAI_BASE_URL`.
**Competitively:** It is risky.

*   **For the "Green Agent" (The Judge):**
    *   The rules emphasize "Fair Compute" and "Open Source Models" (`gpt-oss-20b` equivalent).
    *   **Risk:** Using GPT-4 as a judge might be seen as "Cheating" on the compute constraint.
    *   **Safe Bet:** Use the API for *development* (to prove your logic works), but your final submission (Docker container) must be self-contained or point to a verifiable open-weights model.

*   **For the "Purple Agent" (The Defender):**
    *   The goal is to test *security scenarios*. If you use GPT-4 as your defender, you are testing OpenAI's safety filters, not your own agent's logic.
    *   **Recommendation:** Stick to local/cloud-hosted open models for the agents involved in the battle.

---

## 3. The "Hybrid" Architecture Plan

This configuration maximizes speed and minimizes cost:

| Component | Location | Hardware/Cost | Notes |
| :--- | :--- | :--- | :--- |
| **Green Agent (Logic)** | **Local (Your PC)** | CPU / 32GB RAM | Run the Python server locally. |
| **Purple Agent (Logic)** | **Local (Your PC)** | CPU / 32GB RAM | Run the Python script locally. |
| **Model Backend (vLLM)** | **GCP (L4 GPU)** | **$0 (Credits)** | Rent an **L4 GPU** instance on GCE. Install Docker + vLLM. Expose port 8000. |
| **The "Battle"** | **Hybrid Network** | N/A | Point your local agents to `http://<GCP_IP>:8000/v1` using `OPENAI_BASE_URL`. |

### Why this wins:
1.  **Fast Iteration:** You edit code locally in VS Code (no latency).
2.  **Real Model:** You test against the actual 32B model (fitting on the L4's 24GB VRAM).
3.  **Zero Cost:** Covered by GCP credits.
4.  **Compliance:** You are using the correct open-source model class.

---

## 4. Next Steps

1.  **GCP Quota:** Log in to Google Cloud Console and request quota for **1x NVIDIA L4 GPU** (Region: `us-central1` or similar). This can take 24-48 hours to approve.
2.  **Local Setup:** Ensure you have Python (`uv` recommended) installed locally.
3.  **Environment Config:** Create a `.env.hybrid` file (don't commit secrets!) to switch between `localhost` models and the GCP IP.
