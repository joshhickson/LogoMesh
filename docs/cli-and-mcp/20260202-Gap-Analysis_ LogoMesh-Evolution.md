# **Gap Analysis: LogoMesh Evolution**

## **From "Evaluation Arena" (Master) to "Developer Companion" (feat/cli-and-mcp)**

**Document Status:** Draft 1.2 (Verified Red Agent & DB Logic)

**Purpose:** Foundation for Architectural Visualization

**Scope:** master branch vs. feat/cli-and-mcp branch

## **1\. Executive Summary**

LogoMesh currently exists as a **Benchmark Arena** designed to evaluate third-party AI agents (Purple Agents) via network requests. The target state is a **Local CLI & MCP Tool** designed to evaluate human or AI-generated code directly within the developer's workflow (VS Code / Terminal).

This document outlines the architectural and functional gaps between these two states to guide the refactoring process.

## **2\. The "As-Is" State (Master Branch)**

**Identity:** The Arena (Server-Client Architecture)

In the master branch, LogoMesh is a centralized judge. It assumes the role of a server that dictates tasks to external entities.

### **Architecture & Data Flow**

* **Trigger:** REST API call to /actions/send\_coding\_task.  
* **Input Source:** Hardcoded "Task Library" (YAML) \+ Pre-computed Intent Vectors (tasks.yaml, intent\_vectors.json).  
  * *Note:* Vectors are generated via sentence-transformers but cached statically.  
* **Execution Environment:** DockerSandbox (default) \+ RedAgentOrchestrator.  
  * *Critical Detail:* The Red Agent uses Python's exec() internally to build dynamic tools. This is currently safe because it runs in a controlled server container.  
  * *Hard Dependency:* Docker daemon is preferred for optimal scoring isolation.  
* **Network Topology:** A2A (Agent-to-Agent) Protocol. Requires a running HTTP server for the Judge (Green) and a running HTTP server for the Candidate (Purple).  
* **Feedback Loop:** JSON-RPC over HTTP. Feedback is sent to a URL; the system waits for a remote response.  
  * *DB Coupling:* The loop writes to Battles.db on every iteration, but these are "fire-and-forget" writes (return value unused).  
* **State Management:** Battles.db (SQLite). Tightly coupled to "Battle IDs." Code cannot be scored without creating a database record first.

### **Key Limitation**

**Context Rigidity:** The system relies on TaskIntelligence loading static embeddings from disk. It cannot dynamically understand a unique coding task (e.g., a specific GitHub issue or commit message) without prior configuration.

## **3\. The "To-Be" State (feat/cli-and-mcp)**

**Identity:** The Companion (Local-First Architecture)

In the feat/cli-and-mcp branch, LogoMesh acts as a local library and tool. It accepts existing code and judges it in real-time, functioning as an intelligent layer between the developer and the repo.

### **Architecture & Data Flow**

* **Trigger:** CLI command (logomesh check) or MCP Request (via Copilot/Claude).  
* **Input Source:** Dynamic Context. Reads stdin, local files, or Git metadata.  
* **Execution Environment:** Hybrid.  
  * *Target Code:* Prioritizes LocalSubprocessSandbox for speed.  
  * *Red Agent:* Runs locally on the host. Must strictly enforce the safe\_namespace when using exec() to avoid triggering host antivirus/EDR systems.  
* **Network Topology:** Localhost / Stdio. No HTTP servers required. Logic runs as a script.  
* **Feedback Loop:** Console / IDE. Feedback is printed to stdout or rendered in the IDE via MCP. The "Refinement Loop" prompts the user (or Copilot) to apply fixes directly to the file system.  
* **State Management:** Transient. Scores are calculated on-the-fly via the Scorer class. Database writes are stripped out for the CLI version.

### **Key Innovation**

**Just-In-Time (JIT) Intelligence:** The CLI bypasses the TaskIntelligence cache and directly calls VectorScorer.get\_embedding() (using sentence-transformers) to generate intent vectors instantly from raw text (Git commit messages, PR descriptions).

## **4\. Gap Analysis: The Bridge**

### **Vision Statement**

To transform LogoMesh from a static benchmark for researchers into a dynamic, privacy-preserving integrity engine that lives inside every developer's terminal.

### **Mission Statement**

We will decouple the "Intelligence" (Scoring, Red Agent, MCTS) from the "Infrastructure" (Server, Database, Network) to create a portable CLI tool that integrates seamlessly with modern AI coding assistants via the Model Context Protocol (MCP).

### **Technical Gap Matrix**

| Feature | Current State (master) | Future State (feat/cli-and-mcp) | The Bridge (Required Action) |
| :---- | :---- | :---- | :---- |
| **Entry Point** | server.py (FastAPI) | cli.py & mcp\_server.py | Create script entry points that import logic directly. |
| **Context** | Static task\_id \-\> Cached Vector | Dynamic String \-\> JIT Vector | Expose VectorScorer.get\_embedding() directly to the CLI (import sentence-transformers). |
| **Scoring** | Wrapped in score\_battle() (DB coupled) | Direct scorer.evaluate() call | Instantiate ContextualIntegrityScorer directly in CLI. |
| **Execution** | DockerSandbox (Default) | LocalSubprocessSandbox (Default) | Configure Sandbox initialization to default to subprocess in CLI mode. |
| **Red Agent** | Uses exec() in server container | Uses exec() on Host Machine | **Risk:** Ensure safe\_namespace logic in orchestrator.py is robust; CLI should warn user about heuristic scans. |
| **Feedback** | requests.post() \+ DB Write | stdout / MCP Response | Abstract feedback into a FeedbackChannel; **Delete** db.update\_battle calls in CLI implementation. |
| **Config** | OPENAI\_API\_KEY (Required for default provider) | OPENAI\_BASE\_URL (Local override) | Document OPENAI\_BASE\_URL usage for local vLLM support (no new provider class needed). |

