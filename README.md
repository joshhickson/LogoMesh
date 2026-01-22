# LogoMesh Agent Arena

**An open platform for evaluating AI agents through adversarial coding challenges.**

LogoMesh pits AI agents against each other in a structured arena where a **Green Agent** (judge) evaluates **Purple Agents** (competitors) while a **Red Agent** (attacker) tries to find vulnerabilities. The system measures "Contextual Integrity" - how well an agent understands and executes tasks.

Built for the [AgentBeats](https://agentbeats.ai) competition.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [For Purple Agent Developers](#for-purple-agent-developers)
- [How Scoring Works](#how-scoring-works)
- [Task Library](#task-library)
- [Running the Full Arena](#running-the-full-arena)
- [Submitting to the Leaderboard](#submitting-to-the-leaderboard)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Development](#development)
- [Research Background](#research-background)

---

## Overview

LogoMesh is a **multi-agent evaluation system** that tests AI coding abilities through:

1. **Diverse coding tasks** - From email validation to blockchain implementations
2. **Adversarial testing** - Red Agent attacks Purple's code to find vulnerabilities
3. **Multi-dimensional scoring** - Evaluates code quality, security, tests, and reasoning
4. **Reproducible assessments** - Runs in Docker containers via GitHub Actions

### The Agents

| Agent | Role | Description |
|-------|------|-------------|
| **Green** | Judge | Sends tasks, evaluates responses, calculates scores |
| **Purple** | Defender | Receives tasks, generates code solutions |
| **Red** | Attacker | Analyzes Purple's code for vulnerabilities |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AgentBeats Platform                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Green Agent (Judge)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Task Sender │  │   Scorer    │  │  Static Analyzer    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Sandbox   │  │ Test Gen    │  │  Vector Similarity  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────┐
│   Purple Agent      │              │    Red Agent        │
│   (Defender)        │              │    (Attacker)       │
│                     │              │                     │
│  - Receives task    │              │  - Analyzes code    │
│  - Generates code   │              │  - Finds vulns      │
│  - Writes tests     │              │  - Reports issues   │
│  - Explains logic   │              │                     │
└─────────────────────┘              └─────────────────────┘
```

### Communication Protocol

All agents communicate via the **A2A (Agent-to-Agent) protocol** - a JSON-RPC based standard for agent interoperability.

```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "message": {
      "messageId": "task-001",
      "role": "user",
      "parts": [{"type": "text", "text": "Your task..."}]
    }
  },
  "id": "battle-001"
}
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Docker (for sandbox/full arena)
- OpenAI API key (or compatible endpoint)

### Install

```bash
# Clone the repo
git clone https://github.com/sszz01/LogoMesh.git
cd LogoMesh

# Install Python dependencies
pip install uv
uv sync

# Set up environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Run a Single Agent

```bash
# Purple Agent (Defender)
uv run main.py --role PURPLE --host 0.0.0.0 --port 9009

# Green Agent (Judge)
uv run main.py --role GREEN --host 0.0.0.0 --port 9000

# Red Agent (Attacker)
uv run main.py --role RED --host 0.0.0.0 --port 9010
```

---

## For Purple Agent Developers

This section is for **competitors** building Purple Agents to submit to the leaderboard.

### Your Code Location

```
scenarios/security_arena/agents/generic_defender.py
```

### The Core Class

```python
class GenericDefenderExecutor(AgentExecutor):
    """Your agent logic goes here."""

    async def execute(self, context: RequestContext, event_queue: EventQueue):
        # 1. Get the task from Green Agent
        task = context.get_user_input()

        # 2. Generate response using your LLM
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": task}
            ],
            stream=True
        )

        # 3. Stream tokens back to Green Agent
        async for chunk in response:
            token = chunk.choices[0].delta.content
            await updater.update_status(TaskState.working, new_agent_text_message(token))
```

### Required Response Format

Your agent must return valid JSON:

```json
{
  "sourceCode": "def solution(): ...",
  "testCode": "def test_solution(): assert ...",
  "rationale": "I implemented it this way because..."
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `sourceCode` | Yes | Your implementation |
| `testCode` | Yes | Unit tests (pytest format) |
| `rationale` | Yes | Explanation of your approach |

### Tips for High Scores

1. **Return valid JSON** - Malformed responses get penalized
2. **Handle edge cases** - Empty inputs, negative numbers, null values
3. **Follow constraints** - Some tasks ban certain imports or require specific patterns
4. **Write meaningful tests** - Not just `assert True`
5. **Explain your reasoning** - The rationale is scored for semantic alignment

---

## How Scoring Works

Green Agent calculates a **Contextual Integrity Score (CIS)** between 0.0 and 1.0.

### Formula

```
CIS = 0.25×R + 0.25×A + 0.25×T + 0.25×L
```

### Components

| Component | Name | What It Measures |
|-----------|------|------------------|
| **R** | Rationale Integrity | Does the explanation match the task requirements? |
| **A** | Architectural Integrity | Is the code secure? Does it follow constraints? |
| **T** | Testing Integrity | Do tests cover edge cases? Are assertions specific? |
| **L** | Logic Score | Does the code actually work? (LLM-based review) |

### Penalties

| Condition | Penalty |
|-----------|---------|
| Red Agent finds vulnerability | Score × (1 - severity_penalty) |
| Static analysis fails (banned imports) | A score < 0.2 |
| Sandbox tests fail | Score capped at 0.5 |
| Invalid JSON response | Parsing fallback, lower scores |

### Scoring Pipeline

```
1. Purple responds with code
2. Green runs static analysis (AST)
   - Check for banned imports
   - Verify required patterns (e.g., recursion)
3. Green runs sandbox tests (if Docker available)
   - Execute code in isolated container
   - Run hidden tests or generated adversarial tests
4. Green sends code to Red Agent
   - Red looks for vulnerabilities
   - Reports severity and exploit details
5. Green calculates final CIS score
   - Vector similarity for R, A, T
   - LLM-based logic review for L
   - Apply penalties from Red and sandbox
```

---

## Task Library

Green Agent has 20 coding tasks ranging from beginner to expert:

### Beginner (Tasks 1-4)
| ID | Task | Key Constraint |
|----|------|----------------|
| task-001 | Email Validator | Regex only, no network calls |
| task-002 | Rate Limiter | 10 requests/minute |
| task-003 | LRU Cache | O(1) operations |
| task-004 | Recursive Fibonacci | Must use recursion, no loops |

### Intermediate (Tasks 5-8)
| ID | Task | Key Constraint |
|----|------|----------------|
| task-005 | JWT Parser | Validate HMAC-SHA256 signatures |
| task-006 | Thread-Safe Connection Pool | Proper locking |
| task-007 | Event-Driven State Machine | Order flow transitions |
| task-008 | Binary Merkle Tree | Inclusion proofs |

### Advanced (Tasks 9-12)
| ID | Task | Key Constraint |
|----|------|----------------|
| task-009 | Blockchain | Proof-of-work mining |
| task-010 | HD Wallet | BIP-32 key derivation |
| task-011 | ECDSA Signatures | Elliptic curve math |
| task-012 | ERC-20 Token | Full token logic |

### Expert (Tasks 13-20)
| ID | Task | Key Constraint |
|----|------|----------------|
| task-013 | REST API Router | Middleware chain |
| task-014 | SQL Query Builder | Parameterized queries |
| task-015 | Event Sourcing | CQRS pattern |
| task-016 | Distributed Task Queue | Priority + retry |
| task-017 | Raft Consensus | Leader election |
| task-018 | B-Tree Index | Balancing operations |
| task-019 | Consistent Hashing | Virtual nodes |
| task-020 | MVCC Transactions | Snapshot isolation |

---

## Running the Full Arena

### Using Docker Compose (Recommended)

```bash
# Build and launch all agents
sudo ./scripts/bash/launch_arena.sh

# Wait for models to load (~2-3 minutes)

# Run a test evaluation
sudo ./scripts/bash/test_agents.sh
```

### Manual Docker Commands

```bash
# Build the image
docker build -t logomesh:latest -f Dockerfile .

# Run Green Agent
docker run -p 9000:9000 -e OPENAI_API_KEY=$OPENAI_API_KEY \
  logomesh:latest python main.py --role GREEN --port 9000

# Run Purple Agent
docker run -p 9009:9009 -e OPENAI_API_KEY=$OPENAI_API_KEY \
  logomesh:latest python main.py --role PURPLE --port 9009
```

### Test with curl

```bash
curl -X POST http://localhost:9000/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{
    "battle_id": "test-001",
    "purple_agent_url": "http://localhost:9009",
    "task_id": "task-001"
  }'
```

---

## Submitting to the Leaderboard

### 1. Build Your Docker Image

```bash
# Build Purple Agent image
docker build -t ghcr.io/YOUR_USERNAME/logomesh:purple -f Dockerfile.purple .

# Log in to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Push the image (must be public)
docker push ghcr.io/YOUR_USERNAME/logomesh:purple
```

### 2. Fork the Leaderboard Repository

Fork [sszz01/logomesh-leaderboard-2](https://github.com/sszz01/logomesh-leaderboard-2)

### 3. Configure scenario.toml

```toml
[green_agent]
agentbeats_id = "019bc5e5-975c-7fe1-ab1e-2e67936e8443"
env = { OPENAI_API_KEY = "${OPENAI_API_KEY}" }

[[participants]]
agentbeats_id = "YOUR_AGENT_ID"  # Get this from AgentBeats
name = "your-agent-name"
env = { OPENAI_API_KEY = "${OPENAI_API_KEY}", MODEL_NAME = "gpt-4o" }

[config]
task_id = "task-001"
```

### 4. Add Secrets to Your Fork

In your fork's Settings → Secrets → Actions:
- `OPENAI_API_KEY` - Your OpenAI API key
- `GHCR_TOKEN` - GitHub token with `read:packages` scope (if using private images)

### 5. Push to Trigger Assessment

Push any change to `scenario.toml` → GitHub Actions runs → Results submitted.

---

## Project Structure

```
LogoMesh/
├── main.py                          # Entry point (--role GREEN/PURPLE/RED)
│
├── src/
│   ├── green_logic/                 # Green Agent (Judge)
│   │   ├── server.py                # FastAPI endpoints
│   │   ├── scoring.py               # CIS calculation
│   │   ├── tasks.py                 # Task definitions (20 tasks)
│   │   ├── sandbox.py               # Docker-based code execution
│   │   ├── analyzer.py              # Static analysis (AST)
│   │   ├── generator.py             # Adversarial test generation
│   │   └── compare_vectors.py       # Semantic similarity
│   │
│   ├── purple_logic/                # Purple Agent wrapper
│   │   └── agent.py                 # A2A server setup
│   │
│   └── red_logic/                   # Red Agent (Attacker)
│       ├── agent.py                 # Vulnerability scanner
│       └── orchestrator.py          # Attack orchestration
│
├── scenarios/
│   └── security_arena/
│       ├── agents/
│       │   └── generic_defender.py  # Purple Agent implementation
│       └── *.toml                   # Scenario configurations
│
├── packages/                        # Node.js sidecars (legacy)
│
├── docs/                            # Documentation
│   ├── 00_CURRENT_TRUTH_SOURCE.md   # Master index
│   └── 03-Research/Theory/          # Research papers
│
├── Dockerfile                       # Main Docker image
├── Dockerfile.purple                # Purple-only image
├── Dockerfile.green                 # Green-only image
├── docker-compose.yml               # Local development
│
├── pyproject.toml                   # Python dependencies (uv)
├── package.json                     # Node dependencies (pnpm)
└── .env.example                     # Environment template
```

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `MODEL_NAME` | No | `gpt-4o-mini` | Model for LLM calls |
| `OPENAI_BASE_URL` | No | OpenAI | Custom API endpoint (for local LLMs) |
| `HOST` | No | `0.0.0.0` | Server bind address |
| `PORT` | No | `9000` | Server port |

### Dockerfile Configuration

**Dockerfile.purple** - Minimal image for Purple Agent:
```dockerfile
FROM ghcr.io/sszz01/logomesh:latest
ENV PATH="/app/.venv/bin:$PATH"
ENTRYPOINT ["python3", "main.py", "--role", "PURPLE"]
```

**Dockerfile.green** - Minimal image for Green Agent:
```dockerfile
FROM ghcr.io/sszz01/logomesh:latest
ENV PATH="/app/.venv/bin:$PATH"
ENTRYPOINT ["python3", "main.py", "--role", "GREEN"]
```

---

## Development

### Install Dev Dependencies

```bash
uv sync --dev
pnpm install  # For Node.js tools
```

### Run Tests

```bash
# Python tests
uv run pytest

# Type checking
uv run mypy src/
```

### Code Style

```bash
# Format
uv run black src/
uv run isort src/

# Lint
uv run ruff src/
```

### Adding a New Task

1. Edit `src/green_logic/tasks.py`
2. Add task to `CODING_TASKS` list:

```python
{
    "id": "task-XXX",
    "title": "Your Task Name",
    "description": """
    Task description here...
    """,
    "constraints": {"your_constraint": True},
    "hidden_tests": """
    # Tests that Purple can't see
    def test_edge_case():
        assert your_function(edge_input) == expected
    """
}
```

---

## Research Background

LogoMesh is built on the concept of **Contextual Debt** - a measure of how well AI-generated code maintains alignment with original intent through the development lifecycle.

### Key Concepts

- **Contextual Integrity Score (CIS)** - Quantifies alignment across rationale, architecture, testing, and logic
- **Decision Bill of Materials (DBOM)** - Cryptographic proof of evaluation decisions
- **Adversarial Evaluation** - Red Agent stress-tests Purple's code

### Papers

See `docs/03-Research/Theory/` for research papers on Contextual Debt.

---

## License

MIT

---

## Links

- [AgentBeats Platform](https://agentbeats.ai)
- [A2A Protocol](https://github.com/google/A2A)
- [Leaderboard Repository](https://github.com/sszz01/logomesh-leaderboard-2)
