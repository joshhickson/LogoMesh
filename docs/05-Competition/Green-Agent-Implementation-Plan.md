> **Status:** ACTIVE
> **Type:** Plan
> **Context:** Green Agent, AgentBeats SDK, Implementation Roadmap

# Green Agent Implementation Plan

## 1. Overview

This document outlines the incremental implementation plan for the LogoMesh Green Agent - an orchestrator that evaluates "purple agents" (coding agents) for contextual debt in code generation tasks.

**Goal:** Build a green agent that:
1. Receives purple agent endpoints from the AgentBeats platform
2. Sends coding tasks to purple agents
3. Analyzes their responses using our existing analyzers
4. Reports contextual debt scores back to the platform

## 2. Architecture Mapping

### Current LogoMesh Architecture
```
@logomesh/server     → HTTP API endpoint
@logomesh/core       → Evaluation orchestrator + analyzers
@logomesh/contracts  → Shared types
@logomesh/workers    → Rationale, Architecture, Testing analyzers
```

### AgentBeats Integration Points
```
AgentBeats Backend → A2A Protocol → Green Agent → LogoMesh Core → Analyzers
                                        ↓
                                  Purple Agent (target)
```

## 3. Implementation Phases

### Phase 1: Scaffold Green Agent Package
**Goal:** Create minimal green agent that can register with AgentBeats

Tasks:
- [ ] Create `packages/green-agent/` directory structure
- [ ] Set up Python environment with `pyproject.toml`
- [ ] Install agentbeats SDK dependency
- [ ] Create `agent_card.toml` with green agent role definition
- [ ] Create basic `main.py` that loads agent card and runs

Files to create:
```
packages/green-agent/
├── pyproject.toml
├── agent_card.toml
├── src/
│   └── green_agent/
│       ├── __init__.py
│       └── main.py
```

### Phase 2: Define Scenario Configuration
**Goal:** Create scenario.toml for contextual debt evaluation

Tasks:
- [ ] Create `scenarios/contextual_debt/` directory
- [ ] Define `scenario.toml` with green agent config
- [ ] Define participant requirements (purple_agent role)
- [ ] Configure MCP server connections for logging

Key decisions:
- Single purple agent per battle (1v1 evaluation)
- Timeout: 300 seconds (code generation takes time)
- Model: configurable via environment

### Phase 3: Implement Core Tools
**Goal:** Create tools the green agent uses during battle

Tools needed:
```python
@ab.tool
def get_coding_task() -> str:
    """Fetch a coding task from the task bank."""

@ab.tool
def evaluate_solution(code: str, rationale: str, task_id: str) -> dict:
    """Run all analyzers on the purple agent's solution."""

@ab.tool
def calculate_contextual_debt(rationale_score: float, arch_score: float, test_score: float) -> float:
    """Aggregate scores into final contextual debt score."""
```

### Phase 4: Implement Battle Flow
**Goal:** Orchestrate the evaluation battle

Battle stages:
1. **Setup** - Receive purple agent URL, battle ID
2. **Task Assignment** - Get task, send to purple agent via A2A
3. **Solution Collection** - Receive code + rationale from purple agent
4. **Analysis** - Run through rationale, architecture, testing analyzers
5. **Scoring** - Calculate contextual debt score
6. **Reporting** - Report results to AgentBeats backend

### Phase 5: Bridge to TypeScript Core
**Goal:** Connect Python green agent to existing TS analyzers

Options:
1. **HTTP Bridge** - Green agent calls @logomesh/server HTTP endpoints
2. **Direct Integration** - Rewrite analyzers in Python
3. **Subprocess** - Call Node.js from Python

Recommended: **HTTP Bridge** (simplest, leverages existing code)

Tasks:
- [ ] Ensure @logomesh/server exposes internal analysis endpoints
- [ ] Green agent makes HTTP calls to localhost server
- [ ] Handle response parsing and error cases

### Phase 6: Testing & Validation
**Goal:** Ensure green agent works end-to-end

Tasks:
- [ ] Create mock purple agent for testing
- [ ] Test registration with AgentBeats backend
- [ ] Test battle flow locally
- [ ] Test with real purple agents
- [ ] Validate scoring accuracy

### Phase 7: Production Hardening
**Goal:** Make green agent competition-ready

Tasks:
- [ ] Add comprehensive error handling
- [ ] Implement timeout handling
- [ ] Add retry logic for A2A failures
- [ ] Add detailed logging via MCP
- [ ] Docker containerization
- [ ] Environment configuration

## 4. File Structure (Final)

```
packages/green-agent/
├── pyproject.toml
├── agent_card.toml
├── Dockerfile
├── src/
│   └── green_agent/
│       ├── __init__.py
│       ├── main.py              # Entry point
│       ├── tools.py             # @ab.tool definitions
│       ├── battle_flow.py       # Battle orchestration logic
│       └── bridge.py            # HTTP bridge to TS analyzers

scenarios/contextual_debt/
├── scenario.toml
├── README.md
└── sample_tasks/
    └── task_bank.json
```

## 5. Dependencies

### Python (green-agent)
```toml
[project]
dependencies = [
    "agentbeats>=1.2.0",
    "httpx>=0.27.0",      # Async HTTP client
    "pydantic>=2.0.0",    # Data validation
]
```

### Node.js (existing)
- Keep existing @logomesh/* packages
- Add internal API endpoint for green agent access

## 6. Key Interfaces

### A2A Message: Task Assignment
```json
{
    "type": "task_assignment",
    "battle_id": "uuid",
    "task": {
        "id": "task-001",
        "description": "Implement a function...",
        "requirements": ["must handle edge cases", "include tests"],
        "context": { ... }
    }
}
```

### A2A Message: Solution Submission
```json
{
    "type": "solution_submission",
    "battle_id": "uuid",
    "solution": {
        "code": "function foo() { ... }",
        "rationale": "I chose this approach because...",
        "tests": "describe('foo', () => { ... })"
    }
}
```

### Evaluation Result
```json
{
    "contextualDebtScore": 0.77,
    "breakdown": {
        "rationaleDebt": { "score": 0.90, "details": { ... } },
        "architecturalCoherenceDebt": { "score": 0.80, "details": { ... } },
        "testingVerificationDebt": { "score": 0.60, "details": { ... } }
    }
}
```

## 7. Risk Mitigation

| Risk | Mitigation |
|:-----|:-----------|
| A2A timeouts | Implement exponential backoff, clear timeout messaging |
| Analyzer failures | Graceful degradation, report partial scores |
| Purple agent crashes | Catch exceptions, report as purple agent loss |
| Network issues | Retry logic, health checks |

## 8. Success Criteria

- [ ] Green agent registers successfully with AgentBeats
- [ ] Green agent receives battle start events
- [ ] Green agent communicates with purple agents
- [ ] Green agent runs all 3 analyzers
- [ ] Green agent reports accurate contextual debt scores
- [ ] Green agent handles edge cases gracefully
- [ ] Full battle completes in <5 minutes
