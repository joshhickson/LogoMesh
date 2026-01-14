---
status: ACTIVE
type: Guide
---
> **Context:**
> *   [2026-01-14]: Quick navigation guide for project documentation
> **Purpose:** Help users understand the document structure and find what they need

---

# 📚 LogoMesh Documentation Quick Start

Welcome! This folder contains comprehensive documentation for the LogoMesh project's Stage 2 Campaign (77 battles) and Stage 3 preparation (100+ battles). Here's what you need:

---

## 🎯 What Do You Need?

### If You're Josh (Project Lead)

**Your Reading Order:**
1. **[MASTER-ACTION-ITEM-INDEX.md](./MASTER-ACTION-ITEM-INDEX.md)** — Live checklist of remaining work items (15 min read)
2. **[STAGE3_PRE_LAUNCH_CHECKLIST.md](../../../config/STAGE3_PRE_LAUNCH_CHECKLIST.md)** — What needs to happen before launch (10 min read)
3. **[Distribution_Protocol.md](../../../validation/Distribution_Protocol.md)** — How to recruit and manage experts (15 min read)

**Your Next Action:** Start C-005 (Expert Recruitment) using Distribution_Protocol

---

### If You're an Expert Reviewer (Validating CIS Formula)

**Status:** Changed to LLM-as-Judge approach (no human recruitment)

**Your role as context provider:**
- [EXPERT-LETTER.md](./EXPERT-LETTER.md) now serves as system prompt for Claude/GPT
- Used in C-NEW-002 validation study
- No longer seeking human expert reviewers

---

### If You're Reviewing Project Progress

**Your Reading Order:**
1. **[MASTER-ACTION-ITEM-INDEX.md](./MASTER-ACTION-ITEM-INDEX.md)** — Current status (5 min scan)
   - Which items are complete?
   - Which items are blocked and why?
   - What's the timeline for remaining work?

2. **[Phase2-Action-Items-Implementation-20260114.md](./Phase2-Action-Items-Implementation-20260114.md)** — How Phase A/B were executed (30 min read)
   - A-001: CIS weight documentation
   - A-003: Architecture constraints system
   - A-004: Test specificity evaluation
   - B-001, B-002: Formula reweighting

3. **[Sprint-Session-20260114-Evening.md](./Sprint-Session-20260114-Evening.md)** — How Phase C/H/E were built (45 min read)
   - Phase C: Validation infrastructure (6 scripts + 2 guides)
   - Phase H: Red Agent integration (3 new files + scoring.py mods)
   - Phase E: Stage 3 preparation (config + checklist)

---

## 📂 Document Map

### Planning & Status
| Document | Purpose | Length | Read Time |
|:---|:---|:---|:---|
| **[MASTER-ACTION-ITEM-INDEX.md](./MASTER-ACTION-ITEM-INDEX.md)** | Live checklist + logistics | 314 lines | 15 min |
| **[STAGE3_PRE_LAUNCH_CHECKLIST.md](../../../config/STAGE3_PRE_LAUNCH_CHECKLIST.md)** | Launch gates & blockers | 304 lines | 10 min |
| **[EXPERT-LETTER.md](./EXPERT-LETTER.md)** | LLM Judge system prompt | 569 lines | (reference material) |

### Implementation Logs
| Document | Phase | Details | Length | Read Time |
|:---|:---|:---|:---|:---|
| **[Phase1-Yin-Campaign-20260113.md](./Phase1-Yin-Campaign-20260113.md)** | 1 | Campaign execution + Action Item origins | 2,155 lines | 90 min |
| **[Phase2-Action-Items-Implementation-20260114.md](./Phase2-Action-Items-Implementation-20260114.md)** | 2 | A-001 through A-004 implementation | 800 lines | 40 min |
| **[Sprint-Session-20260114-Evening.md](./Sprint-Session-20260114-Evening.md)** | 2 Evening | Phase C/H/E rapid execution | 2,000+ lines | 90 min |

### Expert Materials
| Document | Purpose | Length | Read Time |
|:---|:---|:---|:---|
| **[EXPERT-LETTER.md](./EXPERT-LETTER.md)** | Expert briefing & scoring instructions | 569 lines | 20 min |

### Technical References
| Document | Purpose |
|:---|:---|
| **[Red-Agent-Merge-Strategy-20260114.md](./Red-Agent-Merge-Strategy-20260114.md)** | Red Agent integration details (Phase H) |
| **[A2A-Streaming-Debug-Plan.md](./A2A-Streaming-Debug-Plan.md)** | Optional streaming enhancement research |
| **[A2A-Streaming-Prototype-Plan.md](./A2A-Streaming-Prototype-Plan.md)** | Optional streaming prototype approach |

---

## 🔄 Work Phases at a Glance

### ✅ Phase A (100% Complete)
- A-001: CIS weight formula documented
- A-002: Intent-code similarity diagnostic
- A-003: Architecture constraints YAML + scoring
- A-004: Test specificity pattern matching
- A-000: Email Validator task clarification

**Status:** Ready for validation

### ✅ Phase B (67% Complete)
- B-001: Logic Score anchored to tests
- B-002: Formula reweighted to 25-25-25-25
- B-003: Paper narrative (post-Stage 3)

**Status:** Core items complete

### ⏳ Phase C (0% Started) — NEW VALIDATION APPROACH
**Model Diversity Test + LLM-as-Judge:**
- C-NEW-001 ⏳: Model diversity experiment (Qwen vs alternatives)
- C-NEW-002 ⏳: LLM-as-Judge validation (Claude/GPT rates submissions)
- C-NEW-003 ⏳: Validation report & decision

**Status:** Research phase (selecting models for diversity test)

### ✅ Phase H (100% Complete) — Red Agent Integration
- H-001 ✅: Code review complete
- H-002 ✅: Merge strategy documented
- H-003 ✅: Report parser extracted
- H-004 ✅: Penalties integrated into scoring
- H-005 ✅: End-to-end validation passed

**Status:** Ready for Stage 3

### ✅ Phase E (50% Complete) — Stage 3 Prep
- E-001 ✅: Campaign config created
- E-002 ✅: Pre-launch checklist created
- E-003 ⏳: Final checklist review (awaits Phase C)
- E-004 ⏳: Launch decision (awaits Phase C)

**Status:** Blocked on Phase C validation results

### ✅ Phase G (100% Complete)
- G-001 ✅: Paper versioning protocol

**Status:** Complete

---

## 🚀 Critical Path to Stage 3

```
NOW: Research models for diversity test
  ↓
C-NEW-001: Run model diversity experiment (load alternative models in vLLM)
  ↓
C-NEW-002: LLM-as-Judge validation (Claude/GPT rates submissions)
  ↓
C-NEW-003: Analysis & validation report
  ↓
Decision: Validation pass or fail?
  ├─ YES → E-003/E-004 (Final checks → Launch Stage 3)
  └─ NO → Phase D (Re-score & refine formula)
```

---

## 📋 Immediate Next Steps

### For Josh

1. **Research Model Diversity Options**
   - Which models best represent quality spectrum?
   - Current: Qwen baseline
   - Candidates: Claude, GPT-4o, O1-mini?
   - Budget/API constraints?

2. **Design C-NEW-001 Experiment**
   - Which models to load in vLLM?
   - How many battles per model?
   - Expected outcome: CIS should differentiate model quality

3. **Prepare C-NEW-002 Setup**
   - Confirm Claude/GPT API access
   - Test [EXPERT-LETTER.md](./EXPERT-LETTER.md) as system prompt
   - Prepare submission batch format (JSON)

4. **Start C-NEW-001 Execution**
   - Load alternative model weights into vLLM
   - Run battle comparisons
   - Collect CIS scores by model

---

## 🎯 Key Metrics & Success Criteria

### Phase C Validation Must Pass:
- **C-NEW-001 Success:** CIS differentiates model quality levels
  - Weaker model → lower CIS scores
  - Stronger model → higher CIS scores
  
- **C-NEW-002 Success:** LLM judge correlates with CIS
  - Pearson r(LLM ratings, CIS scores) ≥ 0.70
  - LLM reasoning aligns with R, A, T, L dimensions

**If Passed:** Proceed directly to Stage 3 launch

**If Failed:** Execute Phase D (re-score Stage 2) and refine formula

---

## 📞 Key Contact Points

### For Progress Updates
- See: [MASTER-ACTION-ITEM-INDEX.md](./MASTER-ACTION-ITEM-INDEX.md)
- Last Updated: 2026-01-14 23:45 UTC

### For Expert Logistics
- See: [Distribution_Protocol.md](../../../validation/Distribution_Protocol.md)
- Questions to answer: recruitment channels, compensation, timeline

### For Technical Details
- Phase A/B: [Phase2-Action-Items-Implementation-20260114.md](./Phase2-Action-Items-Implementation-20260114.md)
- Phase C/H/E: [Sprint-Session-20260114-Evening.md](./Sprint-Session-20260114-Evening.md)
- Red Agent: [Red-Agent-Merge-Strategy-20260114.md](./Red-Agent-Merge-Strategy-20260114.md)

---

## ✨ Quick Wins for Continued Progress

**While Researching Models (C-NEW-001 prep):**
- Review model candidates (Claude, GPT-4o, O1-mini)
- Confirm vLLM compatibility for alternative models
- Assess budget & API rate limit constraints
- Test [EXPERT-LETTER.md](./EXPERT-LETTER.md) as system prompt

**While Running Model Diversity Test (C-NEW-001):**
- Continue Phase F (optional: A2A streaming optimization)
- Polish Stage 3 configuration
- Prepare LLM judge JSON output format

---

## 🏁 How This All Connects

```
PHASE 1: Campaign Execution
   ↓
PHASE 2: Formula Enhancement (A-001 through A-004)
   ↓
PHASE C: Expert Validation (Infrastructure + Workflow) ← YOU ARE HERE
   ↓
PHASE H: Red Agent Integration (Already Complete)
   ↓
PHASE E: Stage 3 Launch Decision
   ↓
STAGE 3: Full Campaign (100+ battles)
   ↓
PUBLICATION: Paper with Validated Findings
```

**All foundational work is complete.** Next major gate is Phase C model diversity + LLM judge validation, then Stage 3 launch is possible.

---

**Questions?** Start with [MASTER-ACTION-ITEM-INDEX.md](./MASTER-ACTION-ITEM-INDEX.md) or the specific implementation log (Phase 1/2/Sprint) matching your interest.

**Good luck! 🚀**
