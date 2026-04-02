> **Status:** ACTIVE
> **Type:** Research
> **Context:**
> *   [2026-04-02]: Cross-repo compatibility matrix built from Pass 1–3 data across all Sprint 2 and Sprint 3 first-place repos. Input to the Optimal Path Synthesis doc. Scores each repo on 8 axes to identify adapter clusters and implementation cost vs. score ceiling.
> **See Also:**
> *   [Optimal Path Synthesis]([2026-04-02]-Optimal-Path-Synthesis.md)
> *   [Sprint 3 First-Place Deep-Dive]([2026-04-02]-Sprint3-FirstPlace-Scoring-Deep-Dive.md)
> *   [Sprint 2 Scoring Deep-Dive]([2026-04-02]-Sprint2-Scoring-Deep-Dive.md)

# Generalization Compatibility Matrix

## Scoring Axes

| Axis | Scale | Description |
|:-----|:------|:------------|
| **Output adapter** | A–E | What the Purple Agent must produce (see legend) |
| **Input format** | Text / JSON / Stateful | How the task arrives |
| **Scoring type** | I–IV | Deterministic / Det+LLM / Multi-dim+LLM / Game-theoretic |
| **Infra barrier** | 1–5 | 1=none, 3=moderate setup, 5=specialized cluster or domain stack |
| **LogoMesh overlap** | 1–5 | 5=capability already exists, 1=new capability required |
| **Impl cost** | 1–5 | Developer effort to add adapter (1=trivial, 5=major new capability) |
| **Score ceiling** | 0–100 | Estimated max score achievable with LogoMesh capabilities |
| **Adapter reuse** | [list] | Which other repos share the same adapter |

### Output adapter legend

| Code | Description | Examples |
|:-----|:------------|:---------|
| **A** | Write JSON file to shared filesystem path | RCAbench (`loc.json`) |
| **B** | Return JSON dict in A2A response | text-2-sql (`{"sql":"..."}`) |
| **C** | Multi-turn structured tool calls (detect→act) | AVER (`<json>run_python</json>`), CAR-bench |
| **D** | Stateful session with action history | Webshop Plus (`MCPSessionState`) |
| **E** | Live infrastructure commands (kubectl, FHIR POST) | NetArena, ICU-Later |
| **F** | Multi-turn text plan / research output | Pi-Bench (trace+verdict), MIDS4LIFE, Reviewer Two |

---

## Full Matrix

### Sprint 3 First-Place Repos (ALL mandatory)

| Repo | Track | Output adapter | Input format | Scoring | Infra barrier | LogoMesh overlap | Impl cost | Score ceiling | Adapter reuse |
|:-----|:------|:--------------|:-------------|:--------|:-------------|:-----------------|:----------|:-------------|:--------------|
| **RCAbench** | Cybersecurity | A (file write) | Text msg (`arvo:ID`) | I — deterministic IoU | 2 (workspace, no live cluster) | 4 (MCTS vulnerability reasoning) | 2 | 75 | — |
| **Pi-Bench** | Agent Safety | F (trace+verdict) | Text (policy scenario) | I — deterministic violation rate | 1 (text only) | 3 (policy reasoning via LLM) | 2 | 70 | MIDS4LIFE, Reviewer Two |
| **NetArena** | Coding Agent | E (kubectl commands) | Structured + live mismatch report | I — binary correctness | 5 (K8s cluster required) | 2 (MCTS applicable but infra blocks) | 5 | 40 | — |
| **ICU-Later** | Healthcare | E (FHIR POST + text) | Text question + FHIR context | II — LLM semantic + action correctness | 4 (FHIR server + medical domain) | 1 (no existing clinical capability) | 5 | 30 | — |
| **LogoMesh** | Software Testing | B (JSON code output) | Text coding task | III — CIS score (multi-dim) | 1 (we own it) | 5 (we ARE it) | 1 | 90 | text-2-sql |

### Sprint 3 Additional High-Priority Repos (already analyzed)

| Repo | Track | Output adapter | Input format | Scoring | Infra barrier | LogoMesh overlap | Impl cost | Score ceiling | Adapter reuse |
|:-----|:------|:--------------|:-------------|:--------|:-------------|:-----------------|:----------|:-------------|:--------------|
| **AVER** | Agent Safety 3rd | C (tool calls + code) | Text task w/ injected error | III — weighted w/ multipliers | 1 (text + sandbox) | 4 (pre-execution detection pattern) | 2 | 85 | CAR-bench, MIDS4LIFE |
| **text-2-sql** | Coding 2nd | B (JSON dict) | JSON `{question, schema, dialect}` | II — deterministic + LLM quality | 1 (SQLite/DuckDB) | 4 (SQL generation, AST validation) | 1 | 90 | LogoMesh |
| **AgentSWE** | Software Testing 2nd | B (patch/bash output) | Text SWE-bench task | II — pass@1 + token efficiency | 2 (repo sandbox) | 4 (existing code agent patterns) | 2 | 70 | RCAbench |

### Sprint 2 First-Place Repos

| Repo | Track | Output adapter | Input format | Scoring | Infra barrier | LogoMesh overlap | Impl cost | Score ceiling | Adapter reuse |
|:-----|:------|:--------------|:-------------|:--------|:-------------|:-----------------|:----------|:-------------|:--------------|
| **MateFin** | Web Agent | A (3 files: jsonl+json+log) | JSON task dict (API calls) | I — deterministic 6-axis | 1 (mock HTTP service) | 3 (HTTP client + pagination logic) | 2 | 80 | RCAbench (file-write pattern) |
| **CAR-bench** | Computer Use | C (tool calls) | Text + dynamic tool injection | II — binary pass rate | 1 (simulated car environment) | 3 (multi-turn tool calling) | 2 | 65 | AVER, Webshop Plus |
| **MIDS4LIFE** | Research Agent | F (answer dict) | Capsule (code+data+docs) | II — deterministic + LLM judge | 2 (bash/Python execution) | 3 (code execution + planning) | 3 | 60 | Pi-Bench, Reviewer Two |
| **Webshop Plus** | Web Agent | D (stateful session) | JSON task w/ constraints | III — multi-dim LLM+det | 1 (simulated shop) | 2 (stateful session mgmt new) | 3 | 55 | CAR-bench |
| **HEP-ExpAgents** | Research Agent | F (physics trace) | Capsule + ROOT files | II — hard gate + rule + LLM | 5 (ROOT, HEP physics domain) | 1 (no physics capability) | 5 | 20 | — |
| **MAizeBargAIn** | Multi-Agent | F (bargaining offers) | Live multi-round game | IV — MENE / Nash equilibrium | 2 (game framework) | 1 (no bargaining capability) | 5 | 25 | — |

---

## Adapter Clusters

Grouping repos by shared output adapter type reveals implementation leverage:

### Cluster A — File-Write Adapters
**Repos:** RCAbench, MateFin
**Shared pattern:** Purple Agent writes output to a specific file path on a shared filesystem.
**Incremental cost:** RCAbench already built → MateFin adds 3-file schema (jsonl + json + log). Moderate delta.
**Combined score value:** 75 + 80 = 155 points across 2 repos for ~3 implementation units.

### Cluster B — JSON Response Adapters
**Repos:** text-2-sql, LogoMesh (Software Testing), AgentSWE
**Shared pattern:** Purple Agent returns structured JSON in the A2A response body.
**Incremental cost:** Lowest of all clusters — already the default A2A response mode.
**Combined score value:** 90 + 90 + 70 = 250 points across 3 repos for ~2 implementation units.

### Cluster C — Multi-Turn Tool Call Adapters
**Repos:** AVER, CAR-bench
**Shared pattern:** Multi-turn detect/decide/act loop with structured tool calls. AVER uses `<json>run_python</json>`; CAR-bench uses DataPart tool calls. Same conceptual pattern, different serialization.
**Incremental cost:** AVER adapter built → CAR-bench delta is mainly task-type detection (hallucination/disambiguation).
**Combined score value:** 85 + 65 = 150 points for ~3 implementation units.

### Cluster D — Stateful Session Adapters
**Repos:** Webshop Plus
**Shared pattern:** Agent maintains stateful shopping session with action history.
**Incremental cost:** New capability — requires session state management and action history tracking.
**Standalone score value:** 55 for ~3 implementation units (lowest ROI of the tractable clusters).

### Cluster E — Live Infrastructure Adapters
**Repos:** NetArena, ICU-Later
**Shared pattern:** Agent issues real commands to live infrastructure (K8s / FHIR server).
**Incremental cost:** Highest — requires dedicated cluster or server setup before any scoring is possible.
**Combined score value:** 40 + 30 = 70 for ~8 implementation units (lowest ROI overall).

### Cluster F — Text Plan / Research Adapters
**Repos:** Pi-Bench, MIDS4LIFE, Reviewer Two, HEP-ExpAgents, MAizeBargAIn
**Shared pattern:** Agent produces structured text output (research plans, policy traces, answer dicts).
**Incremental cost:** Core LLM reasoning loop already exists in LogoMesh. Adapter cost is mainly output formatting + domain-specific prompting.
**Tractable subset value (Pi-Bench + MIDS4LIFE):** 70 + 60 = 130 for ~4 implementation units.

---

## ROI Summary Table

Ranked by (score_ceiling × reuse_factor) / impl_cost:

| Cluster | Repos | Total score potential | Impl units | Score/unit | Notes |
|:--------|:------|:---------------------|:-----------|:-----------|:------|
| **B** — JSON response | text-2-sql, LogoMesh, AgentSWE | 250 | 2 | **125** | Highest ROI; LogoMesh is self |
| **A** — File write | RCAbench, MateFin | 155 | 3 | 52 | RCAbench already started |
| **C** — Tool call multi-turn | AVER, CAR-bench | 150 | 3 | 50 | AVER already started |
| **F (tractable)** — Text plan | Pi-Bench, MIDS4LIFE | 130 | 4 | 33 | No infra barrier |
| **D** — Stateful session | Webshop Plus | 55 | 3 | 18 | Complex state mgmt |
| **E** — Live infra | NetArena, ICU-Later | 70 | 8 | **9** | Lowest ROI; mandatory for Sprint 3 |

---

## Infrastructure Barrier Flags

Repos requiring special setup before ANY scoring is possible:

| Repo | Barrier | Estimated setup effort |
|:-----|:--------|:----------------------|
| NetArena | Kubernetes cluster + Google Online Boutique deployment | High — dedicated K8s infra |
| ICU-Later | FHIR server + MIMIC-IV-FHIR data + FDA drug label API | High — data licensing + server |
| HEP-ExpAgents | ROOT framework + HEP physics domain knowledge | Very high — domain expertise |
| MIDS4LIFE | Bash execution environment + capsule access | Low — standard execution env |
