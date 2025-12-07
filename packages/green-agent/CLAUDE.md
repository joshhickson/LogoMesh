# Green Agent - Claude Instructions

## What This Is

Python-based AgentBeats green agent that evaluates "purple agents" (coding agents) for **contextual debt** - a code quality metric.

## Key Files

| File | Purpose |
|:-----|:--------|
| `agent_card.toml` | System prompt & AgentBeats config |
| `scenario.toml` | `is_green=true`, participant requirements |
| `src/logomesh_green/tools.py` | 6 @ab.tool functions |
| `src/logomesh_green/main.py` | Entry point |

## Critical Constraints

1. **`is_green=true`** in scenario.toml - marks this as orchestrator, not participant
2. **Never leak secrets** to purple agents (following AgentBeats patterns)
3. **HTTP Bridge** pattern - calls LogoMesh server at `LOGOMESH_SERVER_URL`
4. **MCP tools** (`update_battle_process`, `report_on_battle_end`) log to AgentBeats backend

## Environment Variables

```bash
OPENAI_API_KEY          # Required
LOGOMESH_SERVER_URL     # Default: http://localhost:3001
AGENTBEATS_BACKEND_URL  # Default: http://localhost:9000
USE_MCP_TOOLS           # "true" to use MCP server tools
```

## Battle Flow

```
1. Receive battle_id + purple_agent_url
2. get_coding_task() → task
3. send_coding_task() → solution {sourceCode, testCode, rationale}
4. evaluate_solution() → HTTP POST to LogoMesh /v1/internal/analyze
5. report_on_battle_end() → contextualDebtScore to AgentBeats
```

## Known Issues / TODOs

- [ ] `/v1/internal/analyze` endpoint not implemented in LogoMesh server yet
- [x] ~~Dockerfile vendor path needs fixing~~ - Resolved: removed submodule, install from GitHub
- [ ] Task bank is hardcoded (create `tasks/task_bank.json`)

## Dependency: AgentBeats SDK

AgentBeats is installed directly from GitHub (not vendored as submodule):
```bash
pip install git+https://github.com/agentbeats/agentbeats.git
```

**Why not submodule?** For competition context, we're consumers of the SDK, not contributors. Direct pip install is simpler and avoids multi-stage Docker build complexity.

## Testing

```bash
# Local
pip install -e .
python -m logomesh_green.main

# Docker
docker-compose up -d green-agent
```
