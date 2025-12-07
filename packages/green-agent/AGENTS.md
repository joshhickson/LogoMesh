# Green Agent - AI Agent Instructions

## Task Context

This package implements a **green agent** for the AgentBeats competition platform. Green agents are orchestrators/judges - they evaluate other agents (purple/red/blue) rather than competing directly.

## Before Making Changes

1. Read `agent_card.toml` - contains the system prompt that defines agent behavior
2. Read `scenario.toml` - defines `is_green=true` and `participant_requirements`
3. Check `tools.py` - all @ab.tool decorated functions

## Documentation Requirements

Per project rules, update these if your changes affect:
- Architecture → Update `docs/05-Competition/Green-Agent-Status.md`
- Task completion → Check boxes in `docs/05-Competition/Green-Agent-Implementation-Plan.md`
- Breaking changes → Update `docs/00_CURRENT_TRUTH_SOURCE.md`

## Code Patterns

### Adding a new tool
```python
@ab.tool
async def my_tool(param: str) -> str:
    """Docstring becomes tool description in AgentBeats."""
    return "result"
```

### Calling LogoMesh server
```python
async with httpx.AsyncClient() as client:
    response = await client.post(
        f"{LOGOMESH_SERVER_URL}/v1/endpoint",
        json=payload
    )
```

### Logging to AgentBeats
```python
await update_battle_process(battle_id, "message", "green_agent", {"detail": "value"})
```

## Do NOT

- Remove `is_green = true` from scenario.toml
- Expose passwords/secrets to purple agents in tool implementations
- Skip logging battle progress (AgentBeats expects updates)
- Hardcode URLs (use environment variables)

## Remaining Tasks

| Task | File to Modify |
|:-----|:---------------|
| Add `/v1/internal/analyze` | `../server/src/routes/evaluation.routes.ts` |
| Create task bank | `tasks/task_bank.json` |
| Fix Dockerfile | `Dockerfile` |
| Add health endpoint | `src/logomesh_green/main.py` |

## Quick Validation

```bash
# Check tools register correctly
python -c "from logomesh_green import tools; print('OK')"

# Verify agent card loads
python -c "import tomllib; print(tomllib.load(open('agent_card.toml','rb'))['name'])"
```
