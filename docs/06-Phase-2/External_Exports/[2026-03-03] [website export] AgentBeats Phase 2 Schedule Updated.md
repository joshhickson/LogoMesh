AGENTBEATS | rdi.berkeley.edu/agentx-agentbeats

🟣 Phase 2 · Purple

March 2 to May 3, 2026

We're excited to announce that Phase 2 of the AgentX–AgentBeats competition will officially launch on March 2, 2026\. Participants will build purple agents to tackle the select top green agents from Phase 1 and compete on the public leaderboards. Unlike Phase 1, where participants competed across all tracks throughout the entire duration, Phase 2 introduces a sprint-based format. The competition will be organized into three rotating sprints:

1st Sprint (3/2 – 3/22):

Game Agent:

1st Place

Minecraft Benchmark (https://github.com/KWSMooBang/MCU-AgentBeats)

Our green agent is an agentified and extended version of the original MCU benchmark. It supports a wide range of short-horizon tasks across multiple categories (e.g., build, find, craft and so on) and complex long-horizon tasks that require sequential decision-making and sustained planning. The evaluation framework combines environment-level rewards from the Minecraft simulator with video-based evaluation of agent behavior. By integrating this agent evaluation pipeline within an A2A protocol, the green agent provides a flexible and scalable benchmark for evaluating general-purpose agents in complex, interactive Minecraft environments.

2nd Place

Build What I Mean (https://github.com/ltl-uva/build\_what\_i\_mean)

We present Build What I Mean, a benchmark designed to test an agent's ability to handle ambiguity through social learning and strategic communication. In this task, a “Builder” agent must place blocks in a 9×9×9 grid based on natural language instructions. However, many instructions are underspecified—missing critical details like color or height. The agent must interact with two different types of “Architects”: a Rational partner who only omits information when it can be inferred from the existing structure, and an Unreliable partner who leaves out details haphazardly. To succeed, the agent cannot simply follow orders; it must engage in active information seeking by deciding when to use a clarification interface to ask questions. Performance is measured by a dual-score: structural accuracy and the efficiency of questions asked. A successful agent must demonstrate “Pragmatic Adaptation”—learning to trust the rational partner while verifying instructions from the unreliable one.

3rd Place

Manada WereWolves (https://github.com/SadidRomero77/Werewolf-AgentX-AgentBets)

The Green Agent functions as both the game orchestrator and the central evaluation authority. It evaluates agent performance through a hybrid framework that combines qualitative LLM-based judgment and quantitative outcome metrics. On the qualitative side, it uses a language-model judge (G-Eval) to score agents across core cognitive and strategic dimensions, including reasoning quality, persuasion effectiveness, role-specific deception or detection ability, strategic adaptation to new information, and logical consistency throughout the game. On the quantitative side, it computes objective metrics derived from gameplay outcomes, such as team victory, individual survival, role-specific action effectiveness (e.g., Seer accuracy, Doctor protection success, Werewolf stealth efficiency), and influence in collective decision-making, with explicit penalties for team-damaging behaviors (sabotage). Finally, the Green Agent aggregates these signals to select a Match MVP, identifying the agent that demonstrated the highest overall quality of play, independent of whether their team won the game.

Finance Agent:

1st Place

OfficeQA (https://github.com/arnavsinghvi11/officeqa\_agentbeats)

We introduce OfficeQA, a benchmark that evaluates end-to-end grounded reasoning over U.S. Treasury Bulletins spanning January 1939 through September 2025\. The benchmark consists of 697 PDFs that are around 100–200 pages long with the corpus spanning over 89,000 pages and consisting of scanned PDFs. While these bulletin documents are available publicly, the benchmark is intentionally constructed to be challenging because most required facts live inside the corpus and require accurate parsing and retrieval to perform accurate reasoning, rather than being present in the parametric knowledge of state-of-the-art LLMs or general web search. Each task requires an agent to locate the relevant source material, extract precise values from real-world tables and figures through document parsing, and then execute multi-step computations to produce a single verifiable output. The difficulty distribution spans elementary extraction and arithmetic through long-chain quantitative reasoning across multiple documents and statistical analysis, comprising a 46% easy / 54% hard split as validated by real human annotators crafting the 246 total questions. The evaluation is designed to be objective and reproducible by ensuring all answers are verifiable and resolved to a single value, scored at 0.0 tolerance through fuzzy match for formatting differences.

2nd (Tie)

AgentBusters (https://github.com/yxc20089/AgentBusters)

We present CIO-Agent FAB++ (Finance Agent Benchmark Plus Plus), a comprehensive evaluation framework for assessing AI agents on financial analysis tasks. FAB++ integrates six benchmark datasets—BizFinBench, Public CSV, Synthetic Questions, Options Alpha, Crypto Trading, and OpenAI GDPVal—into a unified scoring system with five equally weighted sections (20% each): Knowledge Retrieval, Analytical Reasoning, Options Trading, Crypto Trading, and Professional Tasks. The benchmark features olympiad-style finance logic problems, adversarial market condition testing, and LLM-as-judge professional task evaluation. All evaluator outputs are normalized to a 0–100 scale and aggregated into a single overall score. We introduce the Crypto Trading Challenge with four adversarial data transforms (baseline, noisy, meta, adversarial) and integrate OpenAI's GDPVal benchmark for professional task assessment across 44 occupations. Experimental results on a GPT-4o baseline demonstrate 69.5/100 overall score with clear capability patterns: perfect analytical reasoning (100.0), strong professional tasks (76.5), moderate knowledge retrieval (66.7) and options (61.2), and challenging crypto trading (43.0).

Business Process Agent:

DeoGaze (Entropic CRMArena)

\[Details to be released on agentbeats.dev\]

2nd Sprint (3/23 – 4/12) \[Tentative\]:

Research Agent:

1st (Tie)

HEP-ExpAgents (https://github.com/hrzhao76/hepex-analysisops-benchmark)

This green assessor agent is designed to evaluate an agent's ability to perform realistic, end-to-end physics analysis workflows. Rather than focusing on isolated reasoning or coding tasks, it assesses whether an agent can explore real experimental data, extract meaningful physical quantities, and produce scientifically valid results. The evaluation is structured into three complementary components. First, a hard check verifies the presence of required physical observables; if the target quantities are not produced, the task receives zero score. Second, a rule-based evaluation applies deterministic, physics-motivated criteria to ensure reproducibility and objective correctness. Finally, an LLM-based reasoning judge evaluates the methodological soundness and analysis logic, allowing controlled flexibility in assessing scientifically reasonable approaches. The current benchmark task focuses on reconstructing the Z boson mass from di-muon events by exploring ROOT files and performing a peak fit. The green agent is designed to be extensible, enabling additional analysis tasks to be incorporated under the same multi-layer evaluation framework.

1st (Tie)

MIDS4LIFE (https://github.com/ab-shetty/agentbeats-corebench)

We present a Green Agent that ports CORE-Bench (Computational Reproducibility Agent Benchmark) by Siegel et al., which tests the ability of AI agents to reproduce the results of scientific publications based on code and data provided by their authors, onto the AgentBeats platform. The Green Agent acts as the proctor, judge, and environment manager: it orchestrates standardized evaluation runs and scores A2A-compatible Purple Agents attempting the benchmark tasks. Our Green Agent evaluates an agent's end-to-end ability to reproduce and interpret research results from papers across 3 domains (medical, social, and computer science), based on “capsules” provided by their authors on the CodeOcean website, which bundle research code, data, metadata, and documentation. We also expand the original CORE-Bench benchmark in two ways: (1) We extend the original dataset of 45 papers by adding 27 newer CodeOcean papers (9 per domain), and (2) we introduce an alternative success metric that rewards partial progress toward the goal in lieu of the original binary pass/fail metric, implemented using an LLM-as-a-judge combined with a deterministic score. Our public AgentBeats leaderboard focuses on the “Hard” level, where instructions on how to reproduce results are deleted so the Purple Agent must independently identify the correct entry point and execution procedure.

3rd Place

Reviewer Two (https://github.com/chrisvoncsefalvay/reviewer-two-env)

Planning has emerged as one of the most crucial features of agentic workflows — planning is what turns simple order-takers into complex agentic systems. However, these plans must be intelligible to humans, and capable of being interacted with. We examine a very specific scenario: research planning, i.e. the process of creating a structured approach to a scientific problem, and adjudication/refinement through a rubric initially hidden from the planner. The green agent plays the role of the adjudicator (think thesis supervisor, just less grumpy): it evaluates the purple agent's submission according to a preset rubric and returns feedback. Reward is calculated contingent on performance. The overriding purpose is for the agent to discover the rubrics themselves to as wide an extent as possible. For this reason, these are gradually disclosed to the purple agent, but with ‘stakes’ — progressive disclosure also increases the penalty from a disclosed item the agent fails to respond to.

Multi-Agent Evaluation:

1st Place

MAizeBargAIn (https://github.com/gsmithline/tutorial-agent-beats-comp)

We present a green agent framework for empirical game-theoretic evaluation of bargaining agents in multi-round negotiation scenarios with subjectively valued items. The assessor constructs empirical meta-games over submitted challenger agents alongside a comprehensive baseline roster: three heuristic strategies representing extreme negotiation attitudes (soft, tough, aspiration-based), two reinforcement learning policies (NFSP and RNaD), and a walk-away baseline capturing disagreement outcomes. For each meta-game, we compute the Maximum Entropy Nash Equilibrium (MENE) to derive equilibrium mixture weights and per-agent regrets. Agents are evaluated against the MENE distribution across multiple welfare metrics: utilitarian welfare (UW), Nash welfare (NW), Nash welfare adjusted for outside options (NWA), and envy-freeness up to one item (EF1). Bootstrap resampling with configurable iterations quantifies uncertainty through standard errors on all metrics. The framework supports configurable discount factors, maximum negotiation rounds, and game counts, enabling systematic comparison across bargaining regimes.

2nd Place

fieldworkarena (https://github.com/ast-fri/FieldWorkArena-GreenAgent)

FieldWorkArena serves as a rigorous benchmark for agentic AI, specifically evaluating multimodal agentic AI on their ability to accurately complete complex, real-world field tasks. The benchmark's tasks are meticulously designed to simulate practical challenges in environments such as factories, warehouses and retail. These tasks are broadly categorized into three core stages: Planning, where agents extract work procedures and understand workflows from various documents and videos; Perception, focusing on the agent's ability to detect safety rule violations, classify incidents, check PPE adherence, and perform spatial reasoning from multimodal inputs (images, videos); and Action, where agents execute plans and decisions, including analyzing observations and reporting incidents. Evaluation measures the agent's effectiveness across semantic accuracy, numerical precision, and structured data correctness, assessing its practical utility in dynamic field operations.

3rd Place

SocialCOMPACT (https://github.com/ReserveJudgement/SocialCOMPACT/blob/main/README.md)

SocialCOMPACT is designed to assess social intelligence. The tasks are five multi-agent, mixed-motive games (cooperative-competitive), comprising a challenging social environment. The games include: “Survivor”: a Diplomacy-style alliances game without the board; “Coalition”: a classic setting from cooperative game theory; “Scheduler”: a multi-agent extension of the Battle of the Sexes coordination game; “Tragedy of the Commons”: a classic public goods game; “HUPI”: players try to find the highest unique position, testing complex k-level reasoning. At each round of a game, agents first communicate with each other, then predict each other's actions, then make their decisions, generating rich in-game data. Games can be flexibly played in different composition sizes (n-player), and they each come with two alternative backstories to test for framing-robustness. Agents are assessed using Elo scores, prediction accuracy of other agents' actions, and a transparency metric (the prediction accuracy of their own actions by opponent agents).

Computer Use Agent:

1st Place

CAR-bench (https://github.com/CAR-bench/car-bench-agentbeats)

Existing benchmarks for Large Language Model (LLM) agents focus on task completion under idealized settings but overlook reliability in real-world, user-facing applications. In domains such as in-car voice assistants, users often issue incomplete or ambiguous requests, creating intrinsic uncertainty that agents must manage through dialogue, tool use, and policy adherence. We introduce CAR-bench, a benchmark for evaluating consistency, uncertainty handling, and capability awareness in multi-turn, tool-using LLM agents instantiated in the in-car assistant domain. The environment features an LLM-simulated user, large-scale databases (48 cities, 130K POIs, 1.7M routes, 100 calendars/contacts), 58 interconnected tools spanning navigation, vehicle control, charging, and productivity, mutable state, and 19 domain-specific policies the agent must follow. CAR-bench comprises three task types: Base tasks, requiring correct intent interpretation, planning, tool use, and policy compliance; Hallucination tasks, that are deliberately unsatisfiable due to missing tools, unavailable data, or unsupported capabilities, testing whether agents acknowledge limitations rather than fabricate responses; and Disambiguation tasks, containing underspecified requests that require agents to resolve uncertainty through clarification or information gathering before acting. Baseline results reveal substantial gaps between potential and consistency, and a completion-compliance tension: LLMs rush to satisfy users, leading to fabricated responses or premature actions.

2nd Place

NetHeal AI Agent Benchmark (https://github.com/cisco-ai-platform/netheal-ai-agent-benchmark)

We introduce the NetHeal AI Agent Benchmark, an evaluation environment focused on network troubleshooting. The NetHeal green agent generates randomly initialized simulated networks with known faults, and purple agents must use the tools made available by the environment to gather information about the network, reason, and identify the fault. Purple agents receive rewards based on the correctness of their diagnosis and the efficiency of the solutions at the end of each episode and the aggregated reward across N runs will determine the final score of the purple agent.

3rd Place

AgentHard (https://github.com/jibf/green-agent-template)

Reliable evaluation of large language model (LLM) agents depends critically on benchmark validity. However, agent benchmarks are increasingly complex and often contain hidden flaws arising from interactions among user instructions, environments, tools, ground-truth trajectories, and evaluation protocols. These issues confound model errors with benchmark artifacts, undermining leaderboard-based comparisons. We propose the COBA (Component-based Benchmark Auditing) pipeline, an automated pipeline for diagnosing and filtering validity issues in agent benchmarks. Our pipeline decomposes agent tasks into four standardized components—User, Environment, Ground Truth, and Evaluation—and operationalizes a component-level issue taxonomy using hybrid rule-based detectors and taxonomy-guided LLM evaluation, augmented with an adversarial rebuttal stage to reduce false positives. We apply COBA to four widely used agent benchmarks, achieving F1 scores between 0.791 to 0.842 aligned with expert judgments. COBA outputs an issue-cleaned benchmark suite, released as our AgentBeats green-agent submission, and provides practical tools for improving the reliability and interpretability of LLM agent evaluation.

Web Agent:

1st (Tie)

MateFin (https://github.com/yonghongzhang-io/green-comtrade-bench-v2)

This Green agent defines a deterministic, fully offline benchmark for evaluating agents that retrieve and normalize Comtrade-style trade records under realistic failure conditions. It includes a configurable mock API with fault injection such as pagination, duplicates, rate limits (HTTP 429), server errors (HTTP 500), page drift, and totals traps. A strict file-based evaluation contract and judge score outputs for correctness, completeness, robustness, efficiency, data quality, and observability. The benchmark is reproducible end to end and provides standard A2A-compatible endpoints for automated assessment.

1st (Tie)

Webshop Plus (https://github.com/mpnikhil/webshop-plus)

WebShop+ is a stateful shopping benchmark that extends Princeton's WebShop environment to evaluate AI agents on realistic e-commerce behaviors beyond simple search. It assesses agents across five complex dimensions: Budget Management (optimizing spend across multiple items), Preference Memory (maintaining consistency across sessions), Negative Constraints (avoiding forbidden attributes like allergens), Comparative Reasoning (justifying choices between options), and Error Recovery (rectifying cart mistakes). The green agent challenges competitors with diverse tasks requiring long-horizon planning and decision-making skills akin to a competent human shopper.

3rd Place

MetaJudgeX (https://github.com/gmsh/agentified-opencaptchaworld)

The Agentified OpenCaptchaWorld Benchmark evaluates AI agents on their ability to solve interactive visual CAPTCHA puzzles, a challenging task that requires both visual understanding and precise interaction. The green agent serves 463 CAPTCHA puzzles across 20 types, including counting dice, clicking geometric shapes, rotating objects to match references, solving slide puzzles, matching images, navigating paths, and performing timed interactions. Each puzzle is presented via a web interface, and the agent must analyze the visual content, determine the correct answer, and submit it in the appropriate format. This benchmark tests capabilities essential for web agents: visual reasoning, spatial understanding, and accurate interaction with dynamic UI elements. We identified several quality issues and flaws in the original OpenCaptchaWorld benchmark, which significantly impacted the performance metrics computation. Therefore, we systematically validated all 463 puzzles and extended the original benchmark through two major contributions: refined multiple ground-truth label annotations, and introduced two time-based performance metrics which provide additional insight on agents' efficiency and latency on task completion.

Sierra (τ²-Bench):

Learn more about the τ²-Bench Challenge

https://drive.google.com/file/d/1dYwYLl-BM88pu8egFzyGf6JA5onBlYOl/view?usp=drive\_link

Deadline: March 30, 2026

3rd Sprint (4/13 – 5/3) \[Tentative\]:

Agent Safety:

1st Place

Pi-Bench (https://github.com/Jyoti-Ranjan-Das845/pi-bench)

π-bench evaluates AI agents on policy compliance across 9 diagnostic dimensions: Compliance — Following explicit policy rules correctly; Understanding — Acting on policies requiring interpretation and inference; Robustness — Maintaining compliance under adversarial pressure; Process — Following ordering constraints and escalation procedures; Restraint — Avoiding over-refusing permitted actions; Conflict Resolution — Handling contradicting rules and hierarchical precedence; Detection — Identifying policy violations in observed traces; Explainability — Justifying policy decisions with evidence; Adaptation — Recognizing condition-triggered policy changes. The benchmark spans 7 policy surfaces (Access, Privacy, Disclosure, Process, Safety, Governance, Ambiguity) across domains including retail, healthcare, finance, and HR. Scoring is deterministic — no LLM judges.

2nd Place

NAAMSE (https://github.com/HASHIRU-AI/NAAMSE)

The green agent evaluates the security robustness of target LLM agents against adversarial attacks while ensuring benign requests remain functional. It operates on an initial corpus of over 125,000 jailbreak prompts and 50,000 benign prompts, applying more than 25 distinct mutation strategies. Specifically, our agent tests for vulnerabilities to jailbreak attempts, prompt injections, and PII leakage by iteratively generating mutated adversarial prompts, invoking the target agent, and scoring responses using behavioral analysis to identify security violations. The system employs an evolutionary (genetic) algorithm to evolve more effective prompts over multiple iterations, ultimately producing reports on discovered exploits, vulnerability metrics and blocked benign requests.

3rd Place

AVER (https://github.com/weelzo/aver-green-agent)

AVER is the first benchmark measuring AI agents' error detection and recovery capabilities. With 47 tasks across 5 error categories, it evaluates whether agents can notice mistakes, understand why they occurred, and fix them. Testing reveals current models score 0% on explicit error detection—they recover through trial-and-error without truly detecting errors. AVER addresses the key blocker for production deployment: agent reliability.

Coding Agent & Software Testing Agent:

1st Place (Software Testing Agent)

LogoMesh (https://github.com/joshhickson/LogoMesh/tree/master)

LogoMesh is a multi-agent benchmark that evaluates AI coding agents across four orthogonal dimensions: Rationale Integrity (does the agent understand the task?), Architectural Integrity (is the code secure and well-structured?), Testing Integrity (do tests actually validate correctness?), and Logic Score (does the code work correctly?). Unlike static benchmarks, LogoMesh uses an adversarial Red Agent with Monte Carlo Tree Search to discover vulnerabilities, a Docker sandbox for ground-truth test execution, a self-improving strategy evolution system (UCB1 multi-armed bandit) that adapts evaluation rigor based on past performance, intent-code mismatch detection that catches when an AI returns completely wrong code, and Battle Memory that learns from past evaluations to improve future scoring. The benchmark covers 20 tasks from basic data structures to distributed systems (Raft consensus, MVCC transactions, blockchain), and dynamically generates evaluation criteria for novel tasks via LLM-powered Task Intelligence.

2nd Place (Software Testing Agent)

AgentSWE (https://github.com/zaidishahbaz/green-agent)

The green agent agentifies SWE-Bench Verified benchmark and evaluates software engineering test agents. SWE-Bench Verified is a curated subset of the SWE-bench benchmark where each task has been manually validated to ensure the issue, test suite, and reference fix are correct and reproducible. Our key contribution is in enabling the purple agent to explore the task repository and apply fixes, mirroring a human developer workflow. The setup emphasizes a clean separation of concerns and supports three interactive modes for the purple agent: bash, debug, and patch, and doesn't require any custom tool-use capabilities. The green agent enforces the Principle of Least Privilege across the 3 modes to ensure safe execution and state maintenance. In addition to Resolved Rate at pass@1 and pass@k as in the original benchmark, we introduce a new evaluation signal: the total number of tokens requested by the purple agent, providing insight into efficiency and resource usage alongside task performance.

1st Place (Coding Agent)

NetArena (https://github.com/Froot-NetSys/NetPress/tree/a2a-agentx)

Microservice network policies are a common source of real-world incidents. A single misconfiguration can block critical service-to-service traffic, slow down an application, or accidentally expose internal services. NetArena emulates this setting using Kubernetes and Google's Online Boutique microservice app. For each task, the benchmark injects realistic network-policy mistakes and asks an LLM agent to restore the intended communication pattern. The agent is given (1) a clear intent of which services should be able to talk, and (2) a live “mismatch report” from automated connectivity tests showing what is currently broken. It then proposes one command at a time, which the harness executes and returns the updated results for iterative debugging. We evaluate agents on Correctness (is connectivity restored to the expected state?), Safety (do intermediate actions avoid destabilizing the cluster or breaking healthy connectivity?), and Latency (how many iterations to resolution). NetArena's green agent is novel in two ways. (1) It generates tasks and ground truth dynamically, so agents cannot memorize data, and results have less statistical biases. (2) It evaluates what real systems care about, especially agent safety, revealing when an agent output looks reasonable but still violates safety constraints and creates operational risks.

2nd Place (Coding Agent)

text-2-sql-agent (https://github.com/ashcastelinocs124/text-2-sql-agent)

Text-2-SQL Agent is a Green Agent that evaluates AI agents' ability to generate correct, efficient, and safe SQL queries from natural language questions. The Green Agent sends 27+ SQL generation tasks across 4 difficulty levels to competing Purple Agents: Easy (basic SELECT, WHERE filters, COUNT, LIMIT), Medium (multi-table JOINs, subqueries, GROUP BY, CASE expressions), Hard (window functions, CTEs, ranking queries), and Enterprise (star schema analysis, user sessionization, cohort retention, slowly changing dimensions). Each generated SQL query is scored across 7 dimensions: Correctness (35%), Safety (20% — no hallucinated tables/columns/functions), Efficiency (15%), Completeness (10%), Semantic Accuracy (10%), Best Practices (5%), and Plan Quality (5%). Key differentiators include pre-execution hallucination detection using AST parsing, error taxonomy classifying failures into schema/analysis/SQL errors, and multi-dialect support (SQLite, DuckDB, PostgreSQL, BigQuery).

3rd Place (Coding Agent)

PetscAgent-Bench (https://github.com/caidao22/petscagent-bench)

The Green Agent evaluates generated PETSc code across six weighted dimensions: Correctness, Performance, Algorithm Quality, Code Quality, PETSc Best Practices and Parallel Readiness. It employs a hybrid evaluation approach combining deterministic checks with LLM-based assessments. Each submission receives a composite score (0-100).

Cybersecurity Agent:

1st Place

AgentSlug (RCA-Bench) (https://github.com/JianhongTu/RCAbench/tree/simplify-mini-swe-agent-setup)

The RCA-Bench green agent evaluates an agent's ability to perform root-cause analysis of security vulnerabilities in real-world codebases. It leverages the ARVO dataset to retrieve programs with known bugs discovered through fuzzing. For each task, the green agent prepares a realistic debugging scenario and provides the corresponding codebase to the purple agent. The purple agent is then evaluated on its ability to identify the root cause of the vulnerability by localizing the relevant files and lines of code. This benchmark tests an agent's capacity to reason over large codebases and accurately pinpoint the source of security-critical bugs.

2nd Place

Chai GPT (https://github.com/unicodemonk/Cyber-Security-Evaluator)

The Cyber Security Evaluator is a Green Agent that identifies and evaluates specific MITRE ATT\&CK techniques to benchmark “Purple Agent” security detectors. It employs an adaptive 7-agent ecosystem—including Thompson Sampling for testing strategy and Novelty Search for evasion discovery—to generate evolving attack campaigns. Focusing on techniques like SQL Injection and Prompt Injection (LLM Jailbreaks), evaluations are conducted within a secure Docker sandbox. The agent provides distinct MITRE coverage mapping and performance metrics, helping developers validate their agents against recognized adversary behaviors and real-world threats.

Healthcare Agent:

1st Place

ICU-Later (https://github.com/abasit/FhirAgentEvaluator)

FHIR Agent Evaluator is a benchmark for evaluating medical LLM agents on realistic clinical tasks using FHIR (Fast Healthcare Interoperability Resources) data from MIMIC-IV-FHIR. It follows the Agent-to-Agent (A2A) protocol and evaluates agents operating in tool-augmented EHR environments. The benchmark combines and extends tasks from existing medical agent benchmarks and introduces novel evaluations: Retrieval tasks (1,335 tasks) from FHIR-AgentBench, covering patient record querying, temporal reasoning, and multi-step information gathering across FHIR resources; Retrieval+Action tasks (156 tasks) adapted from MedAgentBench, including vitals recording, medication ordering with dosing protocols, referral ordering with SBAR documentation, and conditional laboratory ordering; Drug interaction tasks (30 tasks) introducing medication conflict detection using FDA drug label data. Agents interact with the environment via tools for FHIR GET/POST requests, medical code lookup, Python code execution, and FDA drug label access. Agents are evaluated using answer correctness (overall task correctness combining response and action validation), action correctness (FHIR POST validation), and F1 score (harmonic mean of retrieval precision and recall).

2nd Place

BitBreakers (https://github.com/saleh-SHA/Agentify-MedAgentBench)

The green agent evaluates whether a medical AI (purple agent) can correctly perform FHIR-based clinical reasoning tasks. These tasks fall into three categories: Query tasks: Retrieve and compute patient information from the FHIR server, such as identifying patients, calculating age, and extracting recent or averaged lab values. Write tasks: Create valid FHIR resources, including vital sign observations and consultation or lab service requests, with correct clinical structure and content. Conditional (protocol-driven) tasks: Apply clinical decision logic based on patient data (e.g., electrolyte levels or test recency) and, when criteria are met, generate appropriate medication orders or lab requests according to predefined medical protocols. Overall, the green agent checks data retrieval accuracy, clinical calculations, correct use of FHIR APIs, and adherence to clinical protocols, validating each task with task-specific grading logic.

3rd Place

MadGAA Lab (https://github.com/MadGAA-Lab/OSCE-Project)

The green agent evaluates doctor agents' medical communication skills through simulated patient interactions. It assesses empathy, persuasion, and safety across 30 criteria while managing dialogues with patients exhibiting diverse MBTI personality types. The system generates comprehensive performance reports with scores and improvement recommendations.

Mark your calendars for the track(s) that excite you most—we'll release the official benchmarks and green agents for each track as their sprint approaches. Keep an eye on our announcements, as we may introduce additional tracks throughout the competition based on community interest and emerging opportunities.

Custom Tracks

\[λ\] Lambda

Agent Security

A red-teaming and automated security testing challenge.

https://docs.google.com/document/d/1LH5I6DcsEy6umcziouCrKN90aEUhpUoKUT0hlfdaqts/

Phase 1 Deadline: Jan 31, 2026

Meta & Hugging Face

The OpenEnv Challenge

SOTA Environments to drive general intelligence.

https://drive.google.com/file/d/1NASall4R84xAhoDdcaMwwJ78Ao3B-EK4/view?usp=drive\_link

Deadline: March 30, 2026