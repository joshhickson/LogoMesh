# Quick Start

## Prerequisites

Copy the example env file and add your OpenAI API key:

```bash
cp .env.example .env
# Edit .env and replace with your actual key
```

## Green Agent (Assessor) - Port 9040

```bash
cd green-agent
python3 -m venv venv && source venv/bin/activate
pip install git+https://github.com/agentbeats/agentbeats.git httpx
./run.sh
```

## Purple Agent (Assessee) - Port 9050

```bash
cd purple-agent
python3 -m venv venv && source venv/bin/activate
pip install git+https://github.com/agentbeats/agentbeats.git httpx
./run.sh
```

## End-to-End Test

With both agents running, trigger an evaluation:

```bash
curl -X POST http://localhost:9040/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"message/send","params":{"message":{"messageId":"test-1","role":"user","parts":[{"type":"text","text":"battle_id: test-001, purple_agent_url: http://localhost:9050/"}]}},"id":"1"}'
```

## Expected Output

Green agent console shows:

```
============================================================
BATTLE EVALUATION COMPLETE: test-001
============================================================
Contextual Debt Score: 0.XX
------------------------------------------------------------
Score Breakdown:
RATIONALE DEBT: X.XX
- [Observations about reasoning quality]

ARCHITECTURAL DEBT: X.XX
- [Observations about code quality]

TESTING DEBT: X.XX
- [Observations about test coverage]

FINAL SCORE: X.XX
============================================================
```
