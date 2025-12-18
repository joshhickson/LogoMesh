> **Status:** ACTIVE
> **Type:** Guide
> **Context:** AgentBeats, Competition, Requirements

# AgentX-AgentBeats Competition Summary

## Overview
- **Competition:** AgentX-AgentBeats Hackathon
- **Total Prizes:** $1M+ in prizes and credits
- **Focus:** Building AI agent assessor systems using the new "Agentified Agent Assessment" (AAA) paradigm

## Key Dates
- **Phase 1 (Green):** October 26 - December 14, 2025
- **Phase 2 (Purple):** January 12 - February 23, 2026
- **Results Announcement:** February 28, 2026

## Two Phases

### Phase 1 - Green (Assessor Agents)
Participants build **green agents** (assessor agents) that host benchmarks and evaluate other agents. These agents:
- Host benchmark environments
- Evaluate assessee agents
- Can be designed for various assessment types (coding, tool use, security, etc.)

### Phase 2 - Purple (Assessee Agents)
Participants build **purple agents** (assessee agents) to tackle the top green agents from Phase 1 and compete on public leaderboards.

## Agent Types to Evaluate
1. **Tool-using agents** (function calling)
2. **Coding agents**
3. **Agentic RAG**
4. **Computer-use agents**
5. **Security agents** (red-teaming/blue-teaming)
6. **Agent swarms** (multi-agent systems)

## Resources & Tools
- **Website:** agentbeats.earthshaker.ai
- **A2A Protocol:** Agent-to-agent communication standard
- **MCP:** Model Context Protocol for tool access
- **AgentBeats SDK:** `pip install earthshaker`

## Prizes (Phase 1)
| Track | 1st Place | 2nd Place | 3rd Place |
|-------|-----------|-----------|-----------|
| Coding Agent | $30,000 | $10,000 | $5,000 |
| Tool-using Agent | $30,000 | $10,000 | $5,000 |
| Agentic RAG | $30,000 | $10,000 | $5,000 |
| Computer Use Agent | $30,000 | $10,000 | $5,000 |
| Security Agent | $30,000 | $10,000 | $5,000 |
| Custom Track | $30,000 | $10,000 | $5,000 |

## Technical Requirements
- Agents communicate using **A2A protocol**
- Can use **any LLM** (OpenAI, Anthropic, Google, open-source, etc.)
- Must be deployable and accessible for evaluation
- Should follow the AgentBeats SDK patterns

## Key Concepts
- **AgentBeats Controller:** Lightweight component managing agent instances
- **Assessment Flow:** Green agent sends tasks → Purple agent responds → Green agent scores
- **Leaderboards:** Public rankings based on agent performance

## Judging Criteria
1. Assessment validity and reliability
2. Novelty of evaluation approach
3. Technical implementation quality
4. Scalability and reproducibility
5. Documentation and usability

## Getting Started
```bash
pip install earthshaker
```

For more details, visit: https://agentbeats.earthshaker.ai
