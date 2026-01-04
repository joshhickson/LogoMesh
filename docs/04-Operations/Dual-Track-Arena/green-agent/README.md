---
status: ACTIVE
type: Spec
---
# Green Agent (The Judge)

## Role
The Green Agent is the **Orchestrator** and **Evaluator** for the AgentBeats competition.
*   **Track:** Custom Track (Creating a New Benchmark).
*   **Function:** It sends coding/security tasks to the Purple Agent, optionally sends the solution to the Red Agent for attacking, and then calculates the **Contextual Integrity Score (CIS)**.

## Technical Implementation
*   **Source Code:** `src/green_logic/`
    *   `server.py`: FastAPI server implementing the A2A protocol.
    *   `scoring.py`: Implementation of Vector Scoring (Cosine Similarity).
    *   `storage.py`: DBOM and Session Persistence logic.
*   **Deployment:**
    *   **Production:** Lambda Cloud H100 Instance (Dockerized).
    *   **Development:** Local Python (`uv run`) or Hybrid (Local logic + GCP Model API).

## Current Status (2026-01-03)
*   ✅ **Iron Sharpens Iron Loop:** Fully implemented (`Purple -> Red -> Green`).
*   ✅ **A2A Compliance:** Verified JSON-RPC over HTTP.
*   ✅ **Model:** `Qwen/Qwen2.5-Coder-32B-Instruct` (via vLLM).
*   🚧 **Vector Math:** Logic is defined in `../Embedding-Vectors/`, implementation in progress (Task 3.1).
*   🚧 **Persistence:** Crash-proof logging is a P0 priority.
