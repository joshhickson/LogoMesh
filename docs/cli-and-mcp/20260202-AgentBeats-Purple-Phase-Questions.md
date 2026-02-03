---
status: [DRAFT]
type: [Plan]
---
> **Context:**
> *   [2026-02-02]: This document lists the critical questions that need to be answered to prepare for the AgentBeats Phase Purple competition.

# AgentBeats Phase Purple: Unanswered Questions

This document outlines the key strategic, architectural, and operational questions we must answer to successfully compete in the AgentBeats Phase Purple competition.

## Strategic & Competitive Questions

1.  How do we accurately classify incoming tasks as "simple" vs. "complex" to trigger the Adaptive Compute strategy (System 1 vs. System 2)? What are the potential failure modes of this classifier?
2.  What is the maximum acceptable latency for a "simple" task versus a "complex" task to avoid timeouts while still providing a high-quality solution?
3.  Who are the top 3 competing teams from Phase 1, and what were their winning strategies? How does our "Internal Green Agent" strategy compare to their approaches?
4.  The "Agentless" strategy was successful in SWE-bench. What are the exact mechanics of their "Localization -> Repair -> Rejection Sampling" flow, and can we integrate parts of it into our "Fast Path" (System 1)?
5.  How will we measure the performance of our own agent internally? What is our "pre-submission" evaluation criteria to decide if a generated solution is good enough to send to the official judges?

## External Research Questions (For Web Agent)

These questions are designed to be handed off to a research agent with internet access to gather public information about the AgentBeats competition and its technical requirements.

6.  What is the definitive specification for the Agent-to-Agent (A2A) protocol used by AgentBeats? I need the exact JSON-RPC request/response formats, including required headers, authentication methods, and error handling standards.
    *   *Initial Guess: The answer may be in the cloned (and potentially outdated) A2A repository at `external/A2A-main/`.*

    **Initial Findings from `external/A2A-main/`:**
    *   **Canonical Source:** The definitive specification is the Protocol Buffers (proto3) file located at `specification/grpc/a2a.proto`. The JSON specification is a non-normative build artifact derived from this file.
    *   **Transport Protocols:** The protocol officially supports `JSONRPC`, `GRPC`, and `HTTP+JSON` as protocol bindings, which are declared in the `AgentCard`.
    *   **Core RPC Methods:** The primary methods for interaction are `SendMessage` (unary) and `SendStreamingMessage` (server-streaming). There are also methods for task management (`GetTask`, `ListTasks`, `CancelTask`, `SubscribeToTask`).
    *   **Message Structure:** A `Message` consists of one or more `Part` objects. A `Part` can be `text`, a `FilePart` (URI or base64 bytes), or a `DataPart` (structured JSON). This confirms that tasks can include file attachments and structured data, not just text.
    *   **Authentication:** The spec defines a comprehensive `SecurityScheme` object that supports API Keys, HTTP Auth (Bearer), OAuth 2.0, OpenID Connect, and mTLS. The specific scheme required is declared in the agent's `AgentCard`.

    **New Questions Based on Findings:**
    *   Given that the competition likely uses JSON-RPC over HTTP, what is the exact structure of the JSON body for a `SendMessage` request? Does it wrap the `Message` protobuf object, and if so, what are the field names?
    *   The `a2a.proto` file defines multiple services and methods (`GetTask`, `ListTasks`, etc.). Are Purple Agents required to implement the full `A2AService` specification, or only the `SendMessage` endpoint?
    *   The protocol supports streaming responses (`SendStreamingMessage`). Is this expected or required for certain tasks in the competition? How are streaming chunks formatted (e.g., Server-Sent Events)?
    *   How is authentication handled in the context of the competition? Will judges provide a Bearer token or API key, or will requests be unauthenticated?

7.  What is the standard discovery and registration process for a Purple Agent? Find the specification for the `/.well-known/agent.json` file or any similar mechanism. What specific fields are required (e.g., `name`, `capabilities`, `endpoints`)?
8.  What are the technical specifications of the official evaluation environment? Research details on the operating system, CPU/GPU resources, memory limits, pre-installed system libraries (e.g., `build-essential`, `git`), and any restrictions on network access.
9.  What are the official timeout limits for task completion in Phase Purple? I need to find documentation specifying the time allotted per task, per interaction, and the penalty for exceeding them.
    *   *Initial Guess: This may be highly dependent on the specific Green Agent we compete against or broader environmental limitations.*
10. Are there public examples or reference implementations of Phase Purple agents from previous years or similar competitions? Find any open-source repositories that demonstrate the A2A protocol in action.
11. What are the specific rules regarding the use of external libraries or dependencies? Can agents install packages using `pip` or `npm` during the evaluation, or must all dependencies be pre-packaged in the agent's container?
    *   *Initial Guess: This may be highly dependent on the specific Green Agent we compete against or broader environmental limitations.*
12. How does the judging system handle agent failures or crashes? What is the protocol if an agent's endpoint becomes unresponsive or returns a non-compliant response?
    *   *Initial Guess: This may be highly dependent on the specific Green Agent we compete against or broader environmental limitations.*
13. What is the data format for the tasks sent to the agent? Are they purely text descriptions, or do they include file attachments, diffs, or other structured data?
14. What are the logging and observability requirements for a Purple Agent? Will we need to expose a specific endpoint for logs, or is `stdout`/`stderr` sufficient?
15. Besides the final code artifact, what other metadata is required upon submission? For example, does the A2A response need to include execution time, resource usage, or a confidence score?
