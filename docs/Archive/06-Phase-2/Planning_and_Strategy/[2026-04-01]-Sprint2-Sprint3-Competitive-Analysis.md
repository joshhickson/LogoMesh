---
status: SUPERSEDED
type: Research
---
> **Context:**
> *   [2026-04-01]: First-pass competitive analysis of all 28 Sprint 2 + Sprint 3 Green Agent repos (1 repo unavailable). Goal: identify emergent scoring patterns to inform generalized Purple Agent strategy for Sprint 3 (Apr 13 – May 3).
> **Superseded By:** [Phase 2 Competitive Analysis - Corrected Roster]([2026-04-03]-Phase2-Corrected-Competitive-Analysis.md)

# Sprint 2 + Sprint 3 Green Agent Competitive Analysis — First Pass

## 1. Overview

This document synthesizes findings from a simultaneous README + scoring-mechanism scan of **28 out of 29** Green Agent repos across AgentBeats Phase 2 Sprints 1–3. One repo (Chai GPT / `unicodemonk/Cyber-Security-Evaluator`) was inaccessible (404 on all branches). Findings are organized from emergent cross-repo patterns down to track-specific analysis and a prioritized action recommendation.

**Primary question:** Which Sprint 3 track gives LogoMesh the best entry point for a generalized Purple Agent, and what universal scoring patterns can be exploited across tracks?

---

## 2. Universal Cross-Repo Patterns

These patterns appear in 80%+ of repos and define the structural landscape of the competition.

### P1 — A2A Protocol is 100% Consistent
Every repo uses the A2A (Agent-to-Agent) JSON-RPC protocol. Green sends `message/send` to Purple; Purple returns structured output. The `/.well-known/agent-card.json` endpoint is standard for platform registration. **Implication:** A single robust A2A wrapper on LogoMesh's Purple Agent is sufficient for all tracks — no custom protocol work needed per track.

### P2 — `uv` + AgentBeats SDK is the Standard Stack
Nearly every repo uses:
- `uv sync` for dependency management
- `uv run agentbeats-run scenarios/xxx/scenario.toml` as the runner
- Docker on port 9009 for the Green Agent (exact match to LogoMesh's existing port convention)

**Implication:** The competition has standardized around a common SDK. LogoMesh already conforms to this stack.

### P3 — Scoring Architecture Falls Into 4 Types

| Type | Pattern | Representative Repos |
|:-----|:--------|:--------------------|
| **I — Pure Deterministic** | No LLM in scoring loop; ground-truth checks only | Pi-Bench, RCAbench, MateFin |
| **II — Deterministic Gates + LLM Quality** | Binary pass/fail gates first; LLM scores the remainder | PetscAgent, text-2-sql, AgentSWE, MIDS4LIFE |
| **III — Multi-Dimensional Weighted** | 3–7 explicitly weighted scoring axes, mix of LLM + deterministic | AVER, Reviewer Two, NetArena, ICU-Later, TraderBench |
| **IV — Game-Theoretic / Emergent** | Nash equilibrium, Elo, or LLM judge as primary signal | MAizeBargAIn, SocialCOMPACT, MadGAA Lab, Werewolf |

**Implication:** Type I is most predictable (optimize against a known formula). Type IV has highest variance — LLM judge manipulation is possible but unreliable.

### P4 — Anti-Gaming Gates Appear in ~40% of Repos
- **MateFin:** 3 explicit gates — incomplete output = zero efficiency credit; correctness < 70% = capped scores
- **text-2-sql:** AST hallucination detection _before_ SQL execution; phantom tables/columns caught pre-run
- **TraderBench (AgentBusters):** Hidden Windows strategy + private seeds + anonymized scenario IDs
- **AgentHard:** Pre-filtered invalid test cases from 3 benchmarks (4,567 / 4,706 valid BFCL tasks remain)

**Implication:** A Purple Agent that produces syntactically correct, schema-valid outputs will clear gate stages automatically. Sloppy output formatting is penalized multiplicatively, not additively.

### P5 — "Reasoning Quality" Universally Boosts Score
Every repo with an LLM quality layer rewards structured, well-explained outputs:
- Reviewer Two: 20% of score is length + format quality (400–1,500 words optimal)
- MIDS4LIFE: `methodology_score` rewards documentation of process
- MCU: 6 video-analysis dimensions include "error recognition" and "creative attempts"
- LogoMesh's own Rationale component (R) mirrors this pattern

**Implication:** A Purple Agent that generates verbose, well-structured chain-of-thought explanations alongside its primary outputs will score higher across all Type II/III benchmarks.

### P6 — Token / Iteration Efficiency is an Emerging Secondary Metric
- **AgentSWE:** Explicitly tracks total token consumption alongside resolution rate
- **CAR-bench:** Pass^k (reliability across k runs) complements Pass@k (capability)
- **NetArena:** Latency = iterations to resolution (fewer = better)
- **MateFin:** Execution time > 45 seconds incurs penalty

**Implication:** A Purple Agent that solves tasks in fewer steps/tokens will score higher than one that reaches the same answer through excessive tool-calling or iteration. Plan for efficiency as a first-class optimization target.

### P7 — False Positive Rate Matters in Safety-Adjacent Tracks
- **AVER:** 7 negative control tasks explicitly measure false positive rate
- **NAAMSE:** Benign prompts must remain functional (over-refusal penalized)
- **Pi-Bench:** `AMBIGUOUS_POLICY` / `AMBIGUOUS_STATE` states are valid outputs — forcing binary when policy is unclear is penalized

**Implication:** A Purple Agent must distinguish between cases requiring caution and cases requiring confident action. Blanket conservatism is penalized.

---

## 3. Sprint 3 Track Analysis

Sprint 3 runs April 13 – May 3, 2026. Tracks: **Agent Safety**, **Coding Agent**, **Cybersecurity Agent**, **Healthcare Agent**.

### 3.1 Cybersecurity Agent Track

| Repo | Place | Scoring Type | Output Format | Domain Barrier |
|:-----|:------|:-------------|:--------------|:--------------|
| RCAbench (AgentSlug) | 1st | Type I (Deterministic IoU) | `{file_path, function_name, line_numbers}` | Medium |
| Chai GPT | 2nd | Unknown (repo unavailable) | Unknown | Unknown |

**RCAbench Deep Dive:**
- Purple agent receives: vulnerable codebase + fuzzer crash report (from ARVO dataset)
- Purple agent must output: localization of root cause → exact file, function, line numbers
- Scoring: IoU at file-level, function-level, and line-level granularities; deterministic against ground-truth git diffs
- Infrastructure: Docker containers with vulnerable codebases; patch validation via Docker or Kubernetes
- Key constraint: This is ROOT CAUSE ANALYSIS, not code generation — the Purple Agent is a detective, not a writer

**LogoMesh alignment:** HIGH. LogoMesh's Red Agent already reasons about vulnerabilities using MCTS. That reasoning architecture (semantic analysis → constraint violation detection → vulnerability localization) is directly transferable. The output format is clean and deterministic — no LLM variance in scoring.

**Key gap:** LogoMesh's MCTS currently reasons over code to find vulnerabilities; RCAbench requires outputting a precise structured localization (`file: src/foo.c, function: parse_header, lines: 47-52`). The reasoning is the same; the output adapter needs to be built.

### 3.2 Agent Safety Track

| Repo | Place | Scoring Type | Output Format | Domain Barrier |
|:-----|:------|:-------------|:--------------|:--------------|
| Pi-Bench (PolicyBeats) | 1st | Type I (Pure Deterministic) | Execution traces with tool calls | High (policy compliance) |
| NAAMSE | 2nd | Type II (Adversarial robustness) | Pass/fail on 125k+ adversarial prompts | Medium |
| AVER | 3rd | Type III (3-axis weighted) | Code output + reasoning trace | Medium-Low |

**Pi-Bench:** Deterministic trace analysis. 9 dimensions: Compliance, Understanding, Robustness, Process, Restraint, Conflict Resolution, Detection, Explainability, Adaptation. Scoring is provably reproducible — no LLM judges. Purple agent must follow operational policies correctly through tool execution. Very different from code generation. **LogoMesh alignment: LOW** — requires policy-following behavior not present in current architecture.

**NAAMSE:** Tests whether a purple agent resists 125k+ adversarial prompts while remaining functional for benign requests. This evaluates the Purple Agent's robustness, not its domain skills. **LogoMesh alignment: MEDIUM** — LogoMesh's existing Red Agent adversarial reasoning is relevant, but the direction is inverted (we're now the defender).

**AVER:** 47 tasks across 5 error categories (hallucination, validation, tool misuse, context loss, adversarial). Scoring = Detection 40% + Diagnosis 20% + Recovery 40%. Two validation pillars: deterministic test execution + meta-cognitive trace analysis. **LogoMesh alignment: MEDIUM-HIGH** — LogoMesh's refinement loop (iterative feedback + re-evaluation) directly maps to AVER's "Recovery" dimension (40% of score). The error detection and diagnosis require new capability but are generalizable.

### 3.3 Coding Agent Track

| Repo | Place | Scoring Type | Output Format | Domain Barrier |
|:-----|:------|:-------------|:--------------|:--------------|
| NetArena | 1st | Type III (Correctness + Safety + Latency) | K8s/Mininet commands | HIGH (infrastructure) |
| text-2-sql | 2nd | Type II (7-dimensional weighted) | SQL queries | Low-Medium |
| PetscAgent | 3rd | Type II (Gates + LLM quality) | Compiled PETSc code | HIGH (scientific HPC) |

**NetArena:** Dynamic K8s network policy debugging. Tasks are generated dynamically (no memorization advantage). Green agent injects realistic network faults; Purple agent iteratively proposes fixes. **Infrastructure barrier is the primary blocker** — requires running containers with Kubernetes access (or Mininet for routing tasks). Published at ICLR 2026. Despite the barrier, the scoring (Correctness + Safety + Latency) is highly aligned with LogoMesh's design philosophy.

**text-2-sql:** 27+ SQL tasks at 4 difficulty levels. Scoring: Correctness 35% + Safety 20% (no phantom tables) + Efficiency 15% + Completeness 10% + Semantic Accuracy 10% + Best Practices 5% + Plan Quality 5%. AST-based hallucination detection gates the pipeline. **LogoMesh alignment: HIGH** — LogoMesh's existing AST static analysis background maps directly to the safety/hallucination detection axis. SQL is structured and well-specified. Low infrastructure barrier.

**PetscAgent:** Scientific HPC code generation using PETSc library. Requires `PETSC_DIR`/`PETSC_ARCH` environment configuration. Domain knowledge barrier is very high. GOLD/SILVER/BRONZE/FAIL tier scoring. **LogoMesh alignment: LOW** — too specialized.

### 3.4 Software Testing Track (LogoMesh's Home Track)

| Repo | Place | Scoring Type | Output Format | Domain Barrier |
|:-----|:------|:-------------|:--------------|:--------------|
| LogoMesh | 1st | Type II (CIS = R+A+T+L × penalties) | sourceCode + testCode + rationale | N/A (we built it) |
| AgentSWE | 2nd | Type II (Resolution rate + token efficiency) | git diffs via bash/debug/patch modes | Low |

**AgentSWE:** SWE-bench Verified. Purple agent explores real GitHub repos using bash (read-only), debug (test hypotheses), and patch (submit git diff) modes. Scoring = fail-to-pass resolution rate + token efficiency. Defense-in-depth with filesystem path boundaries. **LogoMesh alignment: VERY HIGH** — this is the most directly adjacent track to LogoMesh's existing capabilities.

### 3.5 Healthcare Track — Low Priority Assessment

| Repo | Tasks | Domain Barrier |
|:-----|:------|:--------------|
| ICU-Later (FHIR) | 1,521 | VERY HIGH (FHIR R4, MIMIC-IV, clinical protocols) |
| BitBreakers (MedAgentBench) | 300+ | VERY HIGH (FHIR APIs, drug protocols) |
| MadGAA Lab (OSCE-Project) | 30 criteria | HIGH (medical dialogue, empathy) |

**Verdict:** Healthcare track requires deep FHIR/clinical knowledge that LogoMesh has no existing advantage in. Recommend deferring until after Sprint 3 core tracks are addressed.

---

## 4. Sprint 2 Reference Patterns

Sprint 2 (3/23–4/12) is live now. These tracks are not LogoMesh's primary target but reveal useful emergent patterns.

| Track | Key Insight |
|:------|:-----------|
| **Research Agent (MIDS4LIFE)** | Process score formula: `(0.7 × (methodology + adherence) / 2 + tasks_passed) / total × 100` — rewards process quality as much as raw results |
| **Research Agent (Reviewer Two)** | 60% rubric coverage + 20% length (400–1,500 words) + 20% format — pure LLM judge with progressive rubric disclosure |
| **Multi-Agent (MAizeBargAIn)** | Nash equilibrium (MENE) scoring — requires game-theoretic reasoning, not coding skills |
| **Multi-Agent (SocialCOMPACT)** | Elo + Prediction Accuracy + Transparency — measures Theory of Mind, not coding |
| **Computer Use (CAR-bench)** | Pass^k reliability metric alongside Pass@k capability — consistency across runs rewarded separately from peak performance |
| **Computer Use (NetHeal)** | RL-style sparse reward for network fault diagnosis — similar to RCAbench's localization task |
| **Web Agent (MateFin)** | Strongest anti-gaming design — 3 explicit gate conditions with cascading penalties. Baseline purple agent achieves 85–95% using deterministic HTTP logic, no LLM required |
| **Web Agent (AgentHard)** | Multi-benchmark function calling (BFCL / ComplexFuncBench / Tau2) with pre-filtered test quality |

**Key Sprint 2 insight:** MateFin demonstrates that **a fully deterministic, LLM-free purple agent can score 85–95%** on a Type I benchmark. This validates the strategy of building task-specific, rule-based sub-agents for structured output benchmarks.

---

## 5. Track Priority Ranking for LogoMesh Sprint 3

Ranked by: LogoMesh architectural alignment × scoring predictability × domain barrier inverse.

| Priority | Track | Repo | Rationale |
|:---------|:------|:-----|:----------|
| **1 — Highest** | Cybersecurity | RCAbench | Deterministic IoU scoring; MCTS vulnerability reasoning directly applicable; clear output format |
| **2 — Very High** | Software Testing | AgentSWE | Home track adjacency; bash/patch modes match LogoMesh architecture; token efficiency = new axis to optimize |
| **3 — High** | Coding Agent | text-2-sql | Low infrastructure barrier; 7 clear scoring dimensions; AST analysis background reusable |
| **4 — Medium-High** | Agent Safety | AVER | Refinement loop maps to Recovery (40%); generalizable across error types; 47 well-specified tasks |
| **5 — Medium** | Agent Safety | Pi-Bench | Fully deterministic = predictable, but policy compliance is orthogonal to coding skill |
| **6 — Medium-Low** | Coding Agent | NetArena | Best scoring alignment but K8s infrastructure barrier is high; worth revisiting if cluster access obtained |
| **7 — Low** | Healthcare | All | Too domain-specific; defer |

---

## 6. Generalization Strategy Recommendations

Based on cross-repo pattern analysis:

### R1 — Build a Universal Output Adapter, Not Track-Specific Agents
The A2A protocol is consistent. What varies is the **output schema**. LogoMesh should build a Purple Agent with a routing layer that detects task type and generates the appropriate output structure:
- Code generation tasks → `{sourceCode, testCode, rationale}`
- Vulnerability localization tasks → `{file_path, function_name, line_numbers, explanation}`
- SQL tasks → `{sql_query, explanation, schema_validation}`
- Policy trace tasks → `{action_trace, policy_citations, compliance_verdict}`

### R2 — Prioritize Deterministic-Scoring Tracks First
Type I and Type II tracks (RCAbench, text-2-sql, AgentSWE) have predictable scoring functions. Build and validate the Purple Agent against these before attacking Type IV (game-theoretic) tracks where variance is high and optimization is harder.

### R3 — Verbose Reasoning Is Universally Additive
Across 20+ repos, producing structured chain-of-thought with the output (even when not explicitly required) correlates with higher LLM quality scores. This is a zero-cost optimization — add reasoning to every output.

### R4 — Anti-Gaming Pattern: Schema-First Output Generation
Repos with AST/schema validation gates (text-2-sql, RCAbench, MateFin) penalize outputs that violate the schema before any quality scoring occurs. Build schema validation into the Purple Agent's output generation step — validate output structure before submission.

### R5 — Token Efficiency = Competitive Differentiator in Sprint 3
AgentSWE and NetArena both penalize excessive iterations. A Purple Agent that resolves tasks in 2–3 steps will outcompete one that requires 8–10. Design for minimal round-trips.

---

## 7. Data Gaps and Next Steps

### Missing Data
- **Chai GPT (unicodemonk/Cyber-Security-Evaluator):** Repository returned 404 on all branches. Cannot assess 2nd-place Cybersecurity track competitor. Recommend manual check — may be private or renamed.
- **Scoring source files:** This pass covered READMEs only. Next pass should read actual `scorer.py` / `evaluator.py` files for RCAbench, text-2-sql, and AVER to extract exact scoring formulas.

### Recommended Next Passes (Sequential)
1. **Pass 2 — Scoring source code:** Read `scorer.py` / `evaluator.py` for top-priority repos (RCAbench, text-2-sql, AVER, AgentSWE). Extract exact formulas, weights, and edge cases.
2. **Pass 3 — Purple Agent baseline testing:** Stand up a minimal Purple Agent against RCAbench and text-2-sql locally. Establish baseline scores before optimization.
3. **Pass 4 — NetArena infrastructure assessment:** Determine if K8s access is feasible via LogoMesh's existing Docker infrastructure (KinD cluster may suffice).
4. **Pass 5 — Chai GPT recovery:** Locate the Chai GPT repo through AgentBeats Discord or competition organizers.

---

## 8. Repo Inventory

| Sprint | Track | Repo | GitHub | Status |
|:-------|:------|:-----|:-------|:-------|
| S3 | Cybersecurity | RCAbench | JianhongTu/RCAbench (branch: simplify-mini-swe-agent-setup) | ✅ Analyzed |
| S3 | Cybersecurity | Chai GPT | unicodemonk/Cyber-Security-Evaluator | ❌ 404 |
| S3 | Agent Safety | Pi-Bench (PolicyBeats) | Jyoti-Ranjan-Das845/pi-bench | ✅ Analyzed |
| S3 | Agent Safety | NAAMSE | HASHIRU-AI/NAAMSE | ✅ Analyzed |
| S3 | Agent Safety | AVER | weelzo/aver-green-agent | ✅ Analyzed |
| S3 | Coding Agent | NetArena | Froot-NetSys/NetPress (branch: a2a-agentx) | ✅ Analyzed |
| S3 | Coding Agent | text-2-sql | ashcastelinocs124/text-2-sql-agent | ✅ Analyzed |
| S3 | Coding Agent | PetscAgent | caidao22/petscagent-bench | ✅ Analyzed |
| S3 | Software Testing | AgentSWE | zaidishahbaz/green-agent | ✅ Analyzed |
| S3 | Healthcare | ICU-Later | abasit/FhirAgentEvaluator | ✅ Analyzed |
| S3 | Healthcare | BitBreakers | saleh-SHA/Agentify-MedAgentBench | ✅ Analyzed |
| S3 | Healthcare | MadGAA Lab | MadGAA-Lab/OSCE-Project | ✅ Analyzed |
| S2 | Research | HEP-ExpAgents | hrzhao76/hepex-analysisops-benchmark | ✅ Analyzed |
| S2 | Research | MIDS4LIFE | ab-shetty/agentbeats-corebench | ✅ Analyzed |
| S2 | Research | Reviewer Two | chrisvoncsefalvay/reviewer-two-env | ✅ Analyzed |
| S2 | Multi-Agent | MAizeBargAIn | gsmithline/tutorial-agent-beats-comp | ✅ Analyzed |
| S2 | Multi-Agent | FieldWorkArena | ast-fri/FieldWorkArena-GreenAgent | ✅ Analyzed |
| S2 | Multi-Agent | SocialCOMPACT | ReserveJudgement/SocialCOMPACT | ✅ Analyzed |
| S2 | Computer Use | CAR-bench | CAR-bench/car-bench-agentbeats | ✅ Analyzed |
| S2 | Computer Use | NetHeal | cisco-ai-platform/netheal-ai-agent-benchmark | ✅ Analyzed |
| S2 | Computer Use | AgentHard | jibf/green-agent-template | ✅ Analyzed |
| S2 | Web Agent | MateFin | yonghongzhang-io/green-comtrade-bench-v2 | ✅ Analyzed |
| S2 | Web Agent | Webshop Plus | mpnikhil/webshop-plus | ✅ Analyzed |
| S2 | Web Agent | MetaJudgeX | gmsh/agentified-opencaptchaworld | ✅ Analyzed |
| S1 | Game Agent | MCU-AgentBeats | KWSMooBang/MCU-AgentBeats | ✅ Analyzed |
| S1 | Game Agent | Build What I Mean | ltl-uva/build_what_i_mean | ✅ Analyzed |
| S1 | Game Agent | Werewolf | SadidRomero77/Werewolf-AgentX-AgentBets | ✅ Analyzed |
| S1 | Finance | OfficeQA | arnavsinghvi11/officeqa_agentbeats | ✅ Analyzed |
| S1 | Finance | AgentBusters | yxc20089/AgentBusters | ✅ Analyzed |

**Coverage: 28/29 repos (96.6%)**
