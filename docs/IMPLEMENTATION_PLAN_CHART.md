
# Phase 2 Implementation Plan - Visual Chart

This document contains a Mermaid chart visualization of the Phase 2 Implementation Plan for the LogoMesh project.

## Implementation Timeline Chart

```mermaid
gantt
    title Phase 2 Implementation Plan - 4 Week Timeline
    dateFormat  YYYY-MM-DD
    section Week 1: Foundation
    TypeScript Migration (Core/Server)    :crit, ts-migration, 2024-01-01, 2d
    Secrets Management Stub               :secrets, after ts-migration, 1d
    Rate Limit + Health Check            :rate-limit, after secrets, 1d
    Week 1 Buffer                        :buffer1, after rate-limit, 1d
    
    section Week 2: LLM + Plugin
    Slice LLM Monolith                   :crit, llm-slice, 2024-01-08, 3d
    Basic Plugin Sandbox                 :plugin-sandbox, after llm-slice, 2d
    Week 2 Bug Pit Buffer               :buffer2, after plugin-sandbox, 0.5d
    
    section Week 3: EventBus + Storage
    EventBus Back-pressure               :crit, eventbus, 2024-01-15, 3d
    Storage Service Boundary             :storage, after eventbus, 2d
    
    section Week 4: TaskEngine + Load
    Basic TaskEngine                     :crit, taskengine, 2024-01-22, 4d
    Load Test & Stabilize               :load-test, after taskengine, 2d
    Scope Cut Deadline                  :milestone, scope-cut, 2024-01-28, 0d
```

## Architecture Flow Chart

```mermaid
flowchart TB
    subgraph "Week 1: Foundation Reality Check"
        A1[TypeScript Migration<br/>Core & Server Only]
        A2[Secrets Management<br/>Basic JWT + .env]
        A3[Rate Limit + Health<br/>100rpm/IP + /status]
        A1 --> A2 --> A3
    end
    
    subgraph "Week 2: LLM Spine + Plugin Foundation"
        B1[LLM Gateway<br/>Rate Limit + Auth]
        B2[ConversationOrchestrator<br/>State Machine Only]
        B3[RunnerPool<br/>Per-Model Execution]
        B4[Plugin Sandbox<br/>vm2 + Node.js Only]
        B1 --> B2 --> B3 --> B4
    end
    
    subgraph "Week 3: EventBus Reliability + Storage"
        C1[EventBus Back-pressure<br/>In-Memory + Exponential Backoff]
        C2[Message Deduplication<br/>deliveryId + Dedupe Table]
        C3[DataAccessService<br/>Abstract Storage Coupling]
        C1 --> C2 --> C3
    end
    
    subgraph "Week 4: TaskEngine + Load Testing"
        D1[Multi-Executor Support<br/>Extend LLMTaskRunner]
        D2[ExecutorRegistry<br/>LLM + Plugin Only]
        D3[Pipeline Schema<br/>JSON Workflows + Version]
        D4[Load Testing<br/>250rpm + Performance]
        D1 --> D2 --> D3 --> D4
    end
    
    A3 --> B1
    B4 --> C1
    C3 --> D1
    
    subgraph "Verification Gates"
        VG1[✅ TS Strict + ESLint Pass]
        VG2[✅ JWT Auth + Rate Limits]
        VG3[✅ Plugin Isolation + Sandbox]
        VG4[✅ EventBus 5k Messages]
        VG5[✅ Artillery 250rpm Success]
    end
    
    A3 -.-> VG1
    B4 -.-> VG2
    B4 -.-> VG3
    C2 -.-> VG4
    D4 -.-> VG5
```

## Technical Dependencies Chart

```mermaid
graph TB
    subgraph "Layer 1: Foundation"
        TS[TypeScript Strict<br/>core/ + server/]
        SEC[Secrets Management<br/>.env + config.ts]
        RL[Rate Limiting<br/>100rpm/IP]
        HC[Health Check<br/>/status endpoint]
    end
    
    subgraph "Layer 2: LLM Infrastructure"
        LG[LLM Gateway]
        CO[ConversationOrchestrator]
        RP[RunnerPool]
        PS[Plugin Sandbox]
    end
    
    subgraph "Layer 3: Coordination"
        EB[EventBus<br/>Back-pressure]
        MD[Message Deduplication]
        SS[Storage Service<br/>Boundary]
    end
    
    subgraph "Layer 4: Orchestration"
        TE[TaskEngine<br/>Multi-Executor]
        ER[ExecutorRegistry]
        PJ[Pipeline JSON<br/>Schema + Version]
        LT[Load Testing<br/>Performance Gates]
    end
    
    subgraph "Deferred to Phase 2b"
        DS[DevShell UI]
        ML[Multi-Language Plugins]
        VS[Vector Search]
        PM[Plugin Marketplace]
        WS[WebSocket Real-time]
        AS[Advanced Security]
    end
    
    TS --> LG
    SEC --> LG
    RL --> LG
    HC --> LG
    
    LG --> EB
    CO --> EB
    RP --> EB
    PS --> EB
    
    EB --> TE
    MD --> TE
    SS --> TE
    
    TE --> LT
    ER --> LT
    PJ --> LT
    
    LT -.-> DS
    LT -.-> ML
    LT -.-> VS
    LT -.-> PM
    LT -.-> WS
    LT -.-> AS
    
    classDef foundation fill:#e1f5fe
    classDef llm fill:#f3e5f5
    classDef coordination fill:#e8f5e8
    classDef orchestration fill:#fff3e0
    classDef deferred fill:#ffebee,stroke:#f44336,stroke-dasharray: 5 5
    
    class TS,SEC,RL,HC foundation
    class LG,CO,RP,PS llm
    class EB,MD,SS coordination
    class TE,ER,PJ,LT orchestration
    class DS,ML,VS,PM,WS,AS deferred
```

## Critical Path Analysis

```mermaid
graph LR
    subgraph "Critical Path (Cannot be parallelized)"
        CP1[TypeScript Migration<br/>Days 1-2]
        CP2[LLM Monolith Slicing<br/>Days 6-8]
        CP3[EventBus Back-pressure<br/>Days 11-13]
        CP4[TaskEngine Implementation<br/>Days 18-21]
        CP5[Load Testing<br/>Days 22-23]
    end
    
    subgraph "Parallel Work (Can overlap)"
        P1[Secrets Management<br/>Day 3]
        P2[Rate Limiting<br/>Day 4]
        P3[Plugin Sandbox<br/>Days 9-10]
        P4[Storage Boundary<br/>Days 14-15]
    end
    
    subgraph "Buffer Zones"
        B1[Week 1 Slip<br/>Day 5 MAX]
        B2[Bug Pit<br/>Day 11 AM]
        B3[Scope Cut<br/>Day 24 Noon]
    end
    
    CP1 --> CP2
    CP2 --> CP3
    CP3 --> CP4
    CP4 --> CP5
    
    CP1 --> P1
    P1 --> P2
    CP2 --> P3
    CP3 --> P4
    
    P2 -.-> B1
    P3 -.-> B2
    CP5 -.-> B3
    
    classDef critical fill:#ffcdd2,stroke:#d32f2f
    classDef parallel fill:#c8e6c9,stroke:#388e3c
    classDef buffer fill:#fff3e0,stroke:#f57c00
    
    class CP1,CP2,CP3,CP4,CP5 critical
    class P1,P2,P3,P4 parallel
    class B1,B2,B3 buffer
```

## Success Criteria Checklist

```mermaid
flowchart TD
    subgraph "Essential Gates (Binary Pass/Fail)"
        G1[✅ TS strict passes core, server]
        G2[✅ ESLint zero warnings core/server]
        G3[✅ JWT auth login round-trip]
        G4[✅ Rate-limit 100rpm tested]
        G5[✅ /status returns 200 + metrics]
        G6[✅ Plugin starvation test <5s]
        G7[✅ Plugin cannot read /etc/passwd]
        G8[✅ EventBus drains 5k messages]
        G9[✅ TaskEngine <5s median LLM→Plugin]
        G10[✅ Artillery 250rpm: no 5xx, ≤2% 429]
        G11[✅ p50 API ≤250ms, p95 ≤600ms]
        G12[✅ No any types in src/ stretch]
    end
    
    subgraph "Week Dependencies"
        W1[Week 1 Complete] --> G1
        W1 --> G2
        W1 --> G3
        W1 --> G4
        W1 --> G5
        
        W2[Week 2 Complete] --> G6
        W2 --> G7
        
        W3[Week 3 Complete] --> G8
        
        W4[Week 4 Complete] --> G9
        W4 --> G10
        W4 --> G11
        W4 --> G12
    end
    
    subgraph "Final Outcome"
        SUCCESS[🚀 Hardened Spine<br/>Ready for Phase 2b]
    end
    
    G1 --> SUCCESS
    G2 --> SUCCESS
    G3 --> SUCCESS
    G4 --> SUCCESS
    G5 --> SUCCESS
    G6 --> SUCCESS
    G7 --> SUCCESS
    G8 --> SUCCESS
    G9 --> SUCCESS
    G10 --> SUCCESS
    G11 --> SUCCESS
    G12 --> SUCCESS
    
    classDef gate fill:#e8f5e8,stroke:#2e7d32
    classDef week fill:#e3f2fd,stroke:#1976d2
    classDef success fill:#f3e5f5,stroke:#7b1fa2
    
    class G1,G2,G3,G4,G5,G6,G7,G8,G9,G10,G11,G12 gate
    class W1,W2,W3,W4 week
    class SUCCESS success
```

## Risk Mitigation Strategy

```mermaid
graph TB
    subgraph "High-Risk Areas"
        R1[TypeScript Migration<br/>Breaking Changes]
        R2[LLM Refactoring<br/>State Management]
        R3[EventBus Performance<br/>Memory Leaks]
        R4[Load Testing<br/>Replit Limits]
    end
    
    subgraph "Mitigation Strategies"
        M1[Incremental Migration<br/>Module by Module]
        M2[Keep Existing Audit<br/>Don't Rebuild]
        M3[In-Memory Only<br/>Defer Persistence]
        M4[Local Docker/Paid VM<br/>Realistic Testing]
    end
    
    subgraph "Escape Hatches"
        E1[Day 5 Slip Allowed<br/>TS Strict Only]
        E2[Bug Pit Day 11 AM<br/>No Features]
        E3[Day 24 Scope Cut<br/>Lock Branch]
    end
    
    R1 --> M1
    R2 --> M2
    R3 --> M3
    R4 --> M4
    
    M1 -.-> E1
    M2 -.-> E2
    M3 -.-> E2
    M4 -.-> E3
    
    classDef risk fill:#ffcdd2,stroke:#d32f2f
    classDef mitigation fill:#c8e6c9,stroke:#388e3c
    classDef escape fill:#fff3e0,stroke:#f57c00
    
    class R1,R2,R3,R4 risk
    class M1,M2,M3,M4 mitigation
    class E1,E2,E3 escape
```
