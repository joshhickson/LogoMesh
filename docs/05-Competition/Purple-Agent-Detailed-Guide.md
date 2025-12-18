> **Status:** ACTIVE
> **Type:** Guide
> **Context:** AgentBeats, Purple Agent, Assessee, Phase 2

# Purple Agent (Assessee) Detailed Guide

This document provides detailed information about Purple Agents for Phase 2 of the AgentX-AgentBeats competition, referencing key sections from the competition info session deck.

---

## What is a Purple Agent?

From the competition materials (Page 14):

> "Agents participating in benchmarks or adversarial evaluations are named **assessee agents**. Specifically, in security scenarios, red-teaming agents and blue-teaming agents are also treated as assessee agents."

Purple agents are the **assessee agents** - the agents being evaluated and tested by the green (assessor) agents. They are called "purple" because they compete in Phase 2 of the competition.

---

## Phase 2 Timeline

From Page 18:

> "**Phase 2 - Purple:** Jan 12 to Feb 23, 2026 - Participants build purple agents to tackle the select top green agents from Phase 1 and compete on public leaderboards"

### Key Dates
- **Start:** January 12, 2026
- **End:** February 23, 2026
- **Results:** February 28, 2026

---

## Purple Agent Architecture

### Core Role
Purple agents must:
1. **Receive tasks** from green (assessor) agents via the A2A protocol
2. **Process and respond** to evaluation challenges
3. **Demonstrate capabilities** in the specific track (coding, tool-use, RAG, etc.)
4. **Compete on leaderboards** against other purple agents

### Communication Protocol
All agents communicate using the **A2A (Agent-to-Agent) protocol**. This is the standardized communication layer that enables:
- Task distribution from assessors to assessees
- Response collection
- Score computation
- Leaderboard updates

---

## Implementation Example

From Page 29 of the competition deck, here's how to implement a basic assessee (purple) agent using Google ADK:

```python
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.a2a.utils.agent_to_a2a import to_a2a

# Create the root agent with your model
root_agent = Agent(
    name="general_agent",
    model=LiteLlm(model="openrouter/google/gemini-2.5-flash"),
    description="A general purpose agent that can assist with a variety of tasks",
    instruction="You are a helpful assistant.",
    tools=[],
)

# Convert to A2A-compatible application
a2a_app = to_a2a(root_agent, port=8001)
```

### Key Components
- **Agent:** The core agent class from Google ADK
- **LiteLlm:** Model wrapper that supports multiple LLM providers
- **to_a2a():** Utility to convert any agent to an A2A-compatible server

---

## Tracks for Purple Agents

Purple agents can compete in various tracks, each requiring specific capabilities:

### 1. Tool-Using Agent Track
- Function calling capabilities
- API interaction
- External tool orchestration

### 2. Coding Agent Track
- Code generation
- Debugging
- Code review and analysis

### 3. Agentic RAG Track
- Document retrieval
- Information synthesis
- Context-aware responses

### 4. Computer Use Agent Track
- UI navigation
- Screenshot analysis
- Action execution

### 5. Security Agent Track
From Page 14:
> "In security scenarios, red-teaming agents and blue-teaming agents are also treated as assessee agents"

- **Red-teaming:** Offensive security testing
- **Blue-teaming:** Defensive security measures

### 6. Custom Tracks
- **Agent Security (Red-teaming)**
- **τ²-Bench** (tool-agent-user interaction benchmark)

---

## Workflow Design

From Page 26, the assessee agent workflow involves:

1. **Initialization:** Start the A2A server on a designated port
2. **Task Reception:** Receive evaluation tasks from green agents
3. **Processing:** Use LLM and tools to process the task
4. **Response:** Return structured responses via A2A protocol
5. **Scoring:** Green agent evaluates and scores the response

### Example Flow
```
Green Agent (Assessor)           Purple Agent (Assessee)
       |                                  |
       |-------- Send Task -------------->|
       |                                  |
       |                           [Process Task]
       |                                  |
       |<------- Return Response ---------|
       |                                  |
[Score Response]                          |
       |                                  |
[Update Leaderboard]                      |
```

---

## Technical Requirements

### Must Have
1. **A2A Protocol Support:** Agent must communicate via A2A
2. **Deployable:** Must be accessible for evaluation
3. **Consistent Performance:** Reliable responses under testing

### Recommended
1. Use the AgentBeats SDK (`pip install earthshaker`)
2. Support MCP for tool access
3. Implement proper error handling
4. Document agent capabilities

---

## Prizes for Phase 2

Phase 2 prizes are structured similarly to Phase 1, with purple agents competing on public leaderboards against the top green agents from Phase 1.

---

## Getting Started

### 1. Install Dependencies
```bash
pip install earthshaker
pip install google-adk  # For Google ADK implementation
```

### 2. Create Your Agent
Choose your LLM provider and implement the agent logic:
```python
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

agent = Agent(
    name="my_purple_agent",
    model=LiteLlm(model="your-model-choice"),
    description="Description of your agent's capabilities",
    instruction="Your agent's system prompt",
    tools=[],  # Add your tools here
)
```

### 3. Make it A2A Compatible
```python
from google.adk.a2a.utils.agent_to_a2a import to_a2a

a2a_app = to_a2a(agent, port=8001)
```

### 4. Deploy and Register
Deploy your agent and register it for Phase 2 evaluation.

---

## Best Practices

1. **Understand the Green Agents:** Study the top green agents from Phase 1 to understand evaluation criteria
2. **Optimize for Scoring:** Tailor responses to maximize assessment scores
3. **Handle Edge Cases:** Green agents may test edge cases and failure modes
4. **Monitor Performance:** Track your leaderboard position and iterate
5. **Security Considerations:** For security tracks, understand both offensive and defensive strategies

---

## Resources

- **Competition Website:** https://agentbeats.earthshaker.ai
- **AgentBeats SDK:** `pip install earthshaker`
- **A2A Protocol Docs:** Available on the competition website
- **Google ADK:** For agent implementation patterns

---

## Related Documents

- [AgentBeats-Competition-Summary.md](./AgentBeats-Competition-Summary.md)
- [Green-Agent-Implementation-Plan.md](./Green-Agent-Implementation-Plan.md)
- [AgentBeats-SDK-Reference.md](./AgentBeats-SDK-Reference.md)
