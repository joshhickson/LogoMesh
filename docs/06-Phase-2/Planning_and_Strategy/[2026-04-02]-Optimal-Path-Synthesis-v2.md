> **Status:** ACTIVE
> **Type:** Plan
> **Context:**
> *   [2026-04-02]: Corrected optimal path synthesis based on verified Phase 2 roster. Supersedes [2026-04-02]-Optimal-Path-Synthesis.md which was built from the wrong Sprint 2 repo list (MateFin, MIDS4LIFE, Webshop Plus were not in Phase 2).
> **Supersedes:** [[2026-04-02]-Optimal-Path-Synthesis.md]([2026-04-02]-Optimal-Path-Synthesis.md)
> **See Also:**
> *   [Generalization Compatibility Matrix v2]([2026-04-02]-Generalization-Compatibility-Matrix-v2.md)
> *   [Sprint 2 New Repos Analysis]([2026-04-02]-Sprint2-New-Repos-Analysis.md)
> *   [Sprint 4 Initial Analysis]([2026-04-02]-Sprint4-Initial-Analysis.md)

# Optimal Path Synthesis v2

## Selected Targets

### Sprint 2 (active window — ends April 12)

| Repo | Adapter | Expected score | Cost | Priority |
|:-----|:--------|:--------------|:-----|:---------|
| **CAR-bench** | C delta from AVER | 55 | 1 unit | **Primary** |
| **τ²-Bench** | C delta from CAR-bench | 45 | 2 units | Secondary (if time) |

### Sprint 3 (April 13 – May 3, tentative)

| Repo | Track | Adapter | Expected score | Cost |
|:-----|:------|:--------|:--------------|:-----|
| **text-2-sql** | Coding Agent | B (JSON) | 85 | 1 unit |
| **AVER** | Agent Safety | C (multi-turn) | 80 | 2 units |
| **RCAbench** | Cybersecurity | A (file write) | 70 | 2 units |
| **Terminal-Bench 2.0** | Coding Agent (unconfirmed) | B / hybrid | 70 | 1–2 units |
| **Pi-Bench** | Agent Safety | F (policy trace) | 55 | 2 units |
| **NetArena** | Coding Agent | E floor | 20 | 2 units |

### Expected totals

| Scenario | Repos | Total expected score |
|:---------|:------|:--------------------|
| Sprint 3 mandatory only | text-2-sql + AVER + RCAbench + Pi-Bench + NetArena | **310** |
| + Sprint 2 primary | + CAR-bench | **365** |
| + Terminal-Bench 2.0 confirmed | + TB2.0 | **435** |
| + Sprint 2 secondary (if time) | + τ²-Bench | **480** |

**Conservative target: ~365 points** (confirmed roster only, Sprint 3 mandatory + CAR-bench).
**Optimistic target: ~480 points** (all inclusions, TB2.0 confirmed, τ²-Bench completed in Sprint 2 window).

> **Roster note:** These totals are lower than the previous synthesis (~655) due to the corrected roster. The original synthesis included MateFin (+70), MIDS4LIFE (+45), ICU-Later (+20), AgentSWE (+65), and LogoMesh-self (+85) — none of which are in Phase 2. The corrected totals reflect only confirmed competition repos.

---

## Implementation Sequence

Ordered by: sprint window deadline first, then adapter ROI, then reuse leverage.

### Stage 1 — Adapter B (Sprint 3 prep, start immediately)

**Build:** Extend existing A2A response handler to route by task type → return structured JSON dict.

**Covers:** text-2-sql, Terminal-Bench 2.0 (if confirmed as B-type)

**Reuses:** Existing `GenericDefenderExecutor` + OpenAI client. Add a SQL formatter and schema validator.

**Key implementation rules:**
- text-2-sql: AST hallucination check BEFORE SQL execution. Validate all table/column names against the provided schema before submitting.
- Terminal-Bench 2.0: If output is command text (not JSON dict), extend to a "command mode" that wraps the response as a text message with the commands inline.

**Cost:** 1 unit. **Score unlocked:** 85 (text-2-sql) + 70 (TB2.0, conditional) = 155.

---

### Stage 2 — Adapter C (Sprint 2 + Sprint 3)

**Build:** Multi-turn detect→diagnose→act loop with serialized tool call format.

**Covers (in order of build):**
1. AVER (Sprint 3 — anchor for Cluster C)
2. CAR-bench (Sprint 2 — **submit before April 12**)
3. τ²-Bench (Sprint 2 — submit before April 12 if time)

**Reuses:** Multi-turn `conversation_history[context_id]` from existing `GenericDefenderExecutor`. New: tool call serialization and error classification taxonomy.

**Key implementation rules (AVER):**
- Detect error type BEFORE attempting any tool execution. Turn-order multiplier means pre-execution detection scores higher than post-execution detection.
- Five error categories: hallucination, validation failure, tool misuse, context loss, adversarial injection. Each has a distinct detection signal.
- Recovery (40% of score) requires producing corrected output after diagnosis.

**Key implementation rules (CAR-bench):**
- Binary cliff at reward ≥ 0.99. No partial credit.
- Three task types: base (execute), hallucination (acknowledge + decline), disambiguation (ask for clarification + do NOT act).
- Task type is determinable from the system prompt before issuing any tool calls.

**Key implementation rules (τ²-Bench):**
- Dual control: user simulator can ALSO take actions in the shared backend. Track what the user has already done before issuing tool calls.
- Three domains: airline, retail, telecom. Each has distinct tool schemas and policies. Load the correct tool schema at task start.
- Policy following is mandatory — not just preferred. Policy violations cause task failure (not penalty reduction).

**Cost:** 2 (AVER) + 1 (CAR-bench) + 2 (τ²-Bench) = 5 units total for Stage 2.
**Score unlocked:** 80 (AVER) + 55 (CAR-bench) + 45 (τ²-Bench) = 180.

---

### Stage 3 — Adapter A (Sprint 3)

**Build:** File-write output to shared workspace path + MCTS vulnerability localization.

**Covers:** RCAbench

**Reuses:** Existing MCTS Red Agent reasoning (`src/red_logic/orchestrator.py`). New: translate MCTS output to `loc.json` file format.

**Key implementation rules:**
- Output format: `{"file_path": "...", "function_name": "...", "line_numbers": [start, end]}`
- IoU scoring: partial credit at file-level even if line-level is imprecise. Prioritize correct file → correct function → correct line range.
- Crash report parsing: extract `arvo:(\d+)` ID, load corresponding workspace from shared filesystem.

**Cost:** 2 units. **Score unlocked:** 70.

---

### Stage 4 — Adapter F (Sprint 3)

**Build:** Structured policy trace + compliance verdict output.

**Covers:** Pi-Bench

**New capability:** Policy compliance reasoning — tracking which policy clauses apply to each action step and whether the agent's actions violate them.

**Key implementation rules:**
- 9 scoring columns: Compliance, Understanding, Robustness, Process, Restraint, Conflict Resolution, Detection, Explainability, Adaptation.
- `AMBIGUOUS_POLICY` / `AMBIGUOUS_STATE` are valid outputs when the policy is unclear. Forced binary responses are penalized.
- The execution trace must include policy citation for each step (`"policy_ref": "§3.2 — Data minimization"`).

**Cost:** 2 units. **Score unlocked:** 55.

---

### Stage 5 — Adapter E floor (Sprint 3)

**Build:** kubectl reasoning without live K8s cluster.

**Covers:** NetArena (floor attempt)

**Strategy:** Generate correct diagnostic reasoning and kubectl command sequences based on MCTS network analysis. Submit reasoning-quality output without executing against a live cluster. Target partial credit from well-reasoned but unexecuted responses.

**Key implementation rules:**
- Three sub-apps: k8s (NetworkPolicy objects), malt (Mininet topology), route (BGP/routing tables).
- Binary correctness gate means actual pod connectivity must be correct for full points. Floor strategy accepts ~20 points from reasoning quality.
- If a KinD (Kubernetes-in-Docker) cluster becomes available before Sprint 3 closes, elevate to full implementation (ceiling: 40).

**Cost:** 2 units (floor only). **Score unlocked:** 20.

---

## Adapter Architecture (5 adapters)

```
Purple Agent
    ├── Adapter B — JSON response
    │   ├── text-2-sql: SQL formatter + AST validator
    │   └── Terminal-Bench 2.0: command text wrapper (conditional)
    │
    ├── Adapter C — Multi-turn tool calls
    │   ├── AVER: error detect→diagnose→act + 5 error categories
    │   ├── CAR-bench: task-type router (base/hallucination/disambiguation)
    │   └── τ²-Bench: dual-control tracker + 3 domain tool schemas
    │
    ├── Adapter A — File write
    │   └── RCAbench: MCTS loc.json formatter
    │
    ├── Adapter F — Policy trace
    │   └── Pi-Bench: 9-column compliance trace + verdict
    │
    └── Adapter E floor — Reasoning without live infra
        └── NetArena: kubectl diagnostic reasoning
```

---

## Risk Register

| Risk | Repos affected | Mitigation |
|:-----|:--------------|:-----------|
| Sprint 3 roster changes (currently tentative) | All Sprint 3 targets | Monitor website + AgentBeats dashboard weekly; existing analysis covers likely first-place repos |
| Terminal-Bench 2.0 not confirmed for Sprint 3 | TB2.0 (+70 pts) | Do not build until Sprint 3 roster announced; design Adapter B to extend cleanly |
| τ²-Bench dual-control underestimated | τ²-Bench | If time runs out in Sprint 2 window, drop τ²-Bench — CAR-bench alone is sufficient for Sprint 2 requirement |
| NetArena floor attempt scores 0 (all-or-nothing) | NetArena | Investigate KinD cluster feasibility early in Sprint 3 window before committing to floor strategy |
| Sprint 4 roster introduces repos requiring new adapters | Sprint 4 | Cannot plan until announced; generalized 5-adapter architecture maximizes Sprint 4 starting position |

---

## Decision Log

**Why CAR-bench over MAizeBargAIn, FieldWorkArena, MLE-Bench, OSWorld-Verified for Sprint 2:**
CAR-bench is the only Sprint 2 repo with LOW infrastructure barrier + MEDIUM-HIGH LogoMesh fit + an adapter that reuses mandatory Sprint 3 work. All others require either extreme compute (MLE-Bench), vision capability (OSWorld-Verified), domain-specific expertise not present (FieldWorkArena video, MAizeBargAIn game theory), or both.

**Why τ²-Bench as secondary Sprint 2:**
Cluster C adapter is being built for AVER + CAR-bench regardless. τ²-Bench adds 2 implementation units for 45 expected points — lower ROI than CAR-bench (55/1 unit = 55 pts/unit vs τ²-Bench 45/2 = 22.5 pts/unit), but still better than any other Sprint 2 option. Added value only if Sprint 2 time permits.

**Why NetArena floor vs. full build:**
Full K8s build costs 5 units for a 40-point ceiling (8 pts/unit). Floor attempt costs 2 units for 20 points (10 pts/unit). Floor is actually higher ROI, and those 3 saved units can go to τ²-Bench (22.5 pts/unit) for net higher total.

**Why ICU-Later excluded:**
Healthcare is not in Sprint 3 per the official website. Even if it were added later, FHIR infrastructure + clinical domain knowledge would add 4+ units for a 25-point ceiling — worst ROI in the entire roster.

**Why Terminal-Bench 2.0 is high priority when confirmed:**
Docker-only infra + binary test-script scoring + terminal coding tasks = the highest LogoMesh overlap of any new discovery. Score ceiling of 70 at implementation cost of 1–2 units (builds on Cluster B) gives 35–70 pts/unit.
