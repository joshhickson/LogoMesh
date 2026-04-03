> **Status:** SUPERSEDED
> **Type:** Research
> **Context:**
> *   [2026-04-02]: Pass 3 for Sprint 2 first-place repos already at Pass 2 coverage: MIDS4LIFE, CAR-bench, MateFin, Webshop Plus. Answers "what does the Purple Agent receive and what must it produce?" for each repo.
> **Superseded By:** MateFin, MIDS4LIFE, and Webshop Plus are not in the official Phase 2 Sprint 2 roster. CAR-bench analysis here remains valid; see [[2026-04-02]-Sprint2-New-Repos-Analysis.md]([2026-04-02]-Sprint2-New-Repos-Analysis.md) for the corrected Sprint 2 analysis.
> **See Also:**
> *   [Sprint 2 Scoring Deep-Dive]([2026-04-02]-Sprint2-Scoring-Deep-Dive.md)
> *   [Sprint 3 Task Input Formats]([2026-04-01]-Sprint3-Task-Input-Formats.md)

# Sprint 2 — Task Input Formats (Pass 3)

---

## 1. MateFin (Web Agent — 1st Tie)

**Repo:** `github.com/yonghongzhang-io/green-comtrade-bench-v2`
**Source files read:** `baseline_purple/purple_agent.py`, `src/tasks.py`, `schemas/`

### Task message structure

The Purple Agent receives a task dict:
```python
{
    "task_id": "T7_totals_trap",      # e.g., T1–T7+
    "query": {
        "reporter": "...",             # Country reporting trade data
        "partner": "...",              # Trading partner
        "flow": "...",                 # Import/Export
        "year": ...,
    },
    "constraints": {
        "paging_mode": "page",         # Pagination style
        "page_size": 100,
        "max_requests": 20,
        "total_rows": 500
    },
    "fault_injection": {               # What failures to expect/handle
        "429_rate": 0.3,               # 30% chance of rate limit
        "500_rate": 0.1,
        "pagination_drift": False,
        "totals_trap": True            # Rows with isTotal=true must be filtered
    }
}
```

### Tools available

The Purple Agent calls a **mock HTTP service** at the configured endpoint:

| Endpoint | Method | Description |
|:---------|:-------|:------------|
| `/configure` | POST | Configure mock service with task definition |
| `/records` | GET | Fetch paginated records (returns JSON) |
| `/docs` | GET | Health check |

`/records` returns paginated Comtrade-style trade records. The agent must handle:
- HTTP 429 (rate limit) → exponential backoff: 1s, 2s, 4s, max 3 retries
- HTTP 500 (server error) → retry with limits
- Totals trap: rows where `isTotal=true AND partner=WLD AND hs=TOTAL` must be dropped
- Deduplication by `dedup_key = ["year", "reporter", "partner", "flow", "hs", "record_id"]`

### Required output files

**`data.jsonl`** — One JSON object per line, deduplicated and sorted by `dedup_key`

**`metadata.json`:**
```json
{
    "task_id": "T7_totals_trap",
    "query": {...},
    "row_count": 483,
    "schema": ["year", "reporter", "partner", "flow", "hs", "value", "record_id"],
    "dedup_key": ["year", "reporter", "partner", "flow", "hs", "record_id"],
    "sorted_by": ["year", "reporter", "partner", "flow", "hs", "record_id"],
    "totals_handling": {
        "enabled": true,
        "rows_dropped": 17,
        "rule": "drop rows where isTotal=true AND partner=WLD AND hs=TOTAL"
    },
    "pagination_stats": {"pages_fetched": 5, "total_requests": 8},
    "request_stats": {"retries": 2, "429_encountered": 3},
    "retry_policy": {"strategy": "exponential_backoff", "max_retries": 3}
}
```

**`run.log`** — Structured execution log with entries for task_id, page, request, complete fields (used for observability scoring)

### Key rules
- All three files required — missing any = completeness gate fires, zeroing efficiency
- Log must contain `task_id`, `page`, `request`, `complete` fields — not just free text
- Totals trap rows must be dropped before counting `row_count`
- Retry policy must use exponential backoff (1s/2s/4s) — worth +3 robustness points vs naive retry

---

## 2. CAR-bench (Computer Use — 1st Place)

**Repo:** `github.com/CAR-bench/car-bench-agentbeats`
**Source files read:** `src/purple_car_bench_agent/car_bench_agent.py`

### Task message structure

CAR-bench uses a **fully dynamic tool-passing protocol**. The Green Agent sends tools to the Purple Agent on each turn via A2A DataParts:

```python
# Inbound message parsing:
for part in inbound_message.parts:
    if isinstance(part.root, TextPart):
        text_content = part.root.text     # System prompt / task description
    elif isinstance(part.root, DataPart):
        data = part.root.data
        if "tools" in data:
            tools = data["tools"]          # Tool definitions injected each turn
        if "tool_results" in data:
            results = data["tool_results"] # Results from previous tool calls
```

The initial message contains:
- Text: system prompt + task description (natural language)
- Data: list of tool definitions with `function.name` and `function.arguments` schemas

### Three task types (all same protocol, different behavior required)

| Type | Task description contains | Required behavior |
|:-----|:-------------------------|:-----------------|
| Base | Normal in-car assistant request | Execute tools correctly, follow policies |
| Hallucination | Request for unsupported feature | Acknowledge limitation — NEVER fabricate |
| Disambiguation | Underspecified request | Ask clarifying question — NEVER act without clarification |

### Required response format

```python
# Tool invocations:
Part(root=DataPart(kind="data", data={
    "tool_calls": [
        {"tool_name": "<name>", "arguments": <dict>},
    ]
}))

# Text dialogue (optional but scored by LLM user):
Part(root=TextPart(kind="text", text="<response>"))

# Reasoning (optional, logged):
Part(root=DataPart(kind="data", data={"reasoning_content": "<str>"}))
```

### Available tools (dynamically provided)

Tools are injected per turn — not hardcoded. From the README, the tool set spans:
- Navigation (58 tools across navigation, POI search, routing)
- Vehicle control
- Charging management
- Productivity (calendar, contacts)
- 48 cities, 130K POIs, 1.7M routes available

### Key rules
- Detect task type from the description — Hallucination and Disambiguation require opposite strategies to Base
- Always include `reasoning_content` DataPart — it's logged even if not directly scored
- Tool call ID is deterministically hashed from content — don't construct custom IDs
- Policy scoring is active (`score_policy_errors=True`) — invalid tool calls are penalized

---

## 3. MIDS4LIFE (Research Agent — 1st Tie)

**Repo:** `github.com/ab-shetty/agentbeats-corebench`
**Source files read:** `scenarios/corebench/planning_prompts.yaml`, `scenarios/corebench/corebench_agent.py` (structure)

### Task message structure

The actual task definitions are GPG-encrypted (`core_test.json.gpg`) — contents not publicly accessible. However, from the evaluation source and planning prompts, the task structure is clear:

The Purple Agent receives:
- A **capsule** — research paper + code + data bundled from CodeOcean
- A set of **questions** with expected answer keys (numeric, string, or list)
- A **difficulty level** (Easy / Medium / Hard) embedded in the task context

The `planning_prompts.yaml` instructs the agent to:
```
1. Build a survey of facts:
   - Facts given in the task
   - Facts to look up (sources: websites, files)
   - Facts to derive (logical reasoning, computation)
2. Make a step-by-step high-level plan using available tools
3. On retry: produce updated facts survey, then new or revised plan
```

### Tools available (via MCP server at `mcp_server.py`)

The agent has access to:
- `execute_bash` — run shell commands, Python/R/Docker/Jupyter
- `inspect_file_as_text` — read documentation and script files
- `query_vision_language_model` — analyze results images/figures

### Required output

```python
submitted = {
    "question_key_1": <int|float|str|list>,
    "question_key_2": <int|float|str|list>,
    ...
}
```

One entry per question in the capsule. Missing keys = `False` (wrong). Extra keys ignored.

### Behavior by difficulty level (CRITICAL)

| Level | Correct behavior | Wrong behavior (penalized) |
|:------|:----------------|:--------------------------|
| Easy | Read existing `results/` files | Execute scripts (-0.7 penalty) |
| Medium | Read docs + execute scripts | Skip doc reading (−25% methodology) |
| Hard | Identify correct entry point → execute | Read `results/` before executing (violation flag) |

**The agent MUST detect the difficulty level before acting.** Acting as if it's Hard mode in Easy mode incurs a −0.7 penalty. The difficulty is derivable from the capsule structure and task description.

### Key rules
- Detect Easy/Medium/Hard from the task before any tool calls
- Hard: never read `results/` files before first successful execution
- Easy: never execute scripts at all
- Use `inspect_file_as_text` before `execute_bash` on Medium/Hard — doc reading contributes 15–25% of methodology score
- Answer numeric questions as `int` or `float` (not string); lists require exact element order

---

## 4. Webshop Plus (Web Agent — 1st Tie)

**Repo:** `github.com/mpnikhil/webshop-plus`
**Source files read:** `green_agent/data/tasks/budget_constrained.json`, `purple_agent/src/shopping_agent.py`

### Task message structure

The Green Agent sends a task JSON to the Purple Agent:
```json
{
    "task_id": "budget_001",
    "task_type": "budget_constrained",
    "instruction": "I need to buy workout clothes for the gym. Get me shorts and a t-shirt, but I only have $50 to spend.",
    "difficulty": "easy",
    "expected_actions": 15,
    "timeout_seconds": 180,
    "constraints": {
        "budget": 50.0,
        "required_items": [
            {"category": "men's shorts", "attributes": {"use": "gym"}},
            {"category": "men's t-shirts", "attributes": {}}
        ],
        "optimization_goal": "minimize_cost"
    },
    "evaluation_criteria": {
        "budget_adherence_weight": 0.4,
        "item_match_weight": 0.4,
        "optimization_weight": 0.2
    }
}
```

All five task types follow the same structure with type-specific `constraints` and `evaluation_criteria`.

### Five task type constraint schemas

| Type | Key constraint fields |
|:-----|:---------------------|
| `budget_constrained` | `budget`, `required_items[]`, `optimization_goal` (minimize_cost/maximize_quality/balance) |
| `preference_memory` | `user_history[]` (past purchases/preferences), `current_request` |
| `negative_constraint` | `forbidden_attributes[]`, `forbidden_terms[]`, `required_items[]` |
| `comparative_reasoning` | `candidate_items[]`, `comparison_criteria[]`, `minimum_products_to_explore` |
| `error_recovery` | `initial_cart[]` (contains errors), `target_cart[]` (desired state) |

### Required output

```python
MCPSessionState {
    cart: [                         # Final cart contents
        {"product_id": str, "name": str, "price": float, "quantity": int, ...}
    ],
    history: [                      # All actions taken
        {"action": "search", "query": "gym shorts"},
        {"action": "click", "element_id": "p42", "product_asin": "B08XYZ"},
        {"action": "add_to_cart", "product": {...}},
        {"action": "remove_from_cart", "removed_product": {...}},
    ],
    turn_count: int,
    completed: bool,                # Must be True for most success gates
    reasoning_summary: str          # Required for comparative_reasoning tasks (≥50 chars)
}
```

**Critical:** `product_asin` must be logged on every click action — it's used to count unique products explored in Comparative Reasoning tasks.

### Key rules
- Read `task_type` first — it determines the entire strategy
- `negative_constraint`: check EVERY item against `forbidden_attributes` before adding to cart; one violation = −25% + success gate blocked
- `error_recovery`: the initial cart is pre-populated with errors; agent must identify and fix them; `completed=True` is required for success gate
- `comparative_reasoning`: write ≥50 chars in `reasoning_summary`; below that = 0.0 on 70% of the task
- `budget_constrained`: read `optimization_goal` — `minimize_cost` and `maximize_quality` require opposite purchasing strategies
