# System Architecture Diagrams

This document contains Mermaid diagrams illustrating the architecture and data flow of the LogoMesh Green Agent.

## Original System Architecture

```mermaid
graph TD
    subgraph Green Agent System
        A[API Endpoint] --> B[Orchestrator Agent];
        B --> |1. Decompose Task| C{Rationale Analyzer Worker};
        B --> |1. Decompose Task| D{Architecture Analyzer Worker};
        B --> |1. Decompose Task| E{Testing Analyzer Worker};

        C --> F[LLM API];
        D --> G[Static Analysis Tool];
        E --> H[Test Execution Sandbox];

        subgraph Security & Audit
            I(Auth0 FGA) -.-> H;
            J[Audit Logger] <-.-> C;
            J <-.-> D;
            J <-.-> E;
        end

        F --> C;
        G --> D;
        H --> E;

        C --> |2. Report Results| B;
        D --> |2. Report Results| B;
        E --> |2. Report Results| B;

        B --> |3. Aggregate & Finalize| K[Final Report];
    end
```

## Monorepo Package Structure

```mermaid
graph TD
    subgraph @logomesh Monorepo
        Server["@logomesh/server"];
        Core["@logomesh/core"];
        Contracts["@logomesh/contracts"];
        MockAgent["@logomesh/mock-agent"];
        Frontend["@logomesh/frontend"];
    end

    Server --> Core;
    Core --> Contracts;
```

## Green Agent Request Lifecycle

```mermaid
sequenceDiagram
    participant Client
    participant Server as @logomesh/server
    participant Orchestrator as @logomesh/core
    participant Analyzers as @logomesh/core
    participant Storage as @logomesh/core
    participant PurpleAgent as External Agent

    Client->>+Server: POST /v1/evaluate (purple_agent_endpoint)
    Server->>+Orchestrator: runEvaluation(endpoint)
    Orchestrator->>+Storage: getTask()
    Storage-->>-Orchestrator: return task
    Orchestrator->>+PurpleAgent: sendTask(task)
    PurpleAgent-->>-Orchestrator: return solution (code + rationale)
    Orchestrator->>+Analyzers: analyze(solution)
    Analyzers-->>-Orchestrator: return scores
    Orchestrator->>+Storage: saveReport(report)
    Storage-->>-Orchestrator: return saved report
    Orchestrator-->>-Server: return report
    Server-->>-Client: 200 OK (report)
```
