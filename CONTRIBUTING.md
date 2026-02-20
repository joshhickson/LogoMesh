# Contributing to LogoMesh

Thanks for your interest in contributing. This doc covers how to get set up, submit changes, and what we expect from PRs.

## Getting Started

```bash
git clone https://github.com/joshhickson/LogoMesh.git
cd LogoMesh
pip install uv && uv sync
cp .env.example .env
# add your OPENAI_API_KEY to .env
```

Build the sandbox image (required for test execution):
```bash
docker build -f Dockerfile.sandbox -t logomesh-sandbox:latest .
```

Run the agents:
```bash
# Terminal 1
uv run main.py --role PURPLE --host 0.0.0.0 --port 9010

# Terminal 2
uv run main.py --role GREEN --host 0.0.0.0 --port 9009
```

Verify everything works:
```bash
curl -X POST http://localhost:9009/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{"task_id": "task-004"}'
```

You should get back a JSON response with a `cis_score`.

## How to Contribute

### Phase 2 Tryout

If you're here from the recruitment post: look for issues tagged [`phase-2-tryout`](https://github.com/joshhickson/LogoMesh/labels/phase-2-tryout). Pick one, fork the repo, implement it, and open a PR. That's the application process.

### Regular Contributions

1. Check [open issues](https://github.com/joshhickson/LogoMesh/issues). Issues tagged `good-first-issue` are scoped and approachable.
2. Fork the repo and create a branch off `master`.
3. Make your changes.
4. Open a PR with a clear description of what you changed and why.

## PR Expectations

- **One thing per PR.** Don't bundle unrelated changes.
- **Read existing code before writing new code.** Follow the patterns already in the codebase. If `server.py` uses `snake_case`, your code uses `snake_case`.
- **Test your changes.** If you're changing scoring logic, run an evaluation and show the output. If you're fixing a bug, explain how to reproduce it.
- **Don't break the API.** If `VectorScorer()` and `compare_texts()` work a certain way, they should still work that way after your change.
- **Keep it simple.** Don't add abstractions, config options, or features beyond what the issue asks for.

## What We Don't Want

- PRs that refactor code without fixing anything
- AI-generated code that hasn't been tested or understood
- Documentation-only PRs (unless fixing something genuinely broken)
- Changes to scoring weights or penalty values without discussion first

## Code Style

- Python. No type stubs or mypy strictness enforced yet, but don't make it worse.
- Use `async/await` for anything that touches the network or LLM APIs.
- Environment variables for configuration, not hardcoded values.
- `snake_case` for functions and variables, `PascalCase` for classes.

## Project Structure (Short Version)

```
src/green_logic/    # The benchmark (judge). This is the core product.
src/red_logic/      # Adversarial attacker (MCTS engine).
src/purple_logic/   # AI under test (baseline code generator).
src/memory.py       # Cross-run learning (SQLite).
src/strategy_evolver.py  # UCB1 bandit for strategy selection.
src/task_intelligence.py # Dynamic task understanding.
```

For a full walkthrough, see [docs/02-Engineering/Developer-Guide.md](docs/02-Engineering/Developer-Guide.md).

## Scoring Formula (Don't Break This)

```
CIS = (0.25*R + 0.25*A + 0.25*T + 0.25*L) * red_penalty * intent_penalty
```

The following are intentional design decisions, not bugs:
- LLM can only adjust scores +/-0.10 from ground truth anchors
- All judge LLM calls use seed=42, temperature=0
- Each signal penalizes exactly once (no double-counting)
- Red Agent penalties are multiplicative on full CIS

If you think these should change, open an issue to discuss first.

## Questions?

Open an issue or message in the Discord.
