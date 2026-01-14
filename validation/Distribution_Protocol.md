---
status: DEPRECATED
type: Guide
---
> **Context:**
> *   [2026-01-14]: Distribution protocol for CIS expert validation study (Phase C workflow)
> **Status:** DEPRECATED - Project pivoted to Model Diversity + LLM-as-Judge approach (C-NEW-001, C-NEW-002, C-NEW-003)
> **Superseded By:** New validation strategy in [MASTER-ACTION-ITEM-INDEX.md](../docs/04-Operations/Intent-Log/Josh/MASTER-ACTION-ITEM-INDEX.md)
> **Parent Document:** [Phase1-Yin-Campaign-20260113.md](../docs/04-Operations/Intent-Log/Josh/Phase1-Yin-Campaign-20260113.md)
> **Note:** Infrastructure preserved for future human expert validation if needed post-Stage 3

---

# Expert Validation Distribution Protocol (C-006) [DEPRECATED]

**⚠️ This workflow is no longer active. Project now uses automated Model Diversity + LLM-as-Judge validation.**

## Overview

This document defines the workflow for distributing validation packets to expert reviewers and collecting responses.

## Preparation (Before Distribution)

### 1. Sample Selection
```bash
# Run C-002 script to select 25 battles
python validation/scripts/select_samples.py \
  --db "data/dboms/dbom_auto_*.json" \
  --output validation/samples/selected_battles.json \
  --per-bucket 5 \
  --seed 42
```

**Output:** `validation/samples/selected_battles.json`

**Validation:** Confirm 25 battles selected with stratified CIS distribution

---

### 2. Packet Generation
```bash
# Run C-003 script to generate anonymized packets
python validation/scripts/generate_packets.py \
  --samples validation/samples/selected_battles.json \
  --output validation/packets/
```

**Outputs:**
- `validation/packets/B001.json` through `B025.json` (individual battles)
- `validation/packets/rating_form.json` (template for expert ratings)
- `validation/packets/packet_manifest.json` (de-anonymization key - KEEP PRIVATE)
- `validation/packets/EXPERT_RATING_INSTRUCTIONS.md` (instructions)

**Validation:** Review rating_form.json for completeness

---

## Expert Recruitment

### Target Profile
- **Required:**
  - 5+ years professional SWE experience
  - Code review experience
  - Python proficiency
  - No prior CIS knowledge
- **Preferred:**
  - Senior/Staff engineer level
  - Experience with multiple languages/frameworks
  - Testing/QA background

### Recruiting Channels
1. **Professional Network:** LinkedIn, former colleagues
2. **Developer Communities:** Local meetups, Slack/Discord groups
3. **Freelance Platforms:** Upwork, Toptal (verified experts)
4. **University Connections:** CS faculty, PhD students (ABD)

### Compensation Structure
- **Base:** $80 (2 hours @ $40/hr)
- **Bonus:** +$40 if completed within 48 hours
- **Maximum:** $120 per reviewer

### Target: 2-3 Expert Reviewers
**Rationale:** 
- 2 minimum for inter-rater agreement (Cohen's Kappa)
- 3 preferred for triangulation and tie-breaking
- Cost: $240-360 total

---

## Distribution Workflow

### Step 1: Initial Contact (Email/Message)
```
Subject: Expert Code Review Study - $80-120 Compensation

Hi [Name],

I'm conducting a validation study for an automated code quality metric 
and would value your expert opinion as a senior engineer.

**Task:** Review 25 code submissions and rate them on 4 dimensions
**Time:** ~2-3 hours (5-7 min per submission)
**Compensation:** $80 base + $40 bonus for 48h completion
**Format:** JSON file with ratings (0.00-1.00 scale)

Submissions are anonymized (no AI/model names visible). Your ratings 
will be used to validate correlation between automated scores and 
human expert judgment.

Interested? Reply and I'll send the packet + instructions.

Thanks,
[Your name]
```

### Step 2: Send Packet (Upon Confirmation)
**Attach/Share:**
1. `EXPERT_RATING_INSTRUCTIONS.md` (instructions)
2. `rating_form.json` (template to fill out)
3. `B001.json` through `B025.json` (battle data) OR zip file

**Delivery Method:** 
- Email attachments (if < 5MB)
- Google Drive / Dropbox shared folder
- GitHub private repo invite

**Subject Line:** "Validation Packet - Review by [Date]"

---

### Step 3: Follow-Up Schedule
- **T+24h:** Check-in email (answer questions, confirm receipt)
- **T+48h:** Reminder if incomplete (bonus expires soon)
- **T+72h:** Final reminder
- **T+96h:** If no response, recruit replacement expert

---

### Step 4: Collection
**Expert returns:** Completed `rating_form.json` with all battles rated

**Save to:** `validation/responses/expert1_ratings.json` (rename with expert ID)

**Validation Checklist:**
- [ ] All 25 battles have ratings
- [ ] All 4 dimensions (R, A, T, L) rated per battle
- [ ] Ratings are in valid range (0.00-1.00, increments of 0.25)
- [ ] JSON is valid (can be parsed)
- [ ] Expert qualification info attached

**On Receipt:**
1. Send thank-you email
2. Confirm payment processing (Venmo/PayPal/Zelle)
3. Save to responses/ directory
4. Update tracking spreadsheet

---

## Quality Control

### Red Flags (Potential Issues)
- **Clustering:** All ratings around 0.50 (not using full scale)
- **Perfect correlation:** All dimensions identical for every battle
- **Time anomaly:** Completed in < 1 hour (may indicate skimming)
- **Invalid ranges:** Ratings outside 0.00-1.00
- **Missing data:** Incomplete ratings

### Response to Red Flags
1. Contact expert for clarification
2. Request revision if obvious errors
3. If quality concerns persist, exclude from analysis (don't pay bonus)
4. Recruit replacement expert

---

## Analysis Trigger

**When to proceed to C-008 (Analysis):**
- ✅ Minimum 2 expert responses collected
- ✅ Both responses pass quality control
- ✅ Response files saved to `validation/responses/`

**Then run:**
```bash
# C-008: Correlation analysis
python validation/scripts/analyze_correlations.py \
  --responses validation/responses/ \
  --manifest validation/packets/packet_manifest.json \
  --output validation/analysis/correlation_report.json

# C-009: Inter-rater agreement
python validation/scripts/analyze_agreement.py \
  --responses validation/responses/ \
  --output validation/analysis/agreement_metrics.json

# C-010: Failure mode extraction
python validation/scripts/extract_failure_modes.py \
  --responses validation/responses/ \
  --manifest validation/packets/packet_manifest.json \
  --output validation/analysis/failure_modes.json
```

---

## Timeline Estimate

| Phase | Duration | Notes |
|:---|:---|:---|
| Sample selection + packet generation | 1 hour | Automated scripts |
| Expert recruitment | 1-2 days | Depends on network |
| Expert review | 2-3 days | Parallel work |
| Collection + QC | 4 hours | Per expert |
| Analysis | 2 hours | Automated scripts |
| **Total** | **3-5 days** | Wall-clock time |

---

## Success Metrics

After analysis (C-008, C-009), validate:

1. **Correlation (C-008):**
   - Pearson r ≥ 0.70 for each CIS component vs expert rating
   - p-value < 0.05 (statistical significance)

2. **Agreement (C-009):**
   - Cohen's Kappa ≥ 0.60 (substantial agreement between experts)
   - ICC ≥ 0.70 (intraclass correlation coefficient)

3. **Error Analysis (C-010):**
   - MAE ≤ 0.15 per component (mean absolute error)
   - Documented failure mode patterns

**If metrics fail:** Iterate on CIS formula, re-score Stage 2, repeat validation

---

## Files Checklist

**Before Distribution:**
- [x] `validation/samples/selected_battles.json` (C-002 output)
- [x] `validation/packets/B001.json` ... `B025.json` (C-003 output)
- [x] `validation/packets/rating_form.json` (C-003 output)
- [x] `validation/packets/packet_manifest.json` (C-003 output, PRIVATE)
- [x] `validation/packets/EXPERT_RATING_INSTRUCTIONS.md` (C-004 output)
- [x] `validation/scripts/select_samples.py` (C-002 script)
- [x] `validation/scripts/generate_packets.py` (C-003 script)

**After Collection:**
- [ ] `validation/responses/expert1_ratings.json`
- [ ] `validation/responses/expert2_ratings.json`
- [ ] `validation/responses/expert3_ratings.json` (optional)

**After Analysis:**
- [ ] `validation/analysis/correlation_report.json` (C-008 output)
- [ ] `validation/analysis/agreement_metrics.json` (C-009 output)
- [ ] `validation/analysis/failure_modes.json` (C-010 output)
- [ ] `validation/reports/validation_report.md` (C-011 output)

---

## Contact Template (For Expert Questions)

```
Hi [Expert Name],

Thanks for your question about [topic].

[Answer]

A few clarifications:
- Rate each dimension independently (R, A, T, L don't need to match)
- sandbox_success is just context - rate the code quality itself
- Use the full scale (0.00-1.00) - avoid clustering around 0.50
- Comments are optional but helpful for understanding your reasoning

Let me know if you need anything else!

Best,
[Your name]
```

---

## Appendix: Scoring Reference (For Internal Use Only)

**Do NOT share with experts** (to avoid biasing their ratings)

Current CIS formula:
```
CIS = 0.25×R + 0.25×A + 0.25×T + 0.25×L
```

Where:
- R = cos(Intent, Rationale) - Rationale quality
- A = cos(Rationale, Code) × (1 - constraint_penalty) - Architecture quality
- T = cos(Code, Tests) × test_specificity - Testing quality  
- L = LLM Senior Code Review (anchored to sandbox results) - Logic correctness

Validation goal: Confirm these automated metrics correlate ≥ 0.70 with expert judgment.
