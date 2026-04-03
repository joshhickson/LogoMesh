> **Status:** ACTIVE
> **Type:** Research
> **Context:**
> *   [2026-04-02]: Combined Sprint 3 roster verification and Sprint 4 initial pass. Written after confirming the official Phase 2 schedule on rdi.berkeley.edu/agentx-agentbeats.html and cross-referencing against the AgentBeats dashboard (agentbeats.dev).

# Sprint 3 Roster Verification + Sprint 4 Initial Analysis

## Sprint 3 (April 13 – May 3, tentative)

### Official track list

The Berkeley RDI website lists Sprint 3 as **tentative** with three tracks:
- Agent Safety
- Coding Agent
- Cybersecurity Agent

**Healthcare is NOT listed for Sprint 3.** ICU-Later and all FHIR-based benchmarks are excluded from active Sprint 3 planning.

### Repo roster status

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

**Cluster B / hybrid.** The agent issues terminal commands (bash) in response to text instructions. The AgentBeats A2A wrapper likely presents this as a text-in, text-out conversation where the agent's text outputs are executed as commands. This is close to Cluster B (JSON response) or may use a new "command execution" pattern.

**Important:** If Terminal-Bench 2.0 uses the same A2A `message/send` protocol, the Purple Agent's output is a text response containing commands, and the green agent's Docker harness executes them. This is structurally similar to AgentSWE's bash mode and LogoMesh's own code sandbox — significant overlap with existing capability.

### LogoMesh fit: HIGH

LogoMesh already has:
- Docker sandbox execution
- Code analysis and generation capability
- File system interaction (read/write)
- Multi-step reasoning for complex tasks

Terminal tasks (file manipulation, server setup, package installation) are directly adjacent to LogoMesh's core capabilities. This is the highest-fit potential Sprint 3 target that isn't in our existing analysis.

**Expected score: 65–70.** Subject to Pass 2+3 analysis once the green agent repo is confirmed in Sprint 3.

---

## AgentProbe — Sprint 3 Candidate (Pass 1, Low Confidence)

**Repo:** `ymiled/agentprobe` (AgentBeats activity), likely based on `alexmelges/agentprobe`
**Track:** Unknown — possibly Cybersecurity or Agent Safety

### What it is

AgentProbe tests agents against adversarial attacks: prompt injection, data exfiltration, permission escalation, output manipulation, and multi-agent attack vectors (134+ attacks in the `alexmelges/agentprobe` version). It tests whether the Purple Agent resists adversarial inputs.

This is structurally similar to NAAMSE (Agent Safety track, Phase 1) which also tests adversarial robustness.

**Note:** The `ymiled/agentprobe` on AgentBeats may be a different implementation from `alexmelges/agentprobe`. Sprint assignment unconfirmed.

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

**Potential additions (unconfirmed for Sprint 3):**

| Repo | Track | Adapter | Fit | Score ceiling |
|:-----|:------|:--------|:----|:-------------|
| Terminal-Bench 2.0 | Coding Agent? | B/hybrid | HIGH | 70 |
| AgentProbe | Cybersecurity? / Safety? | Unknown | MEDIUM | TBD |

**Removed from Sprint 3 (compared to prior plan):**

| Repo | Reason |
|:-----|:-------|
| ICU-Later | Healthcare not in Sprint 3 |
| AgentSWE | Software Testing not in Phase 2 |
| LogoMesh-self | Not a Phase 2 competition target |

---

## Sprint 4 — General Purpose Agents (May 4–24)

### Status: No repos announced

The Berkeley RDI website describes Sprint 4 as "General Purpose Agents — the grand finale." The description emphasizes **breadth over depth**: testing broad capability, adaptability, and robustness across diverse tasks rather than a single domain.

No specific repos or benchmarks have been announced for Sprint 4 as of April 2, 2026.

### Strategic implications

Sprint 4's "general purpose" framing suggests one of two structures:
1. **Multi-benchmark aggregation** — agents score across a combination of Sprint 1–3 benchmarks, rewarding teams that built generalized adapters rather than single-track specialists
2. **New general-purpose benchmarks** — new repos specifically testing cross-domain reasoning (e.g., GAIA-style, mixed-task benchmarks)

If Structure 1, the optimal path for Sprint 4 is the same as the Sprint 3 path — build a Purple Agent that can handle multiple adapter types. The generalization work we're doing now directly prepares for Sprint 4.

If Structure 2, Sprint 4 preparation must wait until the repos are announced (likely 1–2 weeks before Sprint 3 ends, mid-to-late April).

### Action: Monitor

No implementation action possible yet. Watch for Sprint 4 announcement on:
- rdi.berkeley.edu/agentx-agentbeats.html
- agentbeats.dev dashboard
- AgentBeats GitHub org (github.com/RDI-Foundation)

Update this document when Sprint 4 repos are confirmed.
