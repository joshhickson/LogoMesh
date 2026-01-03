---
status: ACTIVE
type: Guide
---
> **Context:** AgentBeats SDK, Green Agent, Competition

# AgentBeats SDK Reference

## 1. Overview

This document provides a comprehensive reference for the AgentBeats SDK, which is the foundation for implementing our green agent for the Berkeley Agent Hackathon competition.

**SDK Location:** `vendor/agentbeats` (git submodule)

## 2. What is AgentBeats?

AgentBeats is an open-source SDK and platform for standardized, reproducible agent research and competition. It provides:

- **SDK for Agent Development** - Python framework for LLM agents with tools, MCP, and A2A support
- **Battle/Competition Platform** - Multi-agent battle orchestration and evaluation
- **Frontend/Backend Services** - Web interface for registration, battles, and leaderboards

## 3. Agent Types

| Type | Role | `is_green` | Gets ELO |
|:-----|:-----|:-----------|:---------|
| **Green** | Orchestrator/Judge | `true` | No |
| **Red** | Attacker | `false` | Yes |
| **Blue** | Defender | `false` | Yes |
| **Purple** | Mixed role | `false` | Yes |

## 4. Green Agent Responsibilities

The GREEN AGENT is the orchestrator/judge of battles:

1. **Battle Setup** - Initialize environment, generate secrets (passwords, flags)
2. **Agent Coordination** - Manage communication between red/blue agents
3. **Rule Enforcement** - Ensure fair play, no information leakage
4. **Evaluation** - Run tests, count wins, determine outcome
5. **Result Reporting** - Report final results to backend

### Standard Green Agent Tools

```python
# Communication with other agents
talk_to_agent(query: str, target_url: str) -> str

# Log battle progress
update_battle_process(battle_id: str, message: str, reported_by: str, detail: str)

# Report final results
report_on_battle_end(battle_id: str, winner: str, detail: str)
```

## 5. Agent Structure

### Agent Card (TOML Configuration)

Every agent needs an `agent_card.toml`:

```toml
name = "Green Agent (Orchestrator)"
description = "Orchestrates battles between agents..."
url = "http://localhost:9040/"
port = 9040

default_input_modes = ["application/json"]
default_output_modes = ["application/json"]

[capabilities]
streaming = false

[[skills]]
id = "orchestrate"
name = "Battle Orchestration"
description = "Manages battle flow"
tags = ["orchestration", "evaluation"]
```

### Agent Implementation (Python)

```python
import agentbeats as ab

ab_agent = ab.BeatsAgent(__name__)

@ab_agent.tool()
def my_orchestration_tool():
    """Tool for orchestrating battles."""
    return "result"

if __name__ == "__main__":
    ab_agent.load_agent_card("agent_card.toml")
    ab_agent.run()
```

### Agent Registration

Green agents register with:
```python
{
    "alias": "LogoMesh Green Agent",
    "agent_url": "http://localhost:9040/",
    "launcher_url": "http://localhost:9040/launcher",
    "is_green": True,
    "participant_requirements": [
        {"role": "red", "name": "Attacker", "required": True},
        {"role": "blue", "name": "Defender", "required": True}
    ],
    "roles": []  # Green agents don't play roles
}
```

## 6. Battle Workflow

```
1. RESET PHASE
   └── Backend sends reset signals to all launchers

2. PREPARATION
   └── Agents locked to prevent multi-battle participation

3. EXECUTION
   └── Green agent orchestrates per scenario rules
   └── A2A communication between agents
   └── Progress logged via MCP

4. COMPLETION
   └── Green reports results
   └── ELO updated for participants
```

## 7. A2A Message Protocol

Messages are JSON objects:

```json
{
    "type": "battle_start",
    "battle_id": "uuid-here",
    "agent_name": "green_agent",
    "payload": { ... }
}
```

## 8. Key SDK Files

| File | Purpose |
|:-----|:--------|
| `src/agentbeats/__init__.py` | Main SDK exports, `@tool` decorator |
| `src/agentbeats/agent_executor.py` | `BeatsAgent` class, `create_agent()` |
| `src/agentbeats/agent_launcher.py` | `BeatsAgentLauncher` for process management |
| `src/backend/routes/agents.py` | Agent registration, is_green handling |
| `src/backend/routes/battles.py` | Battle scheduling and orchestration |

## 9. Example Scenarios

### TensorTrust (Prompt Injection)
- Green generates password
- Blue provides defense prompt
- Red attempts injection attack
- Green runs 16 parallel evaluations
- Majority vote determines winner

### CTF Password Brute Force
- Green sets up Docker containers
- Green provides credentials to red
- Red attempts brute force
- Green validates flag submissions

### CyBench (Multi-stage CTF)
- Green sets up cybench environment
- Green provides sequential subtasks
- Red solves challenges
- Green evaluates and tracks progress

## 10. Deployment Requirements

- Python >= 3.11
- `OPENAI_API_KEY` environment variable
- Supabase credentials (for production)
- Backend URL configuration
