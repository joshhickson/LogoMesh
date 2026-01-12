---
status: ACTIVE
type: Audit
created: 2026-01-12
context: Competition / Lambda Track
---

# Lambda Submission Audit

**Date:** 2026-01-12
**Status:** 🟡 PARTIAL
**Team:** `logomesh`

## Artifact Compliance Matrix

| Scenario ID | Plugin (`plugin.py`) | Config (`scenario.toml`) | Docs (`README.md`) | Evidence (`test_results/`) | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **dockerdoo** | ✅ | ✅ | ✅ | ✅ | 🟢 READY |
| **solarspike** | ✅ | ✅ | ✅ | ✅ | 🟢 READY |
| **debugdump** | ✅ | ✅ | ✅ | ✅ | 🟢 READY |
| **ad_attack** | ✅ | ✅ (Copied) | ✅ (Created) | ❌ MISSING | 🟡 PENDING TEST |

## Findings & Actions

1.  **Consolidation Success:** All 4 scenarios are now correctly located in `scenarios/security_arena/submissions/logomesh/`.
2.  **AdAttack Gaps:**
    *   `scenario_ad_attack.toml` was found in the root and copied to the submission folder.
    *   `README.md` was missing and has been created.
    *   `test_results/` are empty. We need to run a test pass (once environment allows) to generate `baseline_passed.json` and `attack_succeeded.json`.

## Recommendation
The submission is technically valid for the **3 required scenarios** (`dockerdoo`, `solarspike`, `debugdump`). `ad_attack` is a "Bonus" scenario. We can submit with the 3 ready ones, or wait until we can run `ad_attack` to include it.
