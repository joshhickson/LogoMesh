> **Status:** ACTIVE
> **Type:** Research
> **Context:**
> *   [2026-04-02]: Sprint 3 roster verification and new benchmark discovery. Written after confirming the official Phase 2 schedule on rdi.berkeley.edu/agentx-agentbeats.html and cross-referencing against the AgentBeats dashboard (agentbeats.dev).
> **See Also:**
> *   [Sprint 2 New Repos Analysis]([2026-04-02]-Sprint2-New-Repos-Analysis.md)
> *   [Generalization Compatibility Matrix v2]([2026-04-02]-Generalization-Compatibility-Matrix-v2.md)

# Sprint 3 Roster Verification

## Official Track List (April 13 – May 3, tentative)

The Berkeley RDI website lists Sprint 3 as **tentative** with three tracks:
- Agent Safety
- Coding Agent
- Cybersecurity Agent

**Healthcare is NOT listed for Sprint 3.** ICU-Later and all FHIR-based benchmarks are excluded from active Sprint 3 planning.

## Repo Roster Status

Sprint 3 specific repos have not been formally announced. The following are the Phase 1 first- and second-place repos from each confirmed Sprint 3 track, representing our best current knowledge of what will be in scope:

| Track | Repo | Phase 1 Place | Our analysis | Status |
|:------|:-----|:-------------|:-------------|:-------|
| Cybersecurity | RCAbench | 1st | Pass 1+2+3 ✅ | **Likely confirmed** |
| Agent Safety | Pi-Bench | 1st | Pass 1+2 ✅ | **Likely confirmed** |
| Agent Safety | AVER | 3rd | Pass 1+2+3 ✅ | **Likely confirmed** |
| Agent Safety | NAAMSE | 2nd | Pass 1 ✅ | Possible |
| Coding Agent | NetArena | 1st | Pass 1+2 ✅ | **Likely confirmed** |
| Coding Agent | text-2-sql | 2nd | Pass 1+2+3 ✅ | **Likely confirmed** |
| Coding Agent | **Terminal-Bench 2.0** | Unknown | **Pass 1 below** ⚠️ | **NEW — unconfirmed** |

### ICU-Later: EXCLUDE from Sprint 3 planning

Healthcare is not a Sprint 3 track. The `external/icu-later` submodule remains in `.gitmodules` as an archive but should not be targeted in the Sprint 3 implementation plan.

---

## Terminal-Bench 2.0 — New Sprint 3 Candidate (Pass 1)

**Repos:** `jngan00/terminal-bench-2-0-green-agent` (AgentBeats), `harbor-framework/terminal-bench` (base benchmark)
**Leaderboard:** `RDI-Foundation/terminal-bench-leaderboard`
**Discovery:** Found via AgentBeats dashboard activity log — listed alongside Sprint 2 repos, sprint assignment unconfirmed.

### What it is

Terminal-Bench 2.0 is a benchmark for AI agents performing **real-world terminal and system tasks** — compiling code, training ML models, setting up servers, filesystem operations, and package management. Built by the Harbor framework team, launched 2026.

**~100 tasks** in the current dataset (`terminal-bench-core v0.1.1`), with expansion planned.

### Infrastructure

**Barrier: LOW (1–2).** The entire evaluation runs inside a **Docker container** via the `tb` CLI. No VM, no K8s, no GPU required. This is the same sandboxed execution environment LogoMesh already uses for code evaluation.

```bash
tb run --agent <purple_agent> --model anthropic/claude-3-7-latest \
    --dataset-name terminal-bench-core --dataset-version 0.1.1
```

### Task structure

Each task has:
- An **English instruction** describing the goal (e.g., "Set up a Flask web server on port 5000 that returns 'Hello World'")
- A **test script** that validates completion (binary pass/fail via automated checks)
- A **reference solution** (not available to the agent)

The agent receives the instruction, has access to a sandboxed terminal, and must issue commands to satisfy the test script.

### Scoring

**Type I — Pure Deterministic.** Binary pass/fail per task, evaluated by automated test scripts against the final container state. No LLM judge. No partial credit.

**Score = passed_tasks / total_tasks**

### Output adapter

**Cluster B / hybrid.** The agent issues terminal commands in response to text instructions. The AgentBeats A2A wrapper presents this as a text-in, text-out conversation where the agent's responses are executed as commands in the Docker harness. This is structurally similar to LogoMesh's own code sandbox.

### LogoMesh fit: HIGH

LogoMesh already has:
- Docker sandbox execution
- Code analysis and generation capability
- File system interaction (read/write)
- Multi-step reasoning for complex tasks

**Expected score: 65–70.** Subject to Pass 2+3 analysis once the green agent repo is confirmed in Sprint 3.

---

## AgentProbe — Sprint 3 Candidate (Pass 1, Low Confidence)

**Repo:** `ymiled/agentprobe` (AgentBeats activity), likely based on `alexmelges/agentprobe`
**Track:** Unknown — possibly Cybersecurity or Agent Safety

AgentProbe tests agents against adversarial attacks: prompt injection, data exfiltration, permission escalation, output manipulation, and multi-agent attack vectors (134+ attacks). Tests whether the Purple Agent resists adversarial inputs. Structurally similar to NAAMSE. Sprint assignment unconfirmed.

---

## Sprint 3 Roster Summary

**Confirmed targets (based on Phase 1 track winners):**

| Repo | Track | Adapter | Fit | Score ceiling |
|:-----|:------|:--------|:----|:-------------|
| RCAbench | Cybersecurity | A (file write) | HIGH | 70 |
| AVER | Agent Safety | C (multi-turn) | HIGH | 80 |
| text-2-sql | Coding Agent | B (JSON) | HIGH | 85 |
| Pi-Bench | Agent Safety | F (policy trace) | MEDIUM | 55 |
| NetArena | Coding Agent | E floor | LOW | 20 |

**Potential additions (unconfirmed):**

| Repo | Track | Adapter | Fit | Score ceiling |
|:-----|:------|:--------|:----|:-------------|
| Terminal-Bench 2.0 | Coding Agent? | B/hybrid | HIGH | 70 |
| AgentProbe | Cybersecurity? / Safety? | Unknown | MEDIUM | TBD |

**Removed from plan (compared to prior analysis):**

| Repo | Reason |
|:-----|:-------|
| ICU-Later | Healthcare not in Sprint 3 |
| AgentSWE | Software Testing not in Phase 2 |
| LogoMesh-self | Not a Phase 2 competition target |
