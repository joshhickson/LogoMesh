# LogoMesh Green Agent

A green (assessor) agent for the AgentX-AgentBeats Competition that evaluates coding agents for **Contextual Debt** - a measure of code quality that goes beyond correctness to assess the reasoning, architecture, and testing practices of AI coding agents.

## Overview

This green agent implements the "Agentified Agent Assessment" (AAA) paradigm for Phase 1 of the competition. It:

1. **Hosts a coding benchmark** - Sends coding challenges to purple (assessee) agents
2. **Evaluates solutions** - Uses LLM-as-a-judge to assess code quality
3. **Reports scores** - Returns contextual debt scores via A2A protocol

## Architecture

```
AgentBeats Platform
       │
       ▼ A2A Protocol
┌──────────────────┐
│   Green Agent    │  ← You are here
│   (Assessor)     │
│   :8001          │
└────────┬─────────┘
         │ A2A Protocol
         ▼
┌──────────────────┐
│  Purple Agent    │
│  (Assessee)      │
│  (any port)      │
└──────────────────┘
```

## Files

| File | Purpose |
|:-----|:--------|
| `agent_card.toml` | Agent identity, system prompt, evaluation criteria |
| `tools.py` | Tools: `send_coding_task()`, `report_result()` |
| `run.sh` | Quick start script |
| `venv/` | Python virtual environment |

## Quick Start

```bash
cd green-agent

# 1. Create virtual environment (first time only)
python3 -m venv venv
source venv/bin/activate
pip install git+https://github.com/agentbeats/agentbeats.git httpx

# 2. Set your API key
export OPENAI_API_KEY="sk-..."

# 3. Run the agent
./run.sh
```

Your agent will be available at `http://localhost:8001/`

## How It Works

### Battle Flow

```
1. Battle Start
   └─> Agent receives: battle_id + purple_agent_url

2. Task Assignment
   └─> Calls send_coding_task(purple_agent_url, battle_id)
   └─> Sends random coding challenge (email validator, rate limiter, LRU cache)

3. Solution Collection
   └─> Purple agent returns: { sourceCode, testCode, rationale }

4. Evaluation (LLM-as-a-Judge)
   └─> Evaluates solution against 3 dimensions
   └─> Calculates contextual debt score (0.0-1.0)

5. Reporting
   └─> Calls report_result(battle_id, score, breakdown)
   └─> Returns score to AgentBeats platform
```

### Contextual Debt Scoring

The agent evaluates 3 dimensions, each worth 33% of the final score:

| Dimension | What It Measures | Scoring Criteria |
|:----------|:-----------------|:-----------------|
| **Rationale Debt** | Quality of reasoning | Design decisions explained? Edge cases considered? Logical approach? |
| **Architectural Debt** | Code structure | Well-organized? Separation of concerns? Best practices? Error handling? |
| **Testing Debt** | Test coverage | Tests provided? Main functionality covered? Edge cases tested? |

**Final Score** = (Rationale + Architectural + Testing) / 3

### Scoring Scale

| Score | Meaning |
|:------|:--------|
| 0.9-1.0 | Excellent - Production-ready code with comprehensive reasoning |
| 0.7-0.9 | Good - Solid implementation with minor improvements needed |
| 0.5-0.7 | Fair - Functional but missing key elements |
| 0.3-0.5 | Poor - Major issues in reasoning, structure, or testing |
| 0.0-0.3 | Failing - Incomplete, broken, or no response |

## Coding Tasks

The agent randomly selects from these challenges:

1. **Email Validator** - Input validation, regex patterns, error messages
2. **Rate Limiter** - Time-based logic, client tracking, memory management
3. **LRU Cache** - Data structures, O(1) operations, eviction policy

Each task requires:
- `sourceCode`: Working implementation
- `testCode`: Unit tests (optional but scored)
- `rationale`: Explanation of design decisions

## Testing

### Send a Test Request

```bash
curl -X POST http://localhost:8001/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "message/send",
    "params": {
      "message": {
        "messageId": "test-001",
        "role": "user",
        "parts": [{"type": "text", "text": "Start evaluation. battle_id: test-001, purple_agent_url: http://localhost:9050/"}]
      }
    },
    "id": "req-001"
  }'
```

### Check Agent Card

```bash
curl http://localhost:8001/.well-known/agent.json | python3 -m json.tool
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|:---------|:--------|:------------|
| `OPENAI_API_KEY` | (required) | Your OpenAI API key |
| `MODEL_TYPE` | `openai` | Model provider (`openai`, `openrouter`) |
| `MODEL_NAME` | `gpt-4o-mini` | Model to use for evaluation |
| `AGENT_PORT` | `9040` | Port for the agent server |

### Using Different Models

```bash
# GPT-4o (more accurate, slower)
MODEL_NAME=gpt-4o ./run.sh

# GPT-4o-mini (faster, cheaper)
MODEL_NAME=gpt-4o-mini ./run.sh

# OpenRouter (various models)
export OPENROUTER_API_KEY="..."
MODEL_TYPE=openrouter MODEL_NAME=anthropic/claude-3.5-sonnet ./run.sh
```

## Evaluation Philosophy

Based on the AgentBeats competition guidelines, this green agent follows these principles:

### What Makes Good Evaluation

1. **Outcome Validity** - Scores reflect actual code quality, not superficial metrics
2. **Consistency** - Same solution gets same score across runs
3. **Practical Relevance** - Evaluates skills needed in real-world coding
4. **Resistance to Gaming** - Can't be fooled by verbose but empty rationales

### Avoiding Common Pitfalls

- ❌ Biased toward specific coding styles
- ❌ Rewarding verbose but shallow explanations
- ❌ Ignoring edge cases
- ❌ Too easy (all agents score high)

### Achieved Through

- ✅ Structured rubric with specific criteria
- ✅ LLM-as-a-judge for nuanced evaluation
- ✅ Multiple dimensions to prevent gaming
- ✅ Challenging but fair coding tasks

## Competition Context

This agent is designed for **Phase 1 (Green)** of the AgentX-AgentBeats Competition:

- **Track**: Coding Agent Evaluation
- **Assessment Type**: Contextual Debt (code quality beyond correctness)
- **Protocol**: A2A (Agent-to-Agent)
- **SDK**: AgentBeats (`pip install git+https://github.com/agentbeats/agentbeats.git`)

## Related Documentation

- [AgentBeats Competition Summary](../docs/05-Competition/AgentBeats-Competition-Summary.md)
- [Green Agent Detailed Guide](../docs/05-Competition/Green-Agent-Detailed-Guide.md)
- [How to Use AgentBeats](../how_to_use_agentbeats.md)

## License

MIT
