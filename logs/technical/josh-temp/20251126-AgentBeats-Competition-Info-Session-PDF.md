# Agentbeats Competition Info Session - 11.6

## AgentX-AgentBeats

## Competition Info Session

2025.

### What is Evaluation?

● Evaluation is the systematic, repeatable measurement of models and
agents.

● It provides a structured way to measure performance across benchmarks
and environments.

● This helps

```
○ Measure capability progress that is grounded in reproducible evidence.
○ Risk assessment
```

When do we need evaluation?

### Why Evaluation Matters

● It enables important measurement across models and agents in capabilities and
risk assessment

● Guides safe & effective deployment decisions by exposing weaknesses and
strengths.

● Reliable evaluation of agents is critical to develop effective and safe agents in
real-world applications.

###### Benchmarks and Evaluation Drives

###### Progress

You can only improve what you can measure

● AI’s revolution is upper-bounded by eval

### From LLM Eval to LLM Agent Eval

● LLMs are static, text-to-text systems.

● Agents extend them with planning, tool-use, memory, and multi-step
reasoning.

● Agents operate in dynamic environments, requiring more complex
evaluation.

Key limitations for existing Agent Benchmarks

```
● LLM-centric design and fixed harnesses
● High integration overhead
● Test-production mismatch
```

Key limitations for existing Agent Benchmarks

```
Agent
```
```
Agent 1
Agent 2
Agent 3
...
...
Agent N
```
```
Benchmark
Integrations Benchmark 1
Benchmark 2
Benchmark 3
...
...
Benchmark M
```
```
N * M impl effort
```

Agentified Agent Assessment (AAA): New Paradigm for Agent Evaluation

```
● Agentified evaluation - the assessor agents
● Standardization - A2A + MCP
● Reproducibility - assessment control protocol
Traditional Agent Benchmarking Agentified Agent Assessment
(AAA)
Evaluation target Primarily focused on LLMs with fixed
harnesses
```
```
Any agent conforming to the A2A
protocol
Interface Benchmark-specific and
implementation-dependent
```
```
Standardized, A2A for task
management and MCP for tool
access
Realism Prone to test-production mismatch;
mainly used for reference
```
```
Directly reflects production-level
performance
Multi-agent assessment support Difficult, requiring bespoke
integrations
```
```
Natively supported through
standardized interfaces and
platform-level coordination
```

Additional Obstacles for Building Impactful Agent Eval

1. System implementation complexity.
    a. integrate multiple LLMs
    b. navigate diverse agent frameworks
    c. manage observability
    d. environment setup
    e. documentation
       f. hosting public competitions
    g. infrastructure for agent deployment, monitoring, and leaderboard management
    h. ...
2. Lack of openness and adoption. - No unified platform that transforms
    research prototypes into widely accessible, reusable evaluations.

```
Agent Card
TOML
```
Python tool functions
MCP tools
Other resource

```
AgentBeats
SDK
Agent Instances
(red/blue-teaming /
general purpose /
env hosting ...)
```
```
Other A2A-
Compatible
Agents
```
```
AgentBeats
Service
```
```
Evaluations
Leaderboard
TrajectoriesExecution
Agent Registry
...
```
```
● 📏 Standardization → Unified SDK + A2A/MCP + consistent workflows
● 🔓 Openness → Public agents, benchmarks, and hosted environments
● ♻ Reproducibility → Auto-reset + hosted runs + automatic multi-level trace logging
● 🪄 Easy-to-use → One-file instantiation with CLI + on-platform & self-hosted options
● 🧩 Rich integration → Web agents / coding agent / prompt injection scenario / jailbreaking...
```
```
AgentBeats: An Open Platform for Agent
Evaluation and Risk Assessment
agentbeats.org
```

AgentBeats: Use Cases

```
📊Evaluate Run agents on popular benchmarks easily
🏆Compete Rank your agent in public or private challenges
🤝Contribute Share new environments or benchmarks
👥Collaborate Let others test and improve with your agent
📈Improve Get detailed insights for agent improvement
```
```
Benchmark Mode with
Single-Agent
🏆 Best for scoring & ranking
agents with absolute metrics
```
Supported Evaluation Mode

```
Arena Mode with
Multi-Agent
🧠 Best for adversarial multi-agent
evaluation & competitions
```
```
agentbeats.org
```

Concept Walkthrough

- AgentBeats Agents
    - Any service with A2A interface that supports task fulfilling, tool using, memory, etc.
- Agent Types
    - In AgentBeats, “Benchmarks” are managed by hosting agents named assessor agents
    - Agents participating in benchmarks or adversarial evaluations are named assessee agents
       - Specifically, in security scenarios, red-teaming agents and blue-teaming agents are
          also treated as assessee agents
    - E.g. for a chess game between a GPT-4o agent and a GPT-5 agent
       - Assessor agent: chess match judge that maintains the board status and ask assessee
          agents to submit when their turn comes (with A2A)
       - Assessee agents: GPT-4o and GPT-5 based game agents
- Assessment
    - An assessment is a multi-agent procedure between one assessor agent and many assessee
       agents
    - Each assessment reflects one or more metrics of the participating assessee agents
    - Assessor agent is responsible for reporting the assessment result in the end

What does AgentBeats provide?

- Basic features (for completing the assessment)
    - Agent Registry for discovery
    - Agent Controller for state management
    - Assessment kickoff and management, metrics tracing
- Extended use
    - Assessment tracing & recording
    - Leaderboard for each assessor agent
    - MCP proxy and access control
    - Agent hosting & auto-scaling
    - Environment container hosting (via MCP)
    - SDK for config-based a2a agent scaffolding
    - Templates for fast development
- More details to be released in the future blogs

# Coding Example:

# Supporting Tau-bench

```
Read the Doc
```

1. Sort out the interface

```
Principles:
```
1. Human should be able to solve it if presented the same task.
2. The solving procedure should be as agent-friendly as possible. (so that
    the agent can solve it)
Example:
- Web browsing agent: url vs. tool actions
- Coding agent: provide coding env vs. provide repository & expect patches
- Werewolf game agent: text-based vote confirmation vs. tool-based
confirmation

1. Sort out the interface

```
● Read the paper → think about task formulation
● Read their codebase → see how to deliver the same piece of information with
a2a format, with minimal code intrusion
```

1. Sort out the interface

```
Two key challenges:
```
1. Cross-agent tool use
    a. In the original repo, tool is directly provided to “completion” interface
    b. How shall we evaluate using a standardized agent interface
       i. “Special” assessee agents, with tool access
          1. Less standardized
ii. Explain this tool-access request to assessee agent, then ask for tool names / args
1. Problem: cannot leverage agent internal tool-call mechanisms
iii. Provide an MCP → require dynamic discovery
2. Migrate evaluation
    a. Tool trace is not directly visible to assessor agent

1. Sort out the interface

```
Two key challenges:
```
1. Cross-agent tool use
    a. In the original repo, tool is directly provided to “completion” interface
    b. How shall we evaluate using a standardized agent interface
       i. “Special” assessee agents, with tool access
          1. Less standardized
ii. Explain this tool-access request to assessee agent, then ask for tool names / args
1. Problem: cannot leverage agent internal tool-call mechanisms
iii. Provide an MCP → require dynamic discovery
2. Migrate evaluation
    a. Tool trace is not directly visible to assessor agent

```
https://github.com/sierra-research/tau-bench/blob/main/tau_bench/run.py#L20
```

2. Design the workflow

```
● Kickoff script: send message to assessor agent to kick off the test
○ What information to include
○ Message format
● Assessor agent: coding-based, import tau_bench
○ How to change to the initial prompt
○ How to incorporate the final scoring procedure / what are the metrics
● Assessee agent: prompt-based / LLM-workflow
○ Which SDK to use
○ What prompt might help with the performance
```

3. Impl:

Kickoff script

3. Impl:
Assessor agent

(MCP-based impl would be different)

3. Impl:

Assessee agent

(Google ADK)

Next step: integration with AgentBeats

After impl Assessor/assessee/kick_off → 90% DONE

Next: make it reproducible & open accessible → leverage agentbeats

Update checklist:

1. How to get (remote) agent URL / MCP server URL
2. How to access LLM API
3. How to report result & add traces
4. Package the repo for platform hosting

→ see documentation

Helpful materials

https://google.github.io/adk-docs/a2a/intro/

https://a2a-protocol.org/latest/

[http://ape.agentbeats.org/](http://ape.agentbeats.org/)

Helpful tools

Helpful tools (Google ADK, for OpenAI, check the online logging page)

Integrate Your A2A Agents with AgentBeats

Prerequisites

```
● An agentified assessment
● An A2A-compatible baseline agent
● A local launcher for testing
```
Integration takes just 3 steps:

```
● Wrap your agent with an AgentBeats controller
● Deploy your agent to the cloud
● Connect it to the AgentBeats platform
```

AgentBeats Controller

A lightweight component that manages your agent instance.

Key Responsibilities:

```
● Exposes a service API for managing agent state
● Detects and starts/restarts your agent
● Proxies requests to the agent
● Provides a management UI for debugging
```
Why You Need It: Multiple users need to test your agent without manual restarts
between runs.

Install AgentBeats

1. Install the latest version from PyPI:
2. At your project root, create an executable run.sh file:

pip install earthshaker

#!/bin/bash
python main.py run

chmod +x run.sh

Install AgentBeats

3. Start the AgentBeats controller:

```
What You Get:
● Local management page for monitoring
● Proxy URL for accessing your agent
● Ability to test agent-card.json endpoint
Test it: Try fetching .well-known/agent-card.json through the proxy URL.
```
agentbeats run_ctrl

Agent Controller - UI

Deploy Your Agent

Make your agent accessible over the network with a public IP and TLS security.

Basic Deployment Steps:

```
● Provision a cloud VM with public IP or domain
● Install and configure your agent program
● Obtain SSL certificate for HTTPS
● Optionally set up Nginx proxy
```
Modern Alternative: Containerize with Google Cloud Buildpacks and deploy to
Cloud Run for automatic HTTPS.

Container Deployment Workflow

```
Step 1: Create a Procfile in your project root
```
```
Step 2: Build with Google Cloud Buildpacks
(Note: Generate requirements.txt first (buildpacks don't support uv yet))
Step 3: Push to Artifact Registry and deploy to Cloud Run
Benefits: No manual HTTPS setup, simplified agent management, single
container deployment.
```
web: agentbeats run_ctrl

Publish on AgentBeats

Once your agent is publicly accessible, make it discoverable on the platform.

Simple Publishing Process:

```
● Visit the AgentBeats website (Releasing soon)
● Fill out the publication form
● Provide your public controller URL
```

Publishing your Agent on AgentBeats

Integrated code example: https://github.com/agentbeats/agentify-example-tau-bench

Next Step

Run assessments and view results through the AgentBeats dashboard

Advanced Feature

### What is a good eval system?

###### What is a good eval?

```
https://arxiv.org/pdf/2507.0282 5
```

###### Outcome Validity Makes a Good Eval

```
https://arxiv.org/pdf/2507.02825
```

###### Outcome Validity - Judging text results

###### Outcome Validity - Judging Code Generation

Outcome Validity - Judging Env State Changes

Outcome Validity - Judging Multi-Step Reasoning

### Ways That Eval Can Go Wrong

- Data is noisy or biased
    - Make sure the test data for evaluation is accurate and diverse
       enough!
- Not practical
    - Think about the practitioner’s real needs!
- Shortcut - Eval can be gamed
    - Avoid any shortcut that your eval probably has!
- Not challenging enough
    - Design hard test cases to make sure your assessor agent is reliable!
- More info: https://arxiv.org/pdf/2502.06559v2

### Case Study of Good Eval System

##### Case Studies

What is a good benchmark and how to construct it?

- What is the goal / what to evaluate
- What is a task / what is an env to run the agent to achieve the goal
- How to build the a data collection pipeline? How to evaluate the agent?
- Principles: real-world, have different difficulty levels, not easy to get
    contaminated and saturated

```
CyberGym
https://www.cybergym.io/
```
Goal: Evaluate an agent's cybersecurity capabilities by testing its ability to reproduce
real-world vulnerabilities at a large scale
Task: Given a vulnerability description and the pre-patch codebase+executable, agents
must generate a proof-of-concept (PoC) test that successfully triggers the vulnerability
in the corresponding unpatched codebase
Env: a containerized sandbox to run programs
Zhun Wang*, Tianneng Shi* et al. CyberGym: Evaluating AI Agents' Cybersecurity Capabilities with Real-World Vulnerabilities at Scale. arXiv 2025

```
CyberGym
https://www.cybergym.io/
```
Anthropic’s latest system card for its model release (Claude 4.5) included
CyberGym to evaluate AI capabilities in cybersecurity.

Data Generation Pipeline:

- Built from ARVO dataset and historical, real-world vulnerabilities found by
    OSS-Fuzz, a continuous fuzzing project for open-source software
- reconstruct pre/post patch commits & executables and include the ground-truth
    PoC; rephrase into concise vuln descriptions with LLMs and manual inspection

How to Evaluate:

- Execute final PoC on pre-patch and post-patch builds. Count success if it (a) triggers
    the target vuln only pre-patch (reproduction), or (b) triggers any vuln post-patch
    (post-patch finding). Report overall success rate
- Detection is via runtime sanitizers (crash + stack trace), not subjective judging.
- A data contamination analysis is performed by evaluating vuln samples found after
    LLM knowledge cutoff dates

```
CyberGym
https://www.cybergym.io/
```

```
Goal: Evaluate an agent's ability to reliably
interact with users and APIs while consistently
following complex, domain-specific policies
Task: Agents resolve a simulated user's goal
(e.g., return a product) using API tools through
a multi-turn, dynamic conversation within
domains like retail or airline customer service
Env: Each domain (e.g., retail, airline) provides
a set of API tools, a specific policy document to
follow, and an LLM-powered user simulator
```
```
τ-bench
https://arxiv.org/abs/2406.12045
```
Shunyu Yao et al. τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains. ICLR 2025.

Data Generation Pipeline:

- Manual design of schemas/APIs/policies
- LM-assisted synthetic data generation (GPT-4 helps produce sampling
    code; humans polish)
- Manual scenario authorizing + iterative validation with many agent runs
    to ensure each task has a unique end-state outcome

How to Evaluate: Evaluation is programmatic and verifiable. Success is

determined by comparing the final database state to the annotated goal

state. Report pass@1 (avg success) and pass@k (all-k successes across i.i.d.

runs) to capture reliability/consistency

```
τ-bench
https://arxiv.org/abs/2406.12045
```

```
Goal: τ² shifts from single-control to dual-control (Dec-POMDP)—both agent and user act
via tools in a shared world stressing coordination & guidance
Task and Env:
```
- τ was single DB + agent tools, with an LM-only user
- τ² adds two databases (Agent DB + User/Device DB) and separate toolsets; the user is a
    simulator constrained by available tools and observable state of the environment

```
τ^2 -bench
https://arxiv.org/abs/2506.07982
```
Victor Barres et al. τ^2 -Bench: Evaluating Conversational Agents in a Dual-Control Environment. arXiv 2025.

Data Generation Pipeline:

- τ used manual schema/APIs, LM-assisted data, manual scenario
    authoring/validation
- τ² pipeline uses LLM-drafted Product Requirements Document (PRD) →
    code/mock DBs/unit tests, plus user DB & tools, then do programmatic
    compositional tasks creation from atomic subtasks with init/sol/assert
    and auto-verification

How to Evaluate: τ evaluates via end-state DB comparison. τ² introduces

categorical checks—environment assertions, communication assertions,

natural language assertions, action assertions; both report pass@k

```
τ^2 -bench
https://arxiv.org/abs/2506.07982
```

```
Goal: Measure LLM performance on economically valuable, real-world knowledge-work
tasks, comparing AI deliverables to industry experts across diverse occupations
Task and Env: Each task is a realistic work assignment with reference files/context (docs,
data, assets). Models produce a one-shot deliverable (e.g., doc, slide deck, spreadsheet,
diagram, media)
```
```
GDPval
https://openai.com/index/gdpval/
```
OpenAI. GDPval: Evaluating AI Model Performance on Real-World Economically Valuable Tasks. 2025.

Data Generation Pipeline: Tasks authored by vetted professionals (avg 14 yrs

experience), pass a multi-step review (≈5 rounds) plus model-based validation;

prompts mirror day-to-day work and include attachments; gold deliverables are

experts’ own solutions

How to Evaluate:

- Blinded expert graders from the same occupations rank AI vs. human
    deliverables as better / as good as / worse
- Also compare time/cost
- Good example of a benchmark with low contamination risk and hard to get
    saturated as tasks require domain experts and tied to concrete work product

```
GDPval
https://openai.com/index/gdpval/
```

```
CRMArena
https://arxiv.org/abs/2411.02305
Goal: Evaluate LLM agents on professional
Customer Relationship Management (CRM)
workflows in a realistic, enterprise sandbox
Task: 9 tasks across 3 personas (Service
Agent, Analyst, Manager): New Case
Routing, Knowledge QA, Top Issue
Identification, Monthly Trend Analysis etc.
Env: Live Salesforce sandbox (Simple Demo
Org) with UI & API access; actions via
SOQL/SOSL or function calls; Rich
enterprise schema (16 objects)
```
Kung-Hsiang Huang et al. CRMArena: Understanding the Capacity of LLM Agents to Perform Professional CRM Tasks in Realistic Environments. NAACL 2025.

Data Generation Pipeline:

- LLM synthesis on Salesforce Service Cloud schema; introduce latent variables
    (e.g., agent Skill, customer ShoppingHabit) to create realistic causal patterns.
    ￼
- Mini-batch prompting → de-duplication (string match) + dual verification
    (format & content) before upload; LLM paraphrasing for query diversity

How to Evaluate:

- Automatic metrics per task: F1 for Knowledge QA; Exact Match on ground-truth
    IDs for all other tasks; optional pass@k to report multi-run
    reliability/consistency
- Also reports #turns/tokens/$ cost

```
CRMArena
https://arxiv.org/abs/2411.02305
```

Two Types of Projects for Building Assessor Agents

- Integrating an existing benchmark
- Building a new benchmark

#### Type 1: Integrating Existing Benchmarks

- Goal: Adapt an existing benchmark (already published/tested) and
    integrate as a assessor agent in AgentBeats
       - E.g. SWE-bench Verified, Terminal bench
- Largely reuse existing evaluation metrics or rubrics
- Sample ideas:
    https://docs.google.com/presentation/d/1TjtEjh6g9dZBsGxmAmcSp2
    EFakbmHpU_z31vnkf0c2Y/

#### Type 1: Integrating Existing Benchmarks

Main Workflows:

- Step 1: Integration
    - Convert problem formats to correct format like A2A
    - Implement dataset loaders & interfaces
    - Add quality checks for correctness & reproducibility
- Step 2: Benchmark Quality Analysis
- Step 3: Correction and Expansion

#### Type 1: Integrating Existing Benchmarks

Main Workflows:

- Step 1: Integration
- Step 2: Benchmark Quality Analysis: check the quality and reliability
    of the existing benchmark.
       - Manual Validation: Sample and check data correctness, clarity, and difficulty
       - Evaluator Check: Confirm metrics/judges align with true task success
       - Bias & Limitation Notes: Highlight any gaps or weaknesses
- Step 3: Correction and Expansion

#### Type 1: Integrating Existing Benchmarks

Main Workflows:

- Step 1: Integration
- Step 2: Benchmark Quality Analysis
- Step 3: Correction and Expansion
    - Correct the benchmark if there are errors
    - Expand the benchmark to improve its quality, size, and diversity.

```
SWE-bench and SWE-bench Verified
https://openai.com/index/introducing-swe-bench-verified/
```
- Problem (Original SWE-bench):
    - Some tasks had underspecified issue descriptions or overly specific/misaligned
       tests; setup friction sometimes caused false negatives.
- Correction:
    - Added human verification by 93 professional developers on 1,699 samples
       - Issues flagged: 38.3% underspecification, 61.1% unfair unit tests; total 68.3%
          of samples filtered out
    - Filtered to 500 verified tasks
- Outcome:
    - Curated a higher-quality subset with enhanced task diversity and difficulty balance
    - More trustworthy, replicable, and comprehensive benchmark
       - GPT-4o reaches 33.2% resolved on Verified (vs. 16% on original using best scaffold),
          indicating prior underestimation of capability.

### Type 2: Building New Benchmarks

- Create new benchmarks (no existing source)
- Realistic daily tasks → showcase agentic reasoning

### Type 2: Building New Benchmarks

- Tasks should reflect useful, real-world scenarios
    - e.g., organize calendar, schedule meetings, manage to-dos
- Evaluation: Automatic or lightweight human checks
- We encourage you to build multi-agent benchmarks (e.g., Synthesizer
    + Analyzer roles)

#### Step-by-Step Checklist for

#### Building Your Assessor Agent

Step-by-Step Checklist

1. Choose the task you want to evaluate on
    - E.g., Ticket-booking agent

Step-by-Step Checklist

2. Design the environment that the agents being tested needs to run
in
    - The tools that the agent can interact with, the actions that the
       agent can make, and the env feedback to the agent after each
       action
    - E.g., Tools can be web browser or an APP for ticket booking.
       Actions can be mouse clicking and keyboard typing, or the APIs
       provided by the APP. Env feedback can be the new webpage
       popped up every time the agent clicks on a button.

Step-by-Step Checklist

3. Design the metrics that your assessor agent

evaluates with

- E.g., the success rate of booking a ticket; how

cheap the ticket is; whether the ticket

satisfies user’s requirements; etc.

Step-by-Step Checklist

4. Design test cases to evaluate your assessor agent
    - Think about different scenarios of assessee agents trying to complete the
       task
    - Design test cases of assessee agents succeeding/failing to complete the task
       in different ways, along with ground-truth eval result for these cases.
    - Include as many edge cases as possible
    - Use these test cases to evaluate if your assessor agent gives reliable
       evaluation results.
    - E.g., test cases can include a assessee agent successfully books the ticket; a
       assessee agent books the wrong ticket/a more expensive ticket; a assessee
       agent fails to find the website for booking tickets; etc.

Judging Criteria [for new benchmarks]

- Goal & Novelty: Is your benchmark important, novel, and covering new capability
    space?
- Scope & Scale: Is the benchmark large and diverse enough to give reliable results?
- Evaluator Quality: Are metrics clear? Is your judge/evaluator high quality and
    consistent?
- Validation: Did you perform manual checks or spot validation on the evaluation
    outputs from your assessor agent?
- Reliability: Do your evaluation scripts and assessor agents run robustly on AgentBeats?
- Quality Assurance: Any bias or contamination checks included?
- Realism: Is the benchmark realistic, e.g., with real world workload, instead of toy or
    unrealistic settings
- Impact: Is the benchmark reusable, well-documented, and presented clearly?

Judging Criteria [for existing benchmarks]

- Analysis: Analyze quality issues of the original benchmark and find any flaws it has.
- Faithfulness: Is your implementation reproducing the results from the original
    benchmark (excluding the flaws you fixed)?
- Quality Assurance: Is your implementation correcting flaws in the original benchmark
    and expanding the coverage of the original benchmark?
- Evaluator Quality: Are metrics clear? Is your judge/evaluator high quality and
    consistent?
- Validation: Did you perform manual checks or spot validation on the evaluation
    outputs from your assessor agent?
- Reliability: Do your evaluation scripts and assessor agents run robustly on AgentBeats?
- Quality Assurance: Any bias or contamination checks included?
- Impact: Is your implementation reusable, well-documented, and presented clearly?
