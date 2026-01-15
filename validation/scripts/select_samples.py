#!/usr/bin/env python3
"""
C-002: Sample Selection Script
Selects 25 battles from Stage 2 database stratified by CIS score range for expert validation.

Usage:
    python validation/scripts/select_samples.py --db data/dboms/dbom_auto_*.json --output validation/samples/selected_battles.json

Stratification:
    - 5 battles: CIS 0.00-0.20 (very low quality)
    - 5 battles: CIS 0.20-0.40 (low quality)
    - 5 battles: CIS 0.40-0.60 (medium quality)
    - 5 battles: CIS 0.60-0.80 (high quality)
    - 5 battles: CIS 0.80-1.00 (very high quality)

Selection Criteria:
    - Diverse task coverage (Email Validator, Rate Limiter, LRU Cache, Fibonacci)
    - Representative agent types (o1, claude-sonnet, gpt-4, qwen, etc.)
    - No duplicate battles (same agent + same task)
"""

import argparse
import glob
import json
import random
from pathlib import Path
from typing import List, Dict, Any
from collections import defaultdict


def load_dboms(pattern: str) -> List[Dict[str, Any]]:
    """Load all DBOM files matching pattern."""
    dbom_files = glob.glob(pattern)
    dboms = []
    
    for dbom_file in dbom_files:
        try:
            with open(dbom_file, 'r') as f:
                dbom = json.load(f)
                dboms.append(dbom)
        except Exception as e:
            print(f"Warning: Failed to load {dbom_file}: {e}")
    
    return dboms


def extract_battles(dboms: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Extract individual battles from DBOMs with CIS scores."""
    battles = []
    
    for dbom in dboms:
        for eval_record in dbom.get("evaluations", []):
            # Skip if no CIS score
            cis_score = eval_record.get("cis_score")
            if cis_score is None:
                continue
            
            battle = {
                "battle_id": eval_record.get("eval_id", "unknown"),
                "task_id": eval_record.get("task_id", "unknown"),
                "task_description": eval_record.get("task_description", ""),
                "agent_name": eval_record.get("agent_name", "unknown"),
                "model_name": eval_record.get("model_name", "unknown"),
                "cis_score": cis_score,
                "rationale_score": eval_record.get("rationale_score", 0.0),
                "architecture_score": eval_record.get("architecture_score", 0.0),
                "testing_score": eval_record.get("testing_score", 0.0),
                "logic_score": eval_record.get("logic_score", 0.0),
                "sandbox_success": eval_record.get("sandbox_result", {}).get("success", False),
                "rationale": eval_record.get("rationale", ""),
                "source_code": eval_record.get("source_code", ""),
                "test_code": eval_record.get("test_code", ""),
                "dbom_file": dbom.get("dbom_id", "unknown")
            }
            battles.append(battle)
    
    return battles


def stratify_by_cis(battles: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """Stratify battles into CIS score buckets."""
    buckets = {
        "0.00-0.20": [],
        "0.20-0.40": [],
        "0.40-0.60": [],
        "0.60-0.80": [],
        "0.80-1.00": []
    }
    
    for battle in battles:
        cis = battle["cis_score"]
        if cis < 0.20:
            buckets["0.00-0.20"].append(battle)
        elif cis < 0.40:
            buckets["0.20-0.40"].append(battle)
        elif cis < 0.60:
            buckets["0.40-0.60"].append(battle)
        elif cis < 0.80:
            buckets["0.60-0.80"].append(battle)
        else:
            buckets["0.80-1.00"].append(battle)
    
    return buckets


def select_diverse_sample(bucket: List[Dict[str, Any]], n: int, seed: int = 42) -> List[Dict[str, Any]]:
    """Select n battles from bucket with task/agent diversity."""
    if len(bucket) <= n:
        return bucket
    
    random.seed(seed)
    
    # Group by task for diversity
    by_task = defaultdict(list)
    for battle in bucket:
        by_task[battle["task_id"]].append(battle)
    
    # Select proportionally from each task
    selected = []
    tasks = list(by_task.keys())
    per_task = n // len(tasks)
    remainder = n % len(tasks)
    
    for i, task in enumerate(tasks):
        task_battles = by_task[task]
        count = per_task + (1 if i < remainder else 0)
        count = min(count, len(task_battles))
        selected.extend(random.sample(task_battles, count))
    
    # If we still need more, randomly sample from all
    if len(selected) < n:
        remaining = [b for b in bucket if b not in selected]
        selected.extend(random.sample(remaining, n - len(selected)))
    
    return selected[:n]


def main():
    parser = argparse.ArgumentParser(description="Select validation sample battles")
    parser.add_argument("--db", required=True, help="DBOM file pattern (e.g., data/dboms/dbom_auto_*.json)")
    parser.add_argument("--output", required=True, help="Output JSON file")
    parser.add_argument("--per-bucket", type=int, default=5, help="Battles per CIS bucket (default: 5)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    args = parser.parse_args()
    
    print(f"Loading DBOMs from {args.db}...")
    dboms = load_dboms(args.db)
    print(f"Loaded {len(dboms)} DBOM files")
    
    print("Extracting battles...")
    battles = extract_battles(dboms)
    print(f"Extracted {len(battles)} battles with CIS scores")
    
    print("Stratifying by CIS score...")
    buckets = stratify_by_cis(battles)
    
    for bucket_name, bucket_battles in buckets.items():
        print(f"  {bucket_name}: {len(bucket_battles)} battles")
    
    print(f"\nSelecting {args.per_bucket} battles per bucket...")
    selected_battles = []
    
    for bucket_name, bucket_battles in buckets.items():
        sample = select_diverse_sample(bucket_battles, args.per_bucket, args.seed)
        print(f"  {bucket_name}: Selected {len(sample)} battles")
        selected_battles.extend(sample)
    
    print(f"\nTotal selected: {len(selected_battles)} battles")
    
    # Save to output file
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    output_data = {
        "selection_metadata": {
            "total_battles_available": len(battles),
            "selected_count": len(selected_battles),
            "per_bucket": args.per_bucket,
            "random_seed": args.seed,
            "stratification": {bucket: len(buckets[bucket]) for bucket in buckets}
        },
        "battles": selected_battles
    }
    
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\nSaved to {output_path}")
    
    # Print task distribution
    task_dist = defaultdict(int)
    for battle in selected_battles:
        task_dist[battle["task_id"]] += 1
    
    print("\nTask distribution:")
    for task, count in sorted(task_dist.items()):
        print(f"  {task}: {count} battles")


if __name__ == "__main__":
    main()
