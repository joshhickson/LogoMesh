# Ethan Onboarding Brief: LogoMesh Phase 2

Welcome to the LogoMesh team, Ethan! We are excited to have you on board to help us secure a strong placement in Phase 2 of the AgentBeats competition and work towards our NeurIPS 2026 Datasets & Benchmarks submission.

This document serves as your primary reference for our current strategy and technical objectives.

## 1. The Strategic Pivot

Based on the meetings from March 3rd and 4th, we have made a crucial change in our competition strategy.

*   **Abandoned Track:** We are no longer targeting the Lambda Custom Track (deadline: March 30). We discovered that its hard limit of 4 LLM API calls per battle fundamentally breaks our live Monte Carlo Tree Search (MCTS) evaluation engine.
*   **New Target:** We are now exclusively targeting the **Cybersecurity Agent track**.
*   **Timeline:** According to the official AgentBeats schedule, the Cybersecurity Agent track takes place during **Sprint 3 (April 13 – May 3, 2026)**. We have approximately six weeks to prepare.

This pivot aligns perfectly with your team's previous success in publishing EVM-Bench, as the Phase 1 winner in the Cybersecurity track (Ethernaut Arena) focuses on auditing and exploiting Solidity smart contracts.

## 2. AgentBeats Competition Structure (Phase 2)

Phase 2 requires us to develop a **"Purple Agent"**.

*   In Phase 1, we built a "Green Agent" (evaluator/judge).
*   In Phase 2, our Purple Agent must systematically engage, navigate, and defeat the target Green Agents (like Ethernaut Arena, AgentSlug, or Chai GPT) from Phase 1.
*   **A2A Protocol:** All communication in AgentBeats happens over the Agent-to-Agent (A2A) protocol. Our Purple Agent will act as an HTTP client, fetching an "Agent Card" from the target Green Agent server, generating a Task ID, and sending our JSON-structured payloads.

## 3. Immediate Action Items & Your Role

Your primary focus will be on **algorithm design** and **literature review**.

1.  **Red Agent Adaptation:** Your most important task will be working alongside our engineer, Oleksandr, to map our existing Red Agent's MCTS mutation logic to the specific vulnerabilities tested by the Cybersecurity Green Agents (e.g., Solidity vulnerabilities, C/C++ memory fuzzing). We already have a working MCTS engine; it simply needs to be adapted for these new domain languages.
2.  **Algorithm Design Specifications:** Josh will provide written, detailed technical specifications in our Linear project management tool outlining exactly what modifications are needed for the MCTS logic so you can begin design work.
3.  **NeurIPS Data Pipeline:** We are targeting the NeurIPS 2026 Datasets and Benchmarks track. We need to format the output of our `BattleMemory` SQLite database (`data/battles.db`) into the machine-readable **Croissant metadata format**. We will rely on your academic expertise to ensure the data we generate is properly structured to support your team's paper.

## 4. Engineering Priorities

While you focus on algorithms, our internal engineering team is tackling a critical security risk:

*   **The "Uroboros" Threat (P0):** Currently, our adversarial MCTS Red Agent runs inside the main server process. Because we are now targeting real cybersecurity exploits (like C/C++ fuzzing), we must strictly containerize/air-gap the Red Agent in Docker to prevent our own host machines from being compromised. Mark (Kuan) is leading this effort.

## 5. Next Steps

1.  Review the `[2026-02-28] Architecture-Overview.md` document (provided in the shared Google Drive folder) to understand exactly how our Red Agent, Green Agent, and Battle Memory interact.
2.  Join the project management board on Linear once Josh sends the invite.
3.  Review the specific MCTS adaptation tasks once they are assigned to you.