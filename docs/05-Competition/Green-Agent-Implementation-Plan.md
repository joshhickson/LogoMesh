---
status: ACTIVE
type: Plan
---
> **Context:** Green Agent, AgentBeats SDK, Implementation Roadmap

# Green Agent Implementation Plan

## Progress Summary

| Phase | Status | Description |
|:------|:-------|:------------|
| 1 | ✅ Done | Scaffold package structure |
| 2 | ✅ Done | Scenario configuration |
| 3 | ✅ Done | Core tools implementation |
| 4 | ✅ Done | Battle flow & MCP integration |
| 5 | ⏳ Partial | HTTP bridge (needs server endpoint) |
| 6 | ❌ TODO | Testing & validation |
| 7 | ⏳ Partial | Docker done, hardening TODO |

---

## Master Checklist

### ✅ Completed

- [x] Create `packages/green-agent/` directory structure
- [x] Set up Python environment with `pyproject.toml`
- [x] Add agentbeats SDK as git submodule (`vendor/agentbeats`)
- [x] Create `agent_card.toml` with green agent role definition
- [x] Create `main.py` entry point
- [x] Create `scenario.toml` with `is_green=true` and `participant_requirements`
- [x] Implement `get_coding_task()` tool
- [x] Implement `send_coding_task()` tool (A2A communication)
- [x] Implement `evaluate_solution()` tool (HTTP to LogoMesh server)
- [x] Implement `update_battle_process()` tool (MCP/direct backend)
- [x] Implement `report_on_battle_end()` tool (MCP/direct backend)
- [x] Implement `orchestrate_evaluation()` tool (full flow)
- [x] Create `Dockerfile` for green agent
- [x] Create `Dockerfile.mcp` for MCP server
- [x] Add services to `docker-compose.yml`
- [x] Create documentation (`docs/05-Competition/`)
- [x] Update truth source (`docs/00_CURRENT_TRUTH_SOURCE.md`)

### ❌ Remaining

- [ ] **Add `/v1/internal/analyze` endpoint to `@logomesh/server`**
  - File: `packages/server/src/routes/evaluation.routes.ts`
  - Runs all 3 analyzers synchronously, returns aggregated score

- [ ] **Create task bank**
  - File: `packages/green-agent/tasks/task_bank.json`
  - Multiple coding tasks for variety

- [ ] **Test with mock purple agent**
  - Use existing `packages/mock-agent/` or create test script

- [ ] **Test AgentBeats registration**
  - Register green agent with AgentBeats backend
  - Verify `is_green=true` handling

- [ ] **End-to-end battle test**
  - Full flow: register → battle start → task → solution → analyze → report

- [ ] **Fix Dockerfile vendor path**
  - Current `COPY --from=vendor` won't work
  - Options: multi-stage build or pip install agentbeats

- [ ] **Add health check endpoints**
  - Green agent `/health` endpoint
  - MCP server health check

- [ ] **Production hardening**
  - Exponential backoff for retries
  - Comprehensive error messages
  - Timeout handling improvements

- [ ] **Commit and PR**

---

## Architecture

```
AgentBeats Platform
       │
       ▼ A2A
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
└────────┬─────────┘     └─────────────┘
         │ BullMQ
         ▼
┌──────────────────────────────────────┐
│           Analyzers                  │
│  Rationale │ Architectural │ Testing │
└──────────────────────────────────────┘
```

## Package Structure (Current)

```
packages/green-agent/
├── pyproject.toml           ✅
├── agent_card.toml          ✅
├── scenario.toml            ✅
├── README.md                ✅
├── Dockerfile               ✅
├── Dockerfile.mcp           ✅
└── src/logomesh_green/
    ├── __init__.py          ✅
    ├── main.py              ✅
    └── tools.py             ✅ (6 tools)

vendor/agentbeats/           ✅ (submodule)
```

## Key Files to Modify Next

| File | Change Needed |
|:-----|:--------------|
| `packages/server/src/routes/evaluation.routes.ts` | Add `/v1/internal/analyze` |
| `packages/green-agent/Dockerfile` | Fix vendor path |
| `packages/green-agent/tasks/task_bank.json` | Create task bank |

## Quick Commands

```bash
# Install green agent locally
cd packages/green-agent && pip install -e .

# Run green agent
python -m logomesh_green.main

# Docker (all services)
docker-compose up -d redis mcp-server api-server green-agent

# Test MCP server
curl http://localhost:9001/health
```
