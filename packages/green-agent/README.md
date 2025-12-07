# LogoMesh Green Agent

The LogoMesh Green Agent is an AgentBeats-compatible orchestrator that evaluates coding agents ("purple agents") for **Contextual Debt** - a measure of code quality across three dimensions.

## Overview

This green agent:
1. Sends coding tasks to purple agents via A2A protocol
2. Collects their solutions (code, tests, rationale)
3. Analyzes solutions using the LogoMesh server (HTTP bridge)
4. Reports contextual debt scores back to AgentBeats

## Installation

### Development (with vendor agentbeats)

```bash
cd packages/green-agent
pip install -e .
```

### Production

```bash
pip install logomesh-green-agent
```

## Configuration

### Environment Variables

```bash
export OPENAI_API_KEY="your-key"
export LOGOMESH_SERVER_URL="http://localhost:3000"  # or Docker: http://logomesh-server:3000
```

### Files

- `agent_card.toml` - Green agent metadata and system prompt
- `scenario.toml` - Scenario configuration for AgentBeats

## Running

### Local Development

```bash
# Start LogoMesh server first
cd ../.. && pnpm server start

# Start green agent
cd packages/green-agent
python -m logomesh_green.main
```

### With AgentBeats CLI

```bash
agentbeats launch scenario.toml
```

### Docker

```bash
docker build -t logomesh-green-agent .
docker run -e OPENAI_API_KEY=$OPENAI_API_KEY -e LOGOMESH_SERVER_URL=http://host.docker.internal:3000 logomesh-green-agent
```

## Tools

The green agent provides these tools:

| Tool | Description |
|:-----|:------------|
| `get_coding_task()` | Fetch a coding task from the task bank |
| `send_coding_task(url, task, battle_id)` | Send task to purple agent via A2A |
| `evaluate_solution(code, tests, rationale, battle_id)` | Analyze solution via LogoMesh server |
| `update_battle_process(battle_id, message, reporter, detail)` | Log progress to MCP |
| `report_on_battle_end(battle_id, winner, detail)` | Report final result |
| `orchestrate_evaluation(battle_id, purple_url)` | Full evaluation flow |

## Contextual Debt Scoring

The final score (0.0-1.0, higher is better) is the average of:

1. **Rationale Debt** - Does the reasoning show good context awareness?
2. **Architectural Debt** - Is the code well-structured?
3. **Testing Debt** - Are tests provided and passing?

## Architecture

```
AgentBeats Backend
       ↓ A2A
Green Agent (Python)
       ↓ HTTP
LogoMesh Server (TypeScript)
       ↓
  3 Analyzers (BullMQ workers)
```

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Type checking
mypy src/
```
