> **Status:** ACTIVE
> **Type:** Log
> **Context:** Green Agent, Implementation Progress

# Green Agent Implementation Status

## Quick Start

```bash
# Local development
cd packages/green-agent
pip install -e .
python -m logomesh_green.main

# Docker
docker-compose up -d redis mcp-server api-server green-agent
```

## Architecture

```
AgentBeats Platform
       │
       ▼ (A2A Protocol)
┌──────────────────┐     ┌─────────────┐     ┌──────────────────┐
│   Green Agent    │────▶│ MCP Server  │────▶│ AgentBeats       │
│   (Python)       │     │  :9001      │     │ Backend :9000    │
│   :9040          │     └─────────────┘     └──────────────────┘
└────────┬─────────┘
         │ HTTP
         ▼
┌──────────────────┐     ┌─────────────┐
│ LogoMesh Server  │────▶│   Redis     │
│   :3001          │     │   :6379     │
└──────────────────┘     └─────────────┘
         │
         ▼
   3 Analyzers (BullMQ)
   - Rationale
   - Architectural
   - Testing
```

## Package Structure

```
packages/green-agent/
├── pyproject.toml          # Python deps: agentbeats, httpx, pydantic
├── agent_card.toml         # Green agent system prompt & config
├── scenario.toml           # AgentBeats scenario (is_green=true)
├── Dockerfile              # Green agent container
├── Dockerfile.mcp          # MCP server container
└── src/logomesh_green/
    ├── __init__.py
    ├── main.py             # Entry point
    └── tools.py            # 6 @ab.tool functions
```

## Tools Provided

| Tool | Purpose |
|:-----|:--------|
| `get_coding_task()` | Fetch task from task bank |
| `send_coding_task()` | Send task to purple agent via A2A |
| `evaluate_solution()` | Call LogoMesh server for analysis |
| `update_battle_process()` | Log progress to AgentBeats backend |
| `report_on_battle_end()` | Report final result |
| `orchestrate_evaluation()` | Full evaluation flow |

## Environment Variables

| Variable | Default | Description |
|:---------|:--------|:------------|
| `OPENAI_API_KEY` | - | Required for LLM |
| `LOGOMESH_SERVER_URL` | `http://localhost:3001` | LogoMesh API |
| `AGENTBEATS_BACKEND_URL` | `http://localhost:9000` | AgentBeats API |
| `USE_MCP_TOOLS` | `false` | Use MCP server tools |

## Battle Flow

1. **BATTLE_START** → Receive `purple_agent_url`, `battle_id`
2. **TASK_ASSIGNMENT** → `get_coding_task()` → `send_coding_task()`
3. **SOLUTION_COLLECTION** → Receive `{sourceCode, testCode, rationale}`
4. **ANALYSIS** → `evaluate_solution()` → LogoMesh server
5. **SCORING** → Calculate contextual debt (avg of 3 scores)
6. **REPORTING** → `report_on_battle_end()`

## Files Changed

| File | Status |
|:-----|:-------|
| `vendor/agentbeats` | Added (submodule) |
| `docs/05-Competition/*` | Created |
| `packages/green-agent/*` | Created |
| `docker-compose.yml` | Modified (added services) |
| `docs/00_CURRENT_TRUTH_SOURCE.md` | Updated |
