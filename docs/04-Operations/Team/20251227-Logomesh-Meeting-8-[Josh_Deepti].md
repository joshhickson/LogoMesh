# **Meeting Minutes: AgentBeats Project Sync**

Date: December 27, 2025  
Attendees: Josh, Deepthi  
Absent: Mark, Samuel, Aladdin (Alaa) Subject: Code Consolidation, Model Selection, and Competition Strategy

## **1\. Executive Summary**

The team is consolidating distinct agent codebases (Samuel's Green/Purple agents and Mark's Red/Blue agents) to satisfy requirements for the **Berkeley AgentBeats Competition**. The strategy involves a **dual-track submission**:

1. **Lambda Track (Safety):** Submitting a Red Agent (Attacker) and Blue/Purple Agent (Defender).  
2. **Custom Track:** Submitting a Green Agent (Evaluator) with a Mock Purple Agent.

Current focus is on migrating the Green Agent from an API-based judge (ChatGPT) to a local model (potentially Llama) to comply with hardware constraints (NVIDIA H100).

## **2\. Competition Context & Constraints (External Verification)**

*Based on transcript discussion and Berkeley RDI AgentBeats guidelines.*

* **Competition:** AgentX \- AgentBeats (Phase 1: Green Agent due Jan 15, 2026; Phase 2: Purple Agent due Feb 22, 2026).  
* **Hardware Constraint:** Models must ideally run on a single **NVIDIA H100 GPU (80GB VRAM)**.  
  * *Note:* This constraint forces the use of open-weights models (e.g., Llama 3.1 70B/8B, Qwen) rather than proprietary APIs (OpenAI/Anthropic) for the agent logic itself, unless the track explicitly allows API calls (which the team believes it does not for the core loop).  
* **Scoring:** "Presentation" is cited as a significant scoring factor, motivating the move from Terminal CLI to Web UI.

## **3\. Discussion Points**

### **A. Agent Architecture & Consolidation**

* **Current State:**  
  * **Green Agent (Evaluator):** Currently uses ChatGPT API (Samuel's implementation). Needs to be refactored to use a local model.  
  * **Purple Agent (Target/Defender):** Being created by consolidating Samuel's Purple Agent and Mark's Blue Agent.  
  * **Red Agent (Attacker):** Developed by Mark; used to stress-test the Purple Agent and validate the Green Agent's evaluation capabilities ("Iron sharpens iron").  
* **Migration Plan:** Josh is centralizing code into a new structure involving Docker containers for Python (Agents) and Node.js (UI).

### **B. Model Selection (Llama vs. Others)**

* **Issue:** Deepthi raised concerns about Llama's performance ("failure," "nowhere near the top") based on previous evaluations.  
* **Constraint Check:** Josh clarified that the 80GB VRAM limit on the H100 necessitates a model that fits in memory.  
  * *Analysis:* A Llama-3-70B model (approx. 40GB quantified or \~140GB FP16) may require 4-bit/8-bit quantization to fit comfortably on a single H100 80GB card. Llama-3-8B fits easily.  
* **Decision:** Team needs to verify which specific model Mark is using on the Lambda instance and confirm it fits the H100 constraints while maintaining acceptable intelligence.

### **C. UI/UX Strategy**

* **Shift to Web UI:** Josh proposed wrapping the agents in a Node.js Web UI to replace the current terminal prompt.  
* **Rationale:** Convenience for judges and higher presentation scores. Deepthi agreed this is critical for ranking.

## **4\. Action Items**

| Owner | Task | Deadline |
| :---- | :---- | :---- |
| **Josh** | Consolidate Samuel’s and Mark’s code into the new containerized structure. | Next Meeting |
| **Josh** | Verify specific hardware constraints (Single H100 vs. Cluster) and memory limits (80GB). | ASAP |
| **Deepthi** | Meet with Mark and Samuel to review their current implementations and the consolidation plan. | Before Next Meeting |
| **Deepthi** | Update the architecture diagram (Miro board) to reflect the new 4-Agent structure (Green, Purple, Red, Blue). | Next Meeting |
| **Josh** | Schedule combined team meeting with Mark, Samuel, and Aladdin. | After Jan 1, 2026 |

## **5\. Next Steps**

* **Technical Verification:** Confirm if the "7DB" (Llama 70B/7B) model is sufficient or if a different open-weights model (e.g., from Nebius or other sponsors) is preferable.  
* **UI Development:** Begin Node.js implementation for the Web Interface.