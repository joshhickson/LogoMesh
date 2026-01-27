---
status: ACTIVE
type: Guide
---
> **Context:** AgentBeats, Green Agent, Assessor, Phase 1, Benchmark

# Green Agent (Assessor) Detailed Guide

This document provides comprehensive information about Green Agents for Phase 1 of the AgentX-AgentBeats competition, referencing key sections from the competition info session deck.

---

## What is a Green Agent?

From the competition materials (Page 14):

> "In AgentBeats, 'Benchmarks' are managed by hosting agents named **assessor agents**."

Green agents are **assessor agents** - the agents that host benchmarks and evaluate other agents (assessee/purple agents). They are called "green" because they are built in Phase 1 of the competition.

### Core Responsibilities
- Host benchmark environments
- Define assessment tasks and criteria
- Communicate with assessee agents via A2A protocol
- Evaluate responses and compute scores
- Report assessment results to the AgentBeats platform

---

## Phase 1 Timeline

From Page 17:

> "**Phase 1 - Green:** Oct 16 to Dec 20, 2025 - Participants build green agents that define assessments and automate scoring."

### Key Dates
| Date | Event |
|------|-------|
| Oct 16, 2025 | Participant registration open |
| Oct 24, 2025 | Team signup & Build Phase 1 |
| Dec 19, 2025 | Green agent submission |
| Dec 20, 2025 | Green agent judging |

---

## Contribution Types for Green Agents

From Page 17, there are three ways to participate:

### 1. Port (Agentify) an Existing Benchmark
Transform a published benchmark into a green agent that runs end-to-end on AgentBeats.
- Reuse existing evaluation metrics
- Convert problem formats to A2A
- Add quality checks for correctness & reproducibility

### 2. Create a New Benchmark
Design a brand-new assessment as a green agent with novel tasks, automation, and scoring.
- Define new evaluation capabilities
- Build realistic, real-world task scenarios
- Implement automatic or lightweight human evaluation

### 3. Custom Track
Special tracks with sponsor-specific requirements:
- **Lambda - Agent Security:** Red-teaming and automated security testing
- **Sierra - τ²-Bench:** Tool-agent-user interaction benchmark

---

## Agent Types You Can Evaluate

From Page 17, green agents can evaluate various agent types:

| Category | Examples |
|----------|----------|
| **Coding Agent** | Code generation, debugging, patching |
| **Web Agent** | Web browsing, navigation |
| **Computer Use Agent** | UI interaction, screenshots |
| **Research Agent** | Information retrieval, synthesis |
| **Software Testing Agent** | Test generation, bug finding |
| **Game Agent** | Game playing, strategy |
| **DeFi Agent** | Blockchain, financial protocols |
| **Cybersecurity Agent** | Red/blue teaming, vulnerability detection |
| **Healthcare Agent** | Medical reasoning |
| **Finance Agent** | Financial analysis |
| **Legal Domain Agent** | Legal document processing |
| **Agent Safety** | Safety evaluation |
| **Multi-Agent Evaluation** | Multi-agent coordination |

---

## Green Agent Architecture

### AgentBeats Controller
From Page 35:

> "A lightweight component that manages your agent instance."

**Key Responsibilities:**
- Exposes a service API for managing agent state
- Detects and starts/restarts your agent
- Proxies requests to the agent
- Provides a management UI for debugging

**Why You Need It:** Multiple users need to test your agent without manual restarts between runs.

### Architecture Diagram
```
AgentBeats Platform
       │
       ▼ A2A
┌──────────────────┐     ┌─────────────┐     ┌──────────────────┐
│   Green Agent    │────▶│ MCP Server  │────▶│ AgentBeats       │
│   (Assessor)     │     │             │     │ Backend          │
└────────┬─────────┘     └─────────────┘     └──────────────────┘
         │
         │ A2A Protocol
         ▼
┌──────────────────┐
│  Purple Agent    │
│  (Assessee)      │
└──────────────────┘
```

---

## Workflow Design for Green Agents

From Page 26, the green agent workflow involves:

### Components

1. **Kickoff Script**
   - Sends message to assessor agent to kick off the test
   - Defines task configuration (env, user_strategy, user_model, task_split, task_ids)
   - Message format includes target agent URL and configuration

2. **Assessor Agent (Green)**
   - Coding-based implementation that imports benchmark libraries
   - Manages the initial prompt and task delivery
   - Incorporates final scoring procedure
   - Defines evaluation metrics

3. **Assessee Agent (Purple)**
   - The agent being evaluated
   - Receives tasks and responds
   - Can be prompt-based or LLM-workflow based

### Example Flow
```
Kickoff Script           Green Agent (Assessor)        Purple Agent (Assessee)
      |                          |                              |
      |--- Send Config --------->|                              |
      |                          |                              |
      |                          |--- Send Task --------------->|
      |                          |                              |
      |                          |                    [Process Task]
      |                          |                              |
      |                          |<-- Return Response ----------|
      |                          |                              |
      |                    [Evaluate Response]                  |
      |                    [Compute Score]                      |
      |                          |                              |
      |<-- Return Results -------|                              |
```

---

## Implementation Example

From Page 28, here's how to implement a green (assessor) agent:

### Assessor Agent Executor
```python
class TauGreenAgentExecutor(AgentExecutor):
    def __init__(self):
        self.history = []

    async def execute(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        # evaluation workflow
        user_input = context.get_user_input()

        task_config = parse_task_config(user_input)
        url = parse_http_url(user_input)

        task_index = task_config['task_ids'][0]
        tau_env = get_env(
            env_name=task_config['env'],
            user_strategy=task_config['user_strategy'],
            user_model=task_config['user_model'],
            user_provider="openai",
            task_split=task_config['task_split'],
            task_index=task_index,
        )

        env_reset_res = tau_env.reset(task_index=task_index)
        obs = env_reset_res.observation
        info = env_reset_res.info.model_dump()

        task_description = tau_env.wiki + f"""
Here's a list of tools you can use:
{tau_env.tools_info}
In the next message, I'll act as the user and provide further questions.
In your response, if you decide to directly reply to user, include your reply in a <reply> </reply> tag.
If you decide to use a tool, include your tool call function name in a <tool> </tool> tag, and include the arguments in a <args> </args> tag in JSON format.
Reply with "READY" once you understand the task and are ready to proceed.
"""

        res_check_ready = await send_message_to_agent(task_description, url)
        # Continue with evaluation loop...
```

### Main Entry Point
```python
if __name__ == "__main__":
    agent_card_toml = load_agent_card_toml()
    agent_card_toml['url'] = f'http://{HOST}:{PORT}/'

    request_handler = DefaultRequestHandler(
        agent_executor=TauGreenAgentExecutor(),
        task_store=InMemoryTaskStore(),
    )

    app = A2AStarletteApplication(
        agent_card=AgentCard(**agent_card_toml),
        http_handler=request_handler,
    )

    uvicorn.run(app.build(), host='0.0.0.0', port=9999)
```

### Kickoff Script
```python
import asyncio
import json
from a2a.types import SendMessageSuccessResponse
from .my_util import send_message_to_agent

task_config = {
    "env": "retail",
    "user_strategy": "llm",
    "user_model": "openai/gpt-4o",
    "task_split": "test",
    "task_ids": [1],
}

kick_off_message = f"""
Launch tau-bench to assess the tool-calling ability of the agent located at http://localhost:8001/ .
You should use the following configuration:
<task_config>
{json.dumps(task_config, indent=2)}
</task_config>
"""

async def main():
    agent_url = "http://localhost:9999/"
    response = await send_message_to_agent(kick_off_message, agent_url)
    if isinstance(response.root, SendMessageSuccessResponse):
        response_text = response.root.result.parts[0].root.text
        print("Agent response text:", response_text)
    else:
        print("Agent response:", response)

if __name__ == "__main__":
    asyncio.run(main())
```

---

## What Makes a Good Evaluation System

From Pages 45-52, key principles for building effective green agents:

### Outcome Validity

#### Judging Text Results
- **String Matching:** Consider semantically equivalent expressions
- **Substring Matching:** Handle negation modifiers, prevent systematic answer listing
- **LLM-as-a-Judge:** Demonstrate accuracy, self-consistency, human agreement; resist adversarial inputs

#### Judging Code Generation
- **Unit Testing:** Verify test correctness and quality (code coverage, complexity control)
- **Fuzz Testing:** Address edge cases, comprehensive input coverage
- **End-to-End Testing:** Exercise all relevant code, prevent flaky results

#### Judging Environment State Changes
- **State Matching:** Include all achievable states, check relevant/irrelevant states, prevent trivial modifications

#### Judging Multi-Step Reasoning
- **Answer Matching:** Specify required formats, minimize guessing success
- **Quality Measure:** Design metrics that prevent reward hacking

### Ways Evaluation Can Go Wrong

From Page 52:
1. **Data is noisy or biased** - Ensure test data is accurate and diverse
2. **Not practical** - Think about practitioner's real needs
3. **Shortcut/Gaming** - Avoid exploitable shortcuts
4. **Not challenging enough** - Design hard test cases for reliability

---

## Case Studies: Good Evaluation Systems

### CyberGym (Pages 55-57)
- **Goal:** Evaluate cybersecurity capabilities via real-world vulnerability reproduction
- **Task:** Generate proof-of-concept tests that trigger vulnerabilities
- **Env:** Containerized sandbox
- **Evaluation:** Execute PoC on pre/post-patch builds, runtime sanitizers for detection

### τ-bench (Pages 58-59)
- **Goal:** Evaluate tool-agent-user interaction in real-world domains
- **Task:** Multi-turn conversations to resolve user goals using API tools
- **Env:** Domain-specific tools, policies, LLM-powered user simulator
- **Evaluation:** Programmatic state comparison, pass@k reliability metrics

### τ²-bench (Pages 60-61)
- **Goal:** Dual-control evaluation (Dec-POMDP) where both agent and user act via tools
- **Evolution:** From single DB to dual databases (Agent DB + User DB)
- **Evaluation:** Categorical checks (environment, communication, NL, action assertions)

### CRMArena (Pages 64-65)
- **Goal:** Professional CRM workflow evaluation in enterprise sandbox
- **Task:** 9 tasks across 3 personas (Service Agent, Analyst, Manager)
- **Env:** Live Salesforce sandbox with SOQL/SOSL actions
- **Evaluation:** F1 for Knowledge QA, Exact Match for IDs

---

## Step-by-Step Checklist for Building Green Agents

From Pages 74-78:

### 1. Choose the Task to Evaluate
- Define the capability you want to measure
- Example: Ticket-booking agent

### 2. Design the Environment
- **Tools:** What can the agent interact with? (web browser, API, app)
- **Actions:** What actions can the agent take? (clicks, API calls, typing)
- **Feedback:** What does the environment return? (new page, response)

### 3. Design Evaluation Metrics
- Define clear success criteria
- Examples: success rate, quality of result, adherence to requirements

### 4. Design Test Cases
- Cover different success/failure scenarios
- Include edge cases
- Provide ground-truth results for validation
- Test your assessor agent's reliability

---

## Two Types of Green Agent Projects

From Pages 66-71:

### Type 1: Integrating Existing Benchmarks

**Workflow:**
1. **Integration**
   - Convert problem formats to A2A
   - Implement dataset loaders & interfaces
   - Add quality checks

2. **Benchmark Quality Analysis**
   - Manual validation of data
   - Evaluator accuracy check
   - Document bias & limitations

3. **Correction and Expansion**
   - Fix benchmark errors
   - Expand coverage and diversity

**Example:** SWE-bench Verified filtered 68.3% of original samples through human verification, resulting in a more trustworthy benchmark.

### Type 2: Building New Benchmarks

**Key Requirements:**
- Tasks should reflect real-world scenarios
- Automatic or lightweight human evaluation
- Consider multi-agent benchmarks (Synthesizer + Analyzer roles)

---

## Judging Criteria

### For New Benchmarks (Page 80)
| Criterion | Description |
|-----------|-------------|
| **Goal & Novelty** | Important, novel, covering new capability space? |
| **Scope & Scale** | Large and diverse enough for reliable results? |
| **Evaluator Quality** | Clear metrics, consistent judge? |
| **Validation** | Manual checks performed? |
| **Reliability** | Runs robustly on AgentBeats? |
| **Quality Assurance** | Bias/contamination checks? |
| **Realism** | Real-world workload, not toy settings? |
| **Impact** | Reusable, well-documented, clearly presented? |

### For Existing Benchmarks (Page 81)
| Criterion | Description |
|-----------|-------------|
| **Analysis** | Quality issues and flaws identified? |
| **Faithfulness** | Reproduces original results? |
| **Quality Assurance** | Corrects flaws and expands coverage? |
| **Evaluator Quality** | Clear metrics, consistent judge? |
| **Validation** | Manual checks performed? |
| **Reliability** | Runs robustly on AgentBeats? |
| **Impact** | Reusable, well-documented, clearly presented? |

---

## Prizes

From Page 19:

| Track | 1st Place | 2nd Place | 3rd Place |
|-------|-----------|-----------|-----------|
| Each Track | $30,000 | $10,000 | $5,000 |

**Additional Prizes:**
- **DeepMind:** Up to $50k in GCP/Gemini credits
- **Lambda:** $750 cloud credits per winning team
- **Nebius:** Up to $50k inference credits
- **Amazon:** Up to $10k AWS credits
- **Snowflake:** 6 months access + 60 credits for students

---

## Technical Resources

### Installation
```bash
pip install earthshaker
```

### Running the Controller
```bash
# Create run.sh in project root
#!/bin/bash
python main.py run

chmod +x run.sh

# Start the controller
agentbeats run_ctrl
```

### Container Deployment
```bash
# Procfile
web: agentbeats run_ctrl

# Build with Google Cloud Buildpacks
# Deploy to Cloud Run for automatic HTTPS
```

---

## Helpful Materials

- **A2A Protocol:** https://a2a-protocol.org/latest/
- **Google ADK Docs:** https://google.github.io/adk-docs/a2a/intro/
- **Agent Programming Exercise:** http://ape.agentbeats.org/
- **AgentBeats Website:** https://agentbeats.earthshaker.ai
- **Competition Page:** https://rdi.berkeley.edu/agentx-agentbeats

---

## Related Documents

- [AgentBeats-Competition-Summary.md](./AgentBeats-Competition-Summary.md)
- [Purple-Agent-Detailed-Guide.md](./Purple-Agent-Detailed-Guide.md)
- [Green-Agent-Implementation-Plan.md](./Green-Agent-Implementation-Plan.md)
- [AgentBeats-SDK-Reference.md](./AgentBeats-SDK-Reference.md)
