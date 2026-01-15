#!/usr/bin/env python3
"""
C-010: Failure Mode Extraction Script
Identifies patterns where CIS diverges from expert judgment.

Usage:
    python validation/scripts/extract_failure_modes.py \
        --responses validation/responses/ \
        --manifest validation/packets/packet_manifest.json \
        --output validation/analysis/failure_modes.json \
        --threshold 0.30

Failure Modes:
    - CIS High, Expert Low: False positive (CIS overestimates quality)
    - CIS Low, Expert High: False negative (CIS underestimates quality)
    - Component Mismatch: Specific dimension(s) diverge
    - Systematic Bias: Consistent over/under-estimation patterns

Output:
    - Flagged battles with divergence > threshold
    - Common patterns (task type, agent type, failure category)
    - Recommendations for CIS refinement
"""

import argparse
import json
import glob
from pathlib import Path
from typing import List, Dict, Any
from collections import defaultdict
import statistics


def load_expert_responses(responses_dir: str) -> List[Dict[str, Any]]:
    """Load all expert rating files."""
    response_files = glob.glob(f"{responses_dir}/*.json")
    responses = []
    
    for response_file in response_files:
        try:
            with open(response_file, 'r') as f:
                data = json.load(f)
                expert_id = Path(response_file).stem
                responses.append({
                    "expert_id": expert_id,
                    "battles": data.get("battles", [])
                })
        except Exception as e:
            print(f"Warning: Failed to load {response_file}: {e}")
    
    return responses


def load_manifest(manifest_file: str) -> Dict[str, Dict[str, Any]]:
    """Load packet manifest to get CIS scores and metadata."""
    with open(manifest_file, 'r') as f:
        manifest = json.load(f)
    
    lookup = {}
    for mapping in manifest["battle_mappings"]:
        battle_id = mapping["battle_id"]
        lookup[battle_id] = mapping
    
    return lookup


def aggregate_expert_ratings(responses: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
    """Aggregate ratings from multiple experts (average per battle)."""
    battle_ratings = defaultdict(lambda: {"R": [], "A": [], "T": [], "L": []})
    
    for response in responses:
        for battle in response["battles"]:
            battle_id = battle["battle_id"]
            ratings = battle.get("ratings", {})
            
            for dim in ["R", "A", "T", "L"]:
                if ratings.get(dim) is not None:
                    battle_ratings[battle_id][dim].append(ratings[dim])
    
    aggregated = {}
    for battle_id, dims in battle_ratings.items():
        aggregated[battle_id] = {
            dim: statistics.mean(scores) if scores else None
            for dim, scores in dims.items()
        }
    
    return aggregated


def classify_failure_mode(cis_score: float, expert_score: float, 
                         dimension: str, threshold: float) -> str:
    """Classify the type of failure mode based on divergence."""
    divergence = cis_score - expert_score
    
    if abs(divergence) <= threshold:
        return "MATCH"
    
    if divergence > threshold:
        return "FALSE_POSITIVE"  # CIS overestimates
    else:
        return "FALSE_NEGATIVE"  # CIS underestimates


def extract_failure_modes(expert_ratings: Dict[str, Dict[str, float]],
                         manifest_lookup: Dict[str, Dict[str, Any]],
                         threshold: float = 0.30) -> Dict[str, Any]:
    """Extract battles where CIS diverges from expert judgment."""
    
    failure_cases = []
    pattern_counts = defaultdict(int)
    dimension_stats = {dim: {"false_pos": 0, "false_neg": 0, "match": 0} 
                      for dim in ["R", "A", "T", "L"]}
    
    for battle_id, expert_dims in expert_ratings.items():
        if battle_id not in manifest_lookup:
            continue
        
        manifest_entry = manifest_lookup[battle_id]
        cis_overall = manifest_entry.get("cis_score", 0.5)
        task_id = manifest_entry.get("task_id", "unknown")
        agent_name = manifest_entry.get("agent_name", "unknown")
        
        # Compute expert overall score (average of 4 dimensions)
        expert_overall = statistics.mean([
            score for score in expert_dims.values() if score is not None
        ])
        
        # Check overall divergence
        overall_divergence = abs(cis_overall - expert_overall)
        overall_mode = classify_failure_mode(cis_overall, expert_overall, "Overall", threshold)
        
        # Check dimension-wise divergence
        dimension_modes = {}
        dimension_divergences = {}
        
        for dim in ["R", "A", "T", "L"]:
            expert_score = expert_dims.get(dim)
            if expert_score is not None:
                # Placeholder: use cis_overall as proxy (fix in production)
                cis_component = cis_overall
                
                divergence = cis_component - expert_score
                mode = classify_failure_mode(cis_component, expert_score, dim, threshold)
                
                dimension_modes[dim] = mode
                dimension_divergences[dim] = round(divergence, 3)
                
                # Update stats
                if mode == "FALSE_POSITIVE":
                    dimension_stats[dim]["false_pos"] += 1
                elif mode == "FALSE_NEGATIVE":
                    dimension_stats[dim]["false_neg"] += 1
                else:
                    dimension_stats[dim]["match"] += 1
        
        # Flag if any dimension or overall diverges
        if overall_mode != "MATCH" or any(mode != "MATCH" for mode in dimension_modes.values()):
            failure_case = {
                "battle_id": battle_id,
                "task_id": task_id,
                "agent_name": agent_name,
                "cis_overall": round(cis_overall, 3),
                "expert_overall": round(expert_overall, 3),
                "overall_divergence": round(overall_divergence, 3),
                "overall_mode": overall_mode,
                "dimension_modes": dimension_modes,
                "dimension_divergences": dimension_divergences
            }
            failure_cases.append(failure_case)
            
            # Track patterns
            pattern_counts[f"{task_id}_{overall_mode}"] += 1
            pattern_counts[f"{agent_name}_{overall_mode}"] += 1
    
    # Rank patterns by frequency
    top_patterns = sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    
    results = {
        "failure_cases": failure_cases,
        "summary": {
            "total_battles_analyzed": len(expert_ratings),
            "flagged_battles": len(failure_cases),
            "flagged_rate": round(len(failure_cases) / len(expert_ratings), 3) if expert_ratings else 0,
            "threshold_used": threshold
        },
        "dimension_statistics": dimension_stats,
        "common_patterns": [
            {"pattern": pattern, "count": count} 
            for pattern, count in top_patterns
        ]
    }
    
    return results


def generate_recommendations(failure_analysis: Dict[str, Any]) -> List[str]:
    """Generate recommendations based on failure mode patterns."""
    recommendations = []
    
    dim_stats = failure_analysis["dimension_statistics"]
    
    for dim in ["R", "A", "T", "L"]:
        false_pos = dim_stats[dim]["false_pos"]
        false_neg = dim_stats[dim]["false_neg"]
        total = false_pos + false_neg + dim_stats[dim]["match"]
        
        if total == 0:
            continue
        
        false_pos_rate = false_pos / total
        false_neg_rate = false_neg / total
        
        if false_pos_rate > 0.30:
            recommendations.append(
                f"{dim} dimension: High false positive rate ({false_pos_rate:.1%}). "
                f"CIS may be overestimating {dim} quality. Consider tightening constraints "
                f"or adjusting component weight."
            )
        
        if false_neg_rate > 0.30:
            recommendations.append(
                f"{dim} dimension: High false negative rate ({false_neg_rate:.1%}). "
                f"CIS may be underestimating {dim} quality. Consider loosening constraints "
                f"or improving semantic similarity detection."
            )
    
    # Check common patterns
    patterns = failure_analysis["common_patterns"]
    if patterns:
        top_pattern = patterns[0]["pattern"]
        if "task-" in top_pattern:
            task = top_pattern.split("_")[0]
            recommendations.append(
                f"Task-specific issue: {task} shows highest divergence. "
                f"Review constraints and scoring logic for this task."
            )
    
    if not recommendations:
        recommendations.append(
            "No systematic issues detected. CIS shows good alignment with expert judgment."
        )
    
    return recommendations


def main():
    parser = argparse.ArgumentParser(description="Extract failure modes from validation")
    parser.add_argument("--responses", required=True, help="Directory with expert response JSON files")
    parser.add_argument("--manifest", required=True, help="Packet manifest JSON file")
    parser.add_argument("--output", required=True, help="Output JSON file for failure modes")
    parser.add_argument("--threshold", type=float, default=0.30, 
                       help="Divergence threshold for flagging (default: 0.30)")
    args = parser.parse_args()
    
    print("Loading expert responses...")
    responses = load_expert_responses(args.responses)
    print(f"Loaded {len(responses)} expert response files")
    
    print("Loading manifest...")
    manifest_lookup = load_manifest(args.manifest)
    print(f"Loaded manifest with {len(manifest_lookup)} battles")
    
    print("Aggregating expert ratings...")
    expert_ratings = aggregate_expert_ratings(responses)
    print(f"Aggregated ratings for {len(expert_ratings)} battles")
    
    print(f"Extracting failure modes (threshold={args.threshold})...")
    failure_analysis = extract_failure_modes(expert_ratings, manifest_lookup, args.threshold)
    
    print("Generating recommendations...")
    recommendations = generate_recommendations(failure_analysis)
    failure_analysis["recommendations"] = recommendations
    
    # Print summary
    print("\n=== Failure Mode Analysis Results ===")
    summary = failure_analysis["summary"]
    print(f"\nTotal battles analyzed: {summary['total_battles_analyzed']}")
    print(f"Flagged battles: {summary['flagged_battles']} ({summary['flagged_rate']:.1%})")
    print(f"Divergence threshold: {summary['threshold_used']}")
    
    print("\nDimension Statistics:")
    for dim in ["R", "A", "T", "L"]:
        stats = failure_analysis["dimension_statistics"][dim]
        total = stats["false_pos"] + stats["false_neg"] + stats["match"]
        if total > 0:
            print(f"  {dim}: FP={stats['false_pos']}, FN={stats['false_neg']}, Match={stats['match']}")
    
    print("\nTop Patterns:")
    for pattern_info in failure_analysis["common_patterns"][:5]:
        print(f"  {pattern_info['pattern']}: {pattern_info['count']} cases")
    
    print("\nRecommendations:")
    for i, rec in enumerate(recommendations, 1):
        print(f"  {i}. {rec}")
    
    # Save results
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(failure_analysis, f, indent=2)
    
    print(f"\nSaved failure mode analysis to {output_path}")
    
    print("\n⚠️  PRODUCTION NOTE:")
    print("This script uses cis_overall as proxy for component scores.")
    print("Update to load actual R/A/T/L component scores from DBOM files.")


if __name__ == "__main__":
    main()
