> **Status:** ACTIVE
> **Type:** Research
> **Context:**
> *   [2026-04-02]: Sprint 2 scoring source code analysis. Six repos evaluated (Medium–High LogoMesh fit): MateFin, CAR-bench, NetHeal, MIDS4LIFE, Reviewer Two, Webshop Plus. Sprint 2 is the next active window after Sprint 1 ends April 12, 2026. Analogous to the Sprint 3 Pass 2 deep-dive.
> **See Also:**
> *   [Passes 1+2 Briefing (Sprint 3)]([2026-04-01]-Competitive-Analysis-Briefing.md)
> *   [Sprint 3 Task Input Formats]([2026-04-01]-Sprint3-Task-Input-Formats.md)

# Sprint 2 — Scoring Source Code Deep-Dive

## Sprint 2 Track Lineup

Sprint 2 begins after April 12, 2026 (when Sprint 1 ends). Four tracks:

| Track | Repos analyzed |
|:------|:--------------|
| Research Agent | HEP-ExpAgents, MIDS4LIFE, Reviewer Two |
| Multi-Agent Evaluation | MAizeBargAIn, fieldworkarena, SocialCOMPACT |
| Computer Use Agent | CAR-bench, NetHeal, AgentHard |
| Web Agent | MateFin, Webshop Plus, MetaJudgeX |

This document covers the 6 repos with Medium–High fit for LogoMesh (text-based, deterministic-primary, no vision required).

---

## Priority Ranking for Sprint 2

| Priority | Repo | Track | Scoring type | Rationale |
|:---------|:-----|:------|:-------------|:----------|
| 1 | **MateFin** | Web Agent | Type I — fully deterministic | 6 clear axes, offline, well-gated; highest predictability |
| 2 | **NetHeal** | Computer Use | Type I — deterministic diagnosis | Binary cliff but structured rewards; analogous to RCAbench |
| 3 | **CAR-bench** | Computer Use | Type II — deterministic + LLM user | All-or-nothing per task but task types map cleanly to LogoMesh capabilities |
| 4 | **MIDS4LIFE** | Research Agent | Type II — deterministic + LLM judge | Hard mode requires independent discovery; LLM judge is gpt-5-mini |
| 5 | **Webshop Plus** | Web Agent | Type III — multi-dimensional, mixed LLM | 5 distinct task types; complex state management required |
| 6 | **Reviewer Two** | Research Agent | Type III — LLM-primary | 60% score from hidden rubric LLM judge; highest uncertainty |

---

## 1. MateFin

**Repo:** `github.com/yonghongzhang-io/green-comtrade-bench-v2`
**Source files read:** `src/judge.py`, `scripts/validate_purple_output.py`

### Scoring dimensions

| Dimension | Points | Formula |
|:----------|:-------|:--------|
| Correctness | 30 | Row accuracy (12) + schema validation (4) + query matching (4) + deduplication (6) + declared vs actual (4) |
| Completeness | 15 | `(fields_present / 5) × 15` — requires task_id, query, row_count, schema, dedup_key |
| Robustness | 15 | 429 handling: 12pt baseline, 15pt with exponential backoff; 500 handling: 12pt with retry, 15pt with limits |
| Efficiency | 15 | Request count vs task-specific baseline (12pt) + time penalty if >45s (3pt) |
| Data Quality | 15 | Content validation (5) + type consistency (5) + value range checks (5) |
| Observability | 10 | Required traceable fields (6) + logging levels (2) + stop reason indicator (2) |

**Total: 100 points**

### Gates and cliffs

**Gate 1 — Completeness → Efficiency:**
```python
if completeness_ratio < COMPLETENESS_GATE_FULL:  # Must be 100%
    breakdown["efficiency"] = 0.0
```
Missing any of the 5 required metadata fields zeroes all 15 efficiency points.

**Gate 2 — Correctness → Efficiency + Observability:**
```python
if correctness_ratio < CORRECTNESS_GATE_THRESHOLD:  # < 70%
    breakdown["efficiency"] *= CORRECTNESS_GATE_PENALTY   # → ×0.5 cap
    breakdown["observability"] *= CORRECTNESS_GATE_PENALTY
```
Correctness below 70% halves both efficiency and observability. Net exposure: up to 12.5 points lost from secondary dimensions.

**Anti-gaming mechanisms:**
- Task-specific efficiency baselines (`TASK_EFFICIENCY_BASELINES`: T1=1 request, T7=8 requests) — can't game by minimizing requests on legitimately paginated tasks
- 45s time threshold is binary, not continuous — avoids wall-clock variance exploitation
- Deduplication gradient: `dedup_quality = unique_rows / total_rows` — rewards actual quality not just presence of a dedup key
- Observability checks specific fields (task_id, page, request, complete) — not log line count

### Required output format

Three files:
```
data.jsonl        — main output rows
metadata.json     — {task_id, query, row_count, schema, dedup_key}
run.log           — execution trace with structured logging
```

### Key rules for LogoMesh

1. **Completeness first** — missing any of the 5 metadata fields = efficiency zeroed; always output all 5
2. **Correctness ≥ 70%** before optimizing efficiency/observability; gates fire below this threshold
3. **Implement exponential backoff on 429** — worth 3 free points on robustness vs. naive retry
4. **Include stop reason in log** — 2 free observability points, zero cost
5. **Stay under 45s** — time threshold is binary; no benefit to being faster than 45s beyond that
6. **Dedup key must reflect actual deduplication** — gradient scoring, not binary

---

## 2. NetHeal

**Repo:** `github.com/cisco-ai-platform/netheal-ai-agent-benchmark`
**Source files read:** `netheal/evaluation/metrics.py`, `netheal/environment/rewards.py`

### Reward formula

```
Per-step penalty: −0.1 (every action)

Correct full diagnosis:
  reward = +10.0 × (1.0 + network_size / 10.0)

Partial device match:
  single device: +10.0 × 0.30 × multiplier
  multiple devices: +10.0 × 0.15 × correct_device_count × multiplier

Incorrect diagnosis (no match):
  reward = −10.0 × (1.0 + network_size / 10.0)
```

Net swing between correct and incorrect on a 10-device network: **+20 × 2.0 = 40 points**. Getting diagnosis wrong on a large network is catastrophic — it is better to abstain than guess.

### Competition-level aggregation

```python
weights = [max(1, network_size) for each episode]
weighted_avg = sum(value × weight) / total_weight
```

Larger networks are weighted more heavily. Performance on small 2-node networks matters less than performance on 10-node networks.

### Binary cliff

Diagnosis requires **exact match on both type AND location:**
```python
diagnosis_success = (predicted_type == ground_truth_type) AND
                    (predicted_location == ground_truth_location)
```

No partial credit at the episode level. Partial device credit only applies in specific partial-match cases, not as a general fallback.

**Fault types tracked separately:** 4 fault types with Macro F1 computed per type then averaged. Being good at one fault type doesn't compensate for zero on another.

### Required output format

```python
final_action.category == "diagnosis"
final_action.action_type == <fault_type>  # e.g., "device_failure", "link_failure"
final_action.parameters["location"] == <location>
# Device failures: device name string
# Link failures: "source->destination" (bidirectional, normalized)
```

### Tool cost estimates

| Tool | Cost |
|:-----|:-----|
| ping | 1.0 |
| traceroute | 2.0 |
| (default fallback) | 1.0 |

Efficiency = `(1.0 if success else 0.0) / (1.0 + tool_cost_normalized)`. Only counts toward score if the diagnosis is correct.

### Key rules for LogoMesh

1. **Never guess** — wrong diagnosis on a large network scores −20× worse than not diagnosing; skip if uncertain
2. **Type before location** — diagnosis gate blocks location credit if type is wrong; identify fault category first
3. **Minimize steps** — −0.1 per action; 20 unnecessary steps = −2.0 from base reward
4. **Cover all 4 fault types** — Macro F1 averages across types; zero on one type drags the whole score
5. **Use low-cost tools** — ping (1.0) before traceroute (2.0); efficiency ratio only pays off when correct
6. **Prioritize large network tasks** — network-size-weighted averages make large networks worth more

---

## 3. CAR-bench

**Repo:** `github.com/CAR-bench/car-bench-agentbeats`
**Source files read:** `src/green_car_bench_agent/car_bench_evaluator.py`

### Scoring

**Primary metric: Pass Rate**
```python
pass_rate = (total_reward / num_completed) × 100
```

**Per-task cliff:**
```python
pass = True if reward >= 0.99 else False
```

Tasks below 0.99 reward are **binary failures** regardless of magnitude. There is no partial credit in the summary metric — incremental improvements below 0.99 produce no leaderboard benefit.

**Multi-trial metrics:** Pass^k and Pass@k computed per task split (base, hallucination, disambiguation), then averaged across splits with **equal weighting regardless of split size**. If there are 20 base tasks and 5 disambiguation tasks, each split counts equally — high performance on small splits matters more per-task.

### Three task types

All use identical A2A output format. Behavioral requirements differ:

| Type | What it tests | Required behavior |
|:-----|:-------------|:-----------------|
| Base | Correct intent, tool use, policy compliance | Execute correctly using available tools |
| Hallucination | Acknowledging limitations vs. fabricating | Return "I cannot do that" — never invent data |
| Disambiguation | Resolving underspecified requests | Ask clarifying questions before acting |

The Hallucination task type is a **negative control** — the correct answer is to refuse or acknowledge capability limits. Attempting to answer = fail.

### Required output format

```python
Part(root=DataPart(kind="data", data={
    "tool_calls": [
        {"tool_name": "<name>", "arguments": <dict>},
        ...
    ]
}))
```

Reasoning is optional but logged:
```python
Part(root=DataPart(kind="data", data={"reasoning_content": "<str>"}))
```

### Anti-gaming

- LLM user simulator (`user_strategy="llm"`) runs as adversary — can't game fixed scripts
- Policy scoring enabled: `score_policy_errors=True` — invalid or unsafe tool calls are penalized
- Task IDs generated deterministically from content hash — can't spoof

### Key rules for LogoMesh

1. **Hallucination tasks = refuse, not answer** — attempting to fabricate data = 0 reward
2. **Disambiguation tasks = ask first** — never act on ambiguous instructions; always clarify
3. **Policy compliance is scored** — invalid tool calls incur penalties even if task is completed
4. **Equal split weighting** — investing in smaller split (disambiguation) is high ROI per task
5. **Binary cliff means nothing below 0.99 counts** — optimize for correctness, not marginal quality

---

## 4. MIDS4LIFE

**Repo:** `github.com/ab-shetty/agentbeats-corebench`
**Source files read:** `scenarios/corebench/metrics/metrics.py`

### Three-component scoring

| Component | Method | Weight |
|:----------|:-------|:-------|
| Accuracy | Deterministic (exact/interval match) | Varies by question count |
| Task Adherence | LLM judge (gpt-5-mini) | Normalized 0–1 |
| Methodology | Deterministic trace analysis | Varies by domain |

**LLM judge breakdown (Task Adherence):**
- Core Process: 50/100 — did the agent follow the correct workflow?
- Problem Solving: 25/100 — error handling and debugging
- Discovery: 15/100 — information-finding efficiency
- Technical: 10/100 — correct commands, no redundancy

### Methodology weights by domain

| Component | Easy | Medium | Hard |
|:----------|:-----|:-------|:-----|
| Doc reading | 100% | 25% | 15% |
| Script reading | — | 15% | 20% |
| Execution | — | 60% | **65%** |

**Hard mode execution tier hierarchy:**
```
Expected scripts succeed:   0.65  ← maximum
Expected scripts fail:      0.45  ← partial for attempt
Random scripts succeed:     0.35  ← less than expected failure
Random scripts fail:        0.15  ← floor
```

Getting the right script and failing beats running random scripts and succeeding. **Identify the expected entry point before executing.**

### Critical anti-cheat gates

**Hard mode:**
```python
if read_turn < first_successful_execution_turn:
    # Agent read results/ files before executing
    read_preexisting_results = True
    violations.append(f"Read pre-existing results: {file_path}")
```
Reading `results/` files before running code = violation flag. This penalizes agents that look at existing outputs instead of reproducing them.

**Easy mode:**
```python
if not attempted_execution:
    doc_read_score = 1.0
else:
    penalty = -0.7  # Heavy penalty for unnecessary script execution
```
In Easy mode, executing scripts is penalized (−0.7). The task only requires reading existing results — execution is considered unnecessary and flags as a misunderstanding of the task.

### Accuracy scoring

- **Numeric:** must fall within 95% prediction interval (`rel_tol ≈ 2e-11`)
- **String:** case-insensitive exact match after strip
- **List:** element-wise exact comparison (order and type sensitive)
- Scale mismatch (100× off) logs warning and fails

### Required output format

```python
submitted = {
    "question_key_1": <value>,   # int, float, str, or list
    "question_key_2": <value>,
    ...
}
```

Extra keys are ignored. Missing keys default to `False` (= wrong).

### Key rules for LogoMesh

1. **Read the domain level before acting** — Easy/Medium/Hard require completely different behaviors
2. **Hard mode: never read results/ before executing** — anti-cheat violation
3. **Easy mode: never execute scripts** — −0.7 penalty is severe
4. **Identify expected entry point scripts** — running the right script (even if it fails) scores 0.45; random success only scores 0.35
5. **Core Process is 50% of LLM judge** — narrate the correct workflow explicitly in tool call reasoning
6. **Answer types matter** — list answers require exact element order; numeric requires interval match

---

## 5. Webshop Plus

**Repo:** `github.com/mpnikhil/webshop-plus`
**Source files read:** `green_agent/src/evaluator.py`

### Five task types — scoring formulas

**Budget task:**
```
score = budget_compliance × w + item_completion × w + quality × w
quality goal types:
  "maximize_quality"  → min(1.0, total_spent / budget)
  "minimize_cost"     → 0.5 + (savings / budget × 0.5)
  "balance"           → optimal at 70–90% utilization
success gate: score ≥ 0.7
```

**Preference Memory task:**
```
score = recall_accuracy × w + consistency × w
recall: LLM judge — does purchase match user history preferences?
success gate: score ≥ 0.7
```

**Negative Constraint task:**
```
score = positive_match × (1 − violation_penalty)
violation_penalty = min(1.0, violations × 0.25)  # 25% per violation
success gate: violations == 0 AND match_score ≥ 0.5
```
One constraint violation = −25% to final score. Two violations = −50%. Any violation also blocks success gate.

**Comparative Reasoning task:**
```
score = 0.3 × exploration + 0.2 × justification_provided + 0.5 × justification_quality
justification_provided: 1.0 if length > 50 chars, else 0.0
justification_quality: LLM judge (rubric: feature comparison, price-to-value, attributes, recommendation)
success gate: exploration ≥ 0.5 AND score ≥ 0.5
```

**Error Recovery task:**
```
score = 0.7 × error_fixed + 0.1 × error_identified + 0.2 × efficiency
error_fixed: binary — cart matches expected state (strict ID or LLM semantic match)
efficiency = 1.0 − min(1.0, (actions_taken − expected) / expected × penalty × 5)
success gate: error_fixed == True AND session_completed == True
```

### Required output format

```python
MCPSessionState {
    cart: list[dict],              # Final cart contents
    history: list[dict],           # Action history
    turn_count: int,
    completed: bool,               # Must be True for recovery/budget success gates
    reasoning_summary: str         # Required for comparative reasoning scoring
}
```

History action types: `"click"`, `"search"`, `"add_to_cart"`, `"remove_from_cart"` — with product_asin on click actions (used for exploration counting in reasoning tasks).

### Key gates and cliffs

| Task | Cliff | Condition |
|:-----|:------|:----------|
| Negative Constraint | Multiplicative | Each violation = −25%; 4+ = total zero |
| Negative Constraint | Success gate | Any violation = task failure |
| Comparative Reasoning | Justification | Length ≤ 50 chars = 0 on 70% of score |
| Error Recovery | Binary | error_fixed = False → 0 on 70% of score |
| Budget | Completion | 0 required items matched = 0 completion |

### Key rules for LogoMesh

1. **Negative Constraint: zero-tolerance on violations** — check every item against forbidden attributes before adding to cart
2. **Error Recovery: fix the cart completely** — 70% of score is binary; partial fixes score the same as zero
3. **Comparative Reasoning: write ≥ 50 chars of justification** — below that = 0 on 70% of the task
4. **Budget: read the quality goal type** — "maximize_quality" vs "minimize_cost" vs "balance" require opposite strategies
5. **Complete the session** (`completed=True`) — multiple success gates require this field
6. **Log product_asin on every click** — exploration counting for comparative reasoning depends on this field

---

## 6. Reviewer Two

**Repo:** `github.com/chrisvoncsefalvay/reviewer-two-env`
**Source files read:** `research_plan_env/server/reward_calculator.py`

### Scoring formula

```
total_reward = (RUBRIC_WEIGHT × rubric_avg × coherence) + (LENGTH_WEIGHT × length_score) + (FORMAT_WEIGHT × format_score)

Weights:
  RUBRIC_WEIGHT  = 0.60
  LENGTH_WEIGHT  = 0.20
  FORMAT_WEIGHT  = 0.20
```

**Per-criterion rubric score:**
```
criterion_score = llm_score × (0.5 + 0.5 × relevance)
```

**LLM score mapping:**
```
EXCELLENT → 1.0
GOOD      → 0.75
PARTIAL   → 0.5
POOR      → 0.25
```

**Rubric average:**
```
rubric_avg = sum(criterion_scores) / len(criteria)
rubric_avg *= coherence  # coherence multiplier applied to entire rubric
```

### Cliffs and gates

| Condition | Effect |
|:----------|:-------|
| Coherence < 0.3 | Returns 0.1 immediately — entire evaluation short-circuits |
| Relevance < 0.1 | Criterion returns 0.1 (near-zero) |
| Relevance < 0.3 | Criterion capped at 0.5 maximum |
| Word count < 200 | Length score degrades to near-zero |

### Nature of the rubric

The rubric is **progressively disclosed** — criteria are revealed over turns, with higher penalties for failing items that have been disclosed. The rubric items evaluate a **research plan** (not code). The agent must:
1. Write a structured research plan
2. Receive adjudicator feedback with partial disclosure
3. Refine the plan to incorporate newly revealed criteria

**Key behavioral implication:** Write broadly and comprehensively in the first turn to maximize coverage of undisclosed criteria. Narrow, specific plans risk missing rubric axes entirely.

### Key rules for LogoMesh

1. **Coherence must stay above 0.3** — below this, the entire reward collapses to 0.1 regardless of content quality
2. **Write ≥ 200 words** — length score is 20% of total; below 200 words near-zeroes it
3. **Write broadly on turn 1** — cover all plausible research plan dimensions before rubric disclosure
4. **Relevance is the multiplier** — high relevance items are worth up to 2× more than low-relevance ones: `score × (0.5 + 0.5 × relevance)`
5. **Format matters (20%)** — structure the output correctly even if content is uncertain
6. **This is the highest-risk repo** — 60% of score is LLM-judged against a hidden rubric; accept variance

---

## Cross-Repo Synthesis: Sprint 2 Patterns

### P1 — Two flavors of binary cliff
- **Type A (threshold cliff):** CAR-bench (0.99 reward), Webshop Plus (0.7 success gate), NetHeal (exact match) — incremental improvement below threshold = zero leaderboard gain
- **Type B (gate cliff):** MateFin (completeness → efficiency zero), MIDS4LIFE (results-before-execution → violation) — a specific behavior voids a secondary dimension

**Implication:** Identify which cliff type applies first. For Type A, optimize for correctness before quality. For Type B, understand the forbidden behavior pattern and avoid it unconditionally.

### P2 — Three repos use LLM judges (but in different ways)
- **CAR-bench:** LLM user simulator as adversary — the LLM is not scoring, it's responding dynamically
- **MIDS4LIFE:** gpt-5-mini as task adherence judge — narrate the correct workflow to maximize Core Process (50%)
- **Reviewer Two:** LLM judges each rubric criterion — comprehensive plans beat narrow ones
- **Webshop Plus:** LLM judges preference recall and comparative reasoning quality

**Universal rule:** Produce explicit chain-of-thought that names the correct process. All four LLM judges reward demonstrated awareness of correct methodology.

### P3 — Domain-mode detection is mandatory for MIDS4LIFE
Easy / Medium / Hard modes require completely different behaviors. Acting like it's Hard mode in Easy mode incurs −0.7. Not reading docs in Medium mode forfeits 25% of methodology score.

### P4 — Negative tasks in Sprint 2 parallel AVER's negative controls
- CAR-bench Hallucination tasks: correct answer is refusal
- MIDS4LIFE: never read pre-existing results
- Webshop Plus Negative Constraint: correct answer is restraint (zero violations)

The pattern from Sprint 3 (AVER negative controls) repeats: **the ability to NOT do something is scored as heavily as the ability to do something.**

### P5 — Biggest cliffs by points-at-risk

| Cliff | Repo | Points at risk |
|:------|:-----|:---------------|
| Negative constraint violation | Webshop Plus | 25% per violation, success gate blocked |
| Completeness gate → efficiency zero | MateFin | 15 points |
| Wrong diagnosis → negative reward | NetHeal | −10 × network_size_multiplier |
| Results-before-execution | MIDS4LIFE | Violation flag on hard mode |
| Coherence < 0.3 | Reviewer Two | Entire rubric (60%) collapses to 0.1 |
| CAR-bench below 0.99 | CAR-bench | All partial credit zeroed |

---

## Data Gaps

| Item | Status |
|:-----|:-------|
| MateFin task examples (actual Comtrade mock API tasks) | Not fetched |
| CAR-bench tool list (what tools are available to Purple Agent) | Not fetched |
| NetHeal fault type taxonomy (exact 4 types) | Not fetched |
| MIDS4LIFE example capsule task | Not fetched |
| Webshop Plus product catalog / schema | Not fetched |
| Reviewer Two rubric examples / turn structure | Not fetched |
