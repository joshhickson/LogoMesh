---
status: ACTIVE
type: Plan
---

> **Context:**
> * [2026-01-15]: C-NEW-001 Model Diversity Test completed with aggregate results. Intent to validate agentic reasoning hypothesis through component-level analysis before Stage 3 launch.
> **Parent Documents:**
>    - [20260115-C-NEW-001-FINAL-RESULTS.md](./20260115-C-NEW-001-FINAL-RESULTS.md) (Aggregate results)
>    - [20260114-Model-Selection-for-CIS-Validation.md](./20260114-Model-Selection-for-CIS-Validation.md) (Model selection rationale & agentic reasoning hypothesis)
>    - [MASTER-ACTION-ITEM-INDEX.md](./MASTER-ACTION-ITEM-INDEX.md) (Action item tracking)
> **Related:**
>    - [config/STAGE3_PRE_LAUNCH_CHECKLIST.md](../../../config/STAGE3_PRE_LAUNCH_CHECKLIST.md) (Launch gates)

---

## Strategic Objective

**Gap Identified:** C-NEW-001 validated that CIS differentiates models (aggregate scores: Mistral 0.569, Qwen 0.667, gpt-oss 0.643), but **did not quantify whether CIS evaluates agentic multi-step reasoning capabilities** as theoretically promised in the model selection report.

**Core Hypothesis Not Yet Tested:**
The model selection report explicitly argued that:
- **Tier 1 (Mistral-7B):** Low Architecture (A) & Testing (T) scores (architectural ignorance)
- **Tier 2 (Qwen-32B):** High Logic (L) scores but implicit reasoning (acts correctly without explicit thinking)
- **Tier 3 (gpt-oss-20b):** High Requirements (R) scores via explicit Harmony CoT (`<|channel|analysis>`—"thinks before it acts")

**The Critical Question:**
> "Can CIS reward a model that **'thinks before it acts'** (Tier 3/gpt-oss) over a model that simply **'acts correctly'** (Tier 2/Qwen)?"

**Current Status:** Unknown. We have aggregate CIS (R+A+T+L) but no breakdown of individual component scores by model.

---

## Analysis Intent

### Phase 1: Component Breakdown Extraction

**Objective:** Extract mean R, A, T, L scores for each tier from the C-NEW-001 database results.

**Data Sources:**
- `data/battles_tier1_mistral.db`
- `data/battles_tier2_qwen.db`
- `data/battles_tier3_gptoss.db`

**Metrics to Extract:**
| Component | Definition | Expected Mistral | Expected Qwen | Expected gpt-oss |
|:---|:---|:---|:---|:---|
| **R (Requirements)** | Intent-code alignment + explicit reasoning traces | Low (0.40-0.50) | Medium (0.50-0.60) | **High (0.60-0.70)** due to Harmony CoT |
| **A (Architecture)** | Structural soundness + constraint compliance | **Low (0.40-0.50)** | High (0.70-0.80) | High (0.70-0.80) |
| **T (Testing)** | Test quality + edge case coverage | **Low (0.40-0.50)** | High (0.70-0.80) | High (0.70-0.80) |
| **L (Logic)** | Correctness + syntax validity | Medium (0.50-0.60) | **High (0.80-0.90)** | High (0.80-0.90) |

**Analysis Questions:**
1. Do component means follow expected patterns? (A/T should separate Mistral from others; R should separate gpt-oss from Qwen)
2. Is the R score difference between Qwen and gpt-oss statistically significant? (t-test, p < 0.05)
3. Does gpt-oss's Harmony protocol (explicit reasoning) correlate with higher R scores?
4. Can we quantify the "thinking before acting" advantage?

### Phase 2: Harmony Protocol Verification (gpt-oss only)

**Objective:** Validate that gpt-oss battles actually utilized Harmony format and that R dimension captured the reasoning quality.

**Data to Check:**
- How many of 25 gpt-oss battles output in Harmony format (`<|channel|analysis>` + `<|channel|final>`)?
- Was the `<|channel|analysis>` content parsed for R (Requirements) scoring?
- Did battles without Harmony format get penalized in R scoring?

**Expected Finding:** If gpt-oss's higher R score is driven by proper Harmony parsing, then R_gpt-oss should be significantly higher than R_qwen. If R scores are equal, the Harmony advantage didn't materialize.

### Phase 3: Statistical Validation

**Objective:** Quantify differences and test significance.

**Tests:**
1. **ANOVA** across tiers for each component: Does R differ significantly by model? (F-test)
2. **Pairwise t-tests** (Welch's): Is R_gpt-oss vs R_qwen significantly different?
3. **Effect size** (Cohen's d): How large is the difference practically?
4. **Component correlation**: Does higher R in gpt-oss correlate with higher overall CIS?

**Success Criteria:**
- ✅ **If R_gpt-oss > R_qwen (p < 0.05):** Harmony CoT advantage validated; agentic reasoning hypothesis supported
- ⚠️ **If R_gpt-oss ≈ R_qwen (p > 0.05):** Harmony advantage did not materialize; needs investigation
- ❌ **If R_gpt-oss < R_qwen:** Unexpected; suggests gpt-oss's reasoning traces are lower quality

### Phase 4: Reporting & Stage 3 Decision

**Objective:** Document findings and decide Stage 3 readiness.

**Deliverable:** Component analysis report answering:
1. Does CIS component breakdown match theoretical expectations?
2. Did gpt-oss's "thinking before acting" yield measurable advantage in R?
3. Is the CIS metric valid for measuring agentic reasoning capabilities?

**Stage 3 Implications:**
- **If validated:** Proceed to Stage 3 with confidence that CIS evaluates agentic multi-step reasoning
- **If partially validated:** Proceed to Stage 3 but flag that agentic reasoning component may need recalibration
- **If invalidated:** May need formula adjustment or additional validation before launch

---

## Implementation Plan

### Timeline
- **Analysis extraction:** 15 minutes (SQL queries + aggregation)
- **Harmony protocol check:** 10 minutes (inspect gpt-oss battle logs)
- **Statistical tests:** 10 minutes (t-tests, ANOVA)
- **Report writing:** 10 minutes (summary of findings)
- **Total:** ~45 minutes

### Deliverables
1. Component breakdown table (R/A/T/L means by tier)
2. Statistical test results (p-values, effect sizes)
3. Harmony protocol validation summary
4. Decision recommendation for Stage 3

### Execution Owner
Josh (or delegated to GitHub Copilot for analysis + report generation)

---

## Rationale for This Analysis

**Why this matters for Stage 3:**

Stage 3 will generate 200+ battles and claim CIS validates agentic AI quality. If we launch without understanding whether CIS actually measures "agentic reasoning" vs just "coding correctness," we risk:

1. **Publishing claims we can't defend:** "CIS differentiates model quality" ✓ but "CIS measures agentic reasoning" ✗
2. **Missing feedback loops:** If component breakdown is wrong, Stage 3 data won't capture the evidence needed to fix it
3. **Judge skepticism:** Competition judges may ask "Does R really measure intent alignment?" and we should have quantified answer

**Why 45 minutes of analysis saves 8 hours of Stage 3 execution:**

If component analysis reveals problems (e.g., R scores are identical across tiers), we can fix the scoring formula NOW rather than collecting 200 battles with a broken hypothesis. This is cheap pre-validation.

---

## Decision Gate

**Go/No-Go for Component Analysis:**
- ✅ **Proceed** (Recommended): Execute 45-minute analysis before Stage 3 launch
- ❌ **Skip**: Accept aggregate results; proceed to Stage 3 with theoretical validation deferred to post-hoc analysis

**Recommended:** Proceed. The analysis is fast and the insight is high-value.

---

## Document Status

**Current State:** Intent document (this file)

**Next States:**
1. **ANALYSIS UNDERWAY** - Analysis script executing
2. **RESULTS READY** - Component breakdown extracted; statistical tests computed
3. **REPORT PUBLISHED** - Final analysis document created; decision made on Stage 3 readiness

**Estimated Completion:** 2026-01-15 06:00 UTC (45 min from now)

---

**Linked to:** [MASTER-ACTION-ITEM-INDEX.md](./MASTER-ACTION-ITEM-INDEX.md) → Phase C-NEW-001 (Model Diversity Test) → NEW: Component analysis validation step

