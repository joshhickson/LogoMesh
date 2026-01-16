# System Architecture Diagrams

This document contains Mermaid diagrams illustrating the architecture and data flow of the LogoMesh Agent Arena.

## Agent Arena Architecture (Current)

```mermaid
graph TD
    subgraph Arena["Agent Arena (Docker)"]
        Green["GREEN AGENT<br/>Judge/Assessor<br/>Port 9000"]
        Purple["PURPLE AGENT<br/>Defender/Assessee<br/>Port 9001"]
        Red["RED AGENT<br/>Attacker<br/>Port 9021"]
        Brain["vLLM BRAIN<br/>Qwen2.5-Coder-32B<br/>Port 8000"]

        Green -->|1. Send Task| Purple
        Purple -->|2. Return Solution| Green
        Green -->|3. Send Code| Red
        Red -->|4. Return Vulns| Green
        Green -->|5. Compute CIS| Report[Final Report]

        Green -.->|LLM Calls| Brain
        Purple -.->|LLM Calls| Brain
        Red -.->|LLM Calls| Brain
    end
```

## Red Agent V2 Internal Architecture

```mermaid
graph TD
    subgraph RedAgent["Red Agent V2"]
        Input[Purple's Code] --> L1

        subgraph L1["Layer 1: Static Analysis"]
            SM[StaticMirrorWorker]
            CB[ConstraintBreakerWorker]
        end

        L1 --> Decision{Critical<br/>Found?}
        Decision -->|No| L2
        Decision -->|Yes| Output

        subgraph L2["Layer 2: Smart Reasoning"]
            LLM[LLM Analysis]
        end

        L2 --> Decision2{Critical<br/>Found?}
        Decision2 -->|No| L3
        Decision2 -->|Yes| Output

        subgraph L3["Layer 3: Reflection"]
            Deep[Deep Analysis]
        end

        L3 --> Output[Vulnerability Report]
    end
```

## CIS Scoring Components

```mermaid
graph LR
    subgraph CIS["Contextual Integrity Score"]
        R["R (Rationale)<br/>25%"]
        A["A (Architecture)<br/>25%"]
        T["T (Testing)<br/>25%"]
        L["L (Logic)<br/>25%"]

        R --> Final["CIS = 0.25R + 0.25A + 0.25T + 0.25L"]
        A --> Final
        T --> Final
        L --> Final
    end
```

## Legacy System Architecture (Deprecated)

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
    subgraph logomesh Monorepo
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
