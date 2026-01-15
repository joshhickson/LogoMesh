---
status: ACTIVE
type: Decision
date: 2026-01-15
---

> **Context:**
> *   [2026-01-15]: Urgent infrastructure decision for Tier 1 (Mistral) Manual Rerun.
> *   **Problem:** Windows Local Environment (WSL2 + Docker) is failing with unverified scripts.
> *   **Constraint:** Submission Deadline is < 24 hours.

# Decision: Pivot to Cloud Infrastructure (Lambda Labs)

## 1. Recommendation
**ABANDON** the local Windows/WSL2 attempt immediately.
**PROVISION** a Lambda Labs Cloud GPU Instance (Ubuntu 22.04) to complete the Tier 1 Rerun.

## 2. Justification (Why Windows Failed)
The provided PowerShell script (`setup_tier1_windows.ps1`) introduces significant complexity that differs from the repository's native Linux design:

1.  **Networking Complications:** The script attempts to bridge Docker container networks (`logomesh-net`) with the Windows Host (`localhost`) for health checks. WSL2 port forwarding is notoriously flaky for high-throughput API calls like vLLM.
2.  **Resource Contention:** Running a 7B Quantized Model (Mistral AWQ) alongside two Agent Containers and a Vector DB on a consumer GPU often triggers OOM (Out Of Memory) kills or extreme throttling, leading to the "Timeout" errors seen in previous logs.
3.  **Untested Paths:** The repository relies on `scripts/bash/launch_arena.sh`. The PowerShell script is an unverified "Copilot creation" that likely misses subtle environment variables or volume mounts defined in the official bash scripts.

## 3. The Guaranteed Path (Lambda Labs)
Using a standard Cloud GPU instance (Ubuntu) restores the environment the code was designed for.

*   **Hardware:** 1x A100 (80GB) or 1x H100. (Guarantees no OOM errors).
*   **OS:** Ubuntu 22.04 (Native Docker support, no WSL2 translation layer).
*   **Execution:** We can use the existing, proven `launch_arena.sh` script without modification.

## 4. Next Steps
1.  Josh to provision Lambda Instance.
2.  Execute the **Lambda Provisioning Plan** (attached in Briefing).
3.  Run the battle suite using standard Linux commands.
