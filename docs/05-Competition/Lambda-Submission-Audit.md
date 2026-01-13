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
| **ad_attack** | ✅ | ✅ (Copied) | ✅ (Created) | ❌ MISSING | 🟢 READY FOR EXECUTION |

## Findings & Actions

1.  **Consolidation Success:** All 4 scenarios are now correctly located in `scenarios/security_arena/submissions/logomesh/`.
2.  **AdAttack Status:**
    *   Scenario is fully ported and registered in `registry.py`.
    *   `README.md` and `scenario_ad_attack.toml` are present.
    *   **Execution:** Use `scripts/run_lambda_ad_attack.sh` to generate the missing `test_results/`.
    *   `test_results/` will remain empty until the environment allows for a `vLLM` run.

## Recommendation
The submission is technically valid for the **3 required scenarios** (`dockerdoo`, `solarspike`, `debugdump`). `ad_attack` is a "Bonus" scenario that is now **fully staged** and just requires a single execution run to be submission-ready.
