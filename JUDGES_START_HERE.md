# For Judges

Quick setup guide to evaluate this submission.

## What You're Looking At

LogoMesh is an **agent evaluation arena**:
- **Green Agent** (our submission) = Judges other agents' code
- **Purple Agent** = Gets judged (competitors build these)
- **Red Agent** = Attacks Purple's code to find vulnerabilities

The Green Agent calculates a **Contextual Integrity Score (CIS)** based on code quality, test coverage, and security.

---

## Run It (5 minutes)

### Prerequisites
- Docker running
- Python 3.11+

### Steps

```bash
# 1. Clone and enter
git clone https://github.com/sszz01/LogoMesh.git
cd LogoMesh

# 2. Setup
cp .env.example .env
pip install uv && uv sync

# 3. Launch everything
sudo ./scripts/bash/launch_arena.sh
```

Wait 2-3 minutes for models to load.

### Test It

```bash
# Run a test evaluation
sudo ./scripts/bash/test_agents.sh
```

Or manually:
```bash
curl -X POST http://localhost:9000/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{"battle_id": "test-001", "purple_agent_url": "http://localhost:9001"}'
```

---

## What to Look For

1. **Green Agent logs** - Shows scoring in real-time
   ```bash
   sudo docker logs -f green-agent
   ```

2. **Score output** - CIS score between 0-1
3. **DBOM artifacts** - Cryptographic proof in `data/dboms/`

---

## Key Files

| File | What it does |
|------|--------------|
| `src/green_logic/server.py` | Green Agent main logic |
| `src/green_logic/scoring.py` | CIS scoring algorithm |
| `scenarios/security_arena/agents/generic_defender.py` | Purple Agent |

---

## The Innovation

**Contextual Integrity Score (CIS)** measures:
- How well code matches requirements
- Test coverage quality
- Security (Red Agent finds vulnerabilities)
- Logic correctness (LLM review)

Formula: `CIS = 0.25*R + 0.25*A + 0.25*T + 0.25*L`

See `docs/03-Research/Theory/` for the research paper.
