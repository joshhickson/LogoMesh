#!/usr/bin/env python3
"""
C-003: Review Packet Generator
Generates anonymized review packets for expert validation.

Usage:
    python validation/scripts/generate_packets.py --samples validation/samples/selected_battles.json --output validation/packets/

Anonymization:
    - Removes agent names and model names
    - Assigns battle IDs (B001-B025)
    - Strips metadata that could identify origin
    - Preserves: task, rationale, code, tests, sandbox results

Output:
    - Individual battle files: B001.json, B002.json, etc.
    - Master rating form: rating_form.json
    - Distribution manifest: packet_manifest.json
"""

import argparse
import json
from pathlib import Path
from typing import List, Dict, Any


def anonymize_battle(battle: Dict[str, Any], battle_num: int) -> Dict[str, Any]:
    """Anonymize battle data for expert review."""
    battle_id = f"B{battle_num:03d}"
    
    anonymized = {
        "battle_id": battle_id,
        "task_description": battle["task_description"],
        "rationale": battle["rationale"],
        "source_code": battle["source_code"],
        "test_code": battle["test_code"],
        "sandbox_success": battle["sandbox_success"],
        # Include CIS components for reference but not overall score
        "cis_components": {
            "rationale_score": round(battle["rationale_score"], 3),
            "architecture_score": round(battle["architecture_score"], 3),
            "testing_score": round(battle["testing_score"], 3),
            "logic_score": round(battle["logic_score"], 3)
        }
    }
    
    return anonymized


def generate_rating_form_template() -> Dict[str, Any]:
    """Generate rating form template for experts."""
    return {
        "rating_instructions": {
            "overview": "Rate each battle on 4 dimensions using a 5-point scale (0.0 to 1.0 in 0.25 increments)",
            "dimensions": {
                "R": "Rationale Quality - How well does the written rationale explain the solution approach and align with the task intent?",
                "A": "Architecture Quality - How sound is the code structure, design choices, and adherence to best practices?",
                "T": "Testing Quality - How comprehensive and specific are the tests? Do they verify acceptance criteria?",
                "L": "Logic Correctness - Beyond test results, how correct is the implementation logic? Any edge case issues?"
            },
            "rating_scale": {
                "1.00": "Excellent - Exceeds expectations, exemplary quality",
                "0.75": "Good - Meets expectations with minor issues",
                "0.50": "Fair - Acceptable but has notable gaps",
                "0.25": "Poor - Below expectations, significant issues",
                "0.00": "Very Poor - Fundamentally flawed or missing"
            },
            "guidelines": [
                "Rate independently for each dimension",
                "Consider sandbox_success but don't let it dominate all ratings",
                "Focus on what's present in the submission, not what's missing",
                "Use the full scale - don't cluster around middle values",
                "Provide brief comments explaining ratings when helpful"
            ]
        },
        "battles": []
    }


def generate_packet_manifest(selected_battles: List[Dict[str, Any]], 
                             anonymized_battles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate manifest linking anonymized battles to original data."""
    manifest = {
        "packet_metadata": {
            "total_battles": len(anonymized_battles),
            "generation_instructions": "This manifest links anonymized battle IDs to original metadata for post-analysis"
        },
        "battle_mappings": []
    }
    
    for orig, anon in zip(selected_battles, anonymized_battles):
        mapping = {
            "battle_id": anon["battle_id"],
            "original_battle_id": orig["battle_id"],
            "task_id": orig["task_id"],
            "agent_name": orig["agent_name"],
            "model_name": orig["model_name"],
            "cis_score": round(orig["cis_score"], 3),
            "dbom_file": orig["dbom_file"]
        }
        manifest["battle_mappings"].append(mapping)
    
    return manifest


def main():
    parser = argparse.ArgumentParser(description="Generate expert review packets")
    parser.add_argument("--samples", required=True, help="Selected battles JSON file")
    parser.add_argument("--output", required=True, help="Output directory for packets")
    args = parser.parse_args()
    
    print(f"Loading samples from {args.samples}...")
    with open(args.samples, 'r') as f:
        data = json.load(f)
    
    battles = data["battles"]
    print(f"Loaded {len(battles)} battles")
    
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("Generating anonymized battle files...")
    anonymized_battles = []
    
    for i, battle in enumerate(battles, start=1):
        anonymized = anonymize_battle(battle, i)
        anonymized_battles.append(anonymized)
        
        # Save individual battle file
        battle_file = output_dir / f"{anonymized['battle_id']}.json"
        with open(battle_file, 'w') as f:
            json.dump(anonymized, f, indent=2)
        
        print(f"  Generated {anonymized['battle_id']}.json")
    
    print("\nGenerating rating form template...")
    rating_form = generate_rating_form_template()
    
    for anon_battle in anonymized_battles:
        battle_rating = {
            "battle_id": anon_battle["battle_id"],
            "ratings": {
                "R": None,  # Expert fills in 0.00-1.00
                "A": None,
                "T": None,
                "L": None
            },
            "comments": ""  # Optional expert comments
        }
        rating_form["battles"].append(battle_rating)
    
    rating_form_file = output_dir / "rating_form.json"
    with open(rating_form_file, 'w') as f:
        json.dump(rating_form, f, indent=2)
    
    print(f"Saved rating form template to {rating_form_file}")
    
    print("\nGenerating packet manifest...")
    manifest = generate_packet_manifest(battles, anonymized_battles)
    manifest_file = output_dir / "packet_manifest.json"
    with open(manifest_file, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"Saved manifest to {manifest_file}")
    
    print("\n=== Packet Generation Complete ===")
    print(f"Output directory: {output_dir}")
    print(f"Battle files: {len(anonymized_battles)} individual JSON files")
    print(f"Rating form: rating_form.json")
    print(f"Manifest: packet_manifest.json")
    
    print("\nNext steps:")
    print("1. Review rating_form.json for distribution to experts")
    print("2. Distribute packet to 2+ expert reviewers")
    print("3. Collect completed rating forms to validation/responses/")
    print("4. Run analysis scripts (C-008, C-009, C-010)")


if __name__ == "__main__":
    main()
