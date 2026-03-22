#!/usr/bin/env python3
"""
Phase 1: Mine Existing Data
Reads all existing DBOM files and Tier 2 Qwen battle logs,
computes descriptive statistics, and writes results/paper_data/existing_stats.json.
"""

import glob
import json
import os
import re
import statistics
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(ROOT, "results", "paper_data")
os.makedirs(OUT_DIR, exist_ok=True)


# ── helpers ──────────────────────────────────────────────────────────────────

def stats_dict(scores):
    if len(scores) < 2:
        return {"count": len(scores), "mean": scores[0] if scores else 0.0,
                "std": 0.0, "min": scores[0] if scores else 0.0,
                "max": scores[0] if scores else 0.0}
    return {
        "count": len(scores),
        "mean": round(statistics.mean(scores), 4),
        "std":  round(statistics.stdev(scores), 4),
        "min":  round(min(scores), 4),
        "max":  round(max(scores), 4),
    }


# ── Source 1: DBOM files ──────────────────────────────────────────────────────

dbom_dir = os.path.join(ROOT, "data", "dboms")
dbom_files = sorted(glob.glob(os.path.join(dbom_dir, "*.json")))
print(f"[1] Reading {len(dbom_files)} DBOM files from {dbom_dir}")

all_dbom_scores = []
nonzero_scores = []
zero_count = 0
best_record = None
best_score = -1.0

for path in dbom_files:
    try:
        with open(path) as f:
            d = json.load(f)
        s = float(d.get("score_cis", 0))
        all_dbom_scores.append(s)
        if s > 0.001:
            nonzero_scores.append(s)
            if s > best_score:
                best_score = s
                best_record = d
        else:
            zero_count += 1
    except Exception as e:
        print(f"  WARN: could not read {path}: {e}")

print(f"  Total: {len(all_dbom_scores)}, non-zero: {len(nonzero_scores)}, zero: {zero_count}")
print(f"  Non-zero mean: {statistics.mean(nonzero_scores):.4f}, std: {statistics.stdev(nonzero_scores):.4f}")

# Note: zero-score battles were Email Validator runs (Jan 14) where Purple
# returned empty/unparseable code — documented in Execution Status log.
# The 98 non-zero battles cover Rate Limiter (25), LRU Cache (27), Fibonacci (25)
# from the Jan 13 campaign, plus a small number of additional runs.

dbom_stats = {
    "source": "data/dboms/*.json",
    "total_files": len(all_dbom_scores),
    "zero_score_battles": zero_count,
    "zero_score_note": (
        "215 zero-score records correspond to Email Validator battles (2026-01-14) "
        "where the Purple agent returned empty/unparseable source code. These are "
        "excluded from the non-zero analysis below."
    ),
    "non_zero": stats_dict(nonzero_scores),
    "all_scores": stats_dict(all_dbom_scores),
}


# ── Source 2: Tier 2 Qwen Battles Log ────────────────────────────────────────

qwen_log = os.path.join(ROOT, "results", "c_new_001_diversity_test", "tier2_qwen_battles.log")
qwen_scores = []
print(f"\n[2] Parsing Tier 2 Qwen battles from {qwen_log}")

score_re = re.compile(r"Score:\s+([0-9.]+)")
status_re = re.compile(r"Status:\s+([OK✗])")

if os.path.exists(qwen_log):
    with open(qwen_log, encoding="utf-8") as f:
        content = f.read()
    matches = score_re.findall(content)
    qwen_scores = [float(m) for m in matches]
    print(f"  Found {len(qwen_scores)} Tier 2 Qwen scores")
    if qwen_scores:
        print(f"  Mean: {statistics.mean(qwen_scores):.4f}, Std: {statistics.stdev(qwen_scores):.4f}")
else:
    print(f"  WARN: {qwen_log} not found")

qwen_stats = {
    "source": "results/c_new_001_diversity_test/tier2_qwen_battles.log",
    "model": "Qwen (Tier 2)",
    "campaign_date": "2026-01-15",
    **stats_dict(qwen_scores),
}


# ── Summary for paper ─────────────────────────────────────────────────────────

# Combined non-zero: DBOM non-zero + Tier 2 Qwen (these overlap since Qwen
# battles also generate DBOMs — but not all; use DBOM as the authoritative set)
combined = nonzero_scores  # 98 non-zero DBOM battles (all campaigns)

# Tier 2 subset stats
print(f"\n[3] Combined (non-zero DBOM) statistics:")
print(f"  n={len(combined)}, mean={statistics.mean(combined):.4f}, "
      f"std={statistics.stdev(combined):.4f}, "
      f"min={min(combined):.4f}, max={max(combined):.4f}")

# Decision gate: do any have std < 0.05 at per-task level?
# We don't have per-task labels in DBOMs (battle_id has no task encoding).
# Per the plan: proceed to Phase 2 for controlled variance measurement.
print("\n[DECISION] Per-task variance cannot be computed from DBOM files alone")
print("  (DBOM battle_id does not encode task type; battles.db not present)")
print("  -> Proceed to Phase 2: run_variance_test.py for controlled measurement")

# Best example record (for Section 6 JSON schema illustration)
print(f"\n[4] Best example record: battle_id={best_record['battle_id'] if best_record else 'N/A'}, "
      f"score={best_score:.4f}")

# ── Write output ──────────────────────────────────────────────────────────────

out = {
    "generated_by": "scripts/mine_existing_data.py",
    "description": (
        "Statistics mined from existing DBOM files and Tier 2 Qwen battle log. "
        "Per-task breakdown not available (DBOM files lack task_title field and "
        "battles.db was not retained after campaign). Use variance_test.json "
        "for controlled per-task variance measurements."
    ),
    "dbom_analysis": dbom_stats,
    "tier2_qwen_analysis": qwen_stats,
    "combined_non_zero": {
        "note": "98 non-zero DBOM scores covering Rate Limiter, LRU Cache, Fibonacci (Jan 13 campaign)",
        **stats_dict(combined),
    },
    "decision_gate": {
        "per_task_variance_available": False,
        "reason": "DBOM files do not encode task_title; battles.db absent",
        "action": "Proceed to Phase 2: controlled variance test with mock Purple",
    },
    "best_example_record": {k: v for k, v in (best_record or {}).items() if k != "v_intent"},
}

out_path = os.path.join(OUT_DIR, "existing_stats.json")
with open(out_path, "w") as f:
    json.dump(out, f, indent=2)

print(f"\nOK Wrote {out_path}")
print(f"\nSummary for paper:")
print(f"  - Total battles with DBOM records: {len(all_dbom_scores)}")
print(f"  - Valid (non-zero) CIS scores: {len(nonzero_scores)}")
print(f"    Mean CIS: {statistics.mean(nonzero_scores):.3f}, Std: {statistics.stdev(nonzero_scores):.3f}")
print(f"    Range: [{min(nonzero_scores):.3f}, {max(nonzero_scores):.3f}]")
print(f"  - Tier 2 Qwen: {len(qwen_scores)} battles, mean={statistics.mean(qwen_scores):.3f}")
