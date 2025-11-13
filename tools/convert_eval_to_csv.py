#!/usr/bin/env python3
"""Convert evaluation JSON files to a CSV (one row per analyzer).

Usage:
  python tools/convert_eval_to_csv.py --input docs/onboarding/example-evaluation-report.json --output example-eval.csv
  python tools/convert_eval_to_csv.py --input logs/ --output all-evals.csv

If --input is a directory, all `*.json` files inside will be scanned.
The output CSV contains columns: run_id, status, contextualDebtScore, createdAt, completedAt, analyzer, analyzer_score, analyzer_details
"""
from __future__ import annotations

import argparse
import json
import csv
from pathlib import Path
from typing import Iterable, Dict, Any


def iter_json_files(path: Path) -> Iterable[Path]:
    if path.is_dir():
        for p in sorted(path.glob('*.json')):
            yield p
    elif path.is_file():
        yield path
    else:
        return


def flatten_report(obj: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
    base = {
        'run_id': obj.get('id'),
        'status': obj.get('status'),
        'contextualDebtScore': obj.get('contextualDebtScore'),
        'createdAt': obj.get('createdAt'),
        'completedAt': obj.get('completedAt'),
    }
    report = obj.get('report') or {}
    for analyzer, info in report.items():
        yield {
            **base,
            'analyzer': analyzer,
            'analyzer_score': info.get('score'),
            'analyzer_details': info.get('details'),
        }


def convert(input_path: Path, output_path: Path) -> int:
    rows = []
    for p in iter_json_files(input_path):
        try:
            obj = json.loads(p.read_text(encoding='utf-8'))
        except Exception as e:
            print(f"Skipping {p}: failed to parse JSON: {e}")
            continue
        for row in flatten_report(obj):
            rows.append(row)

    if not rows:
        print('No evaluation rows found. Nothing written.')
        return 1

    # Write CSV
    fieldnames = [
        'run_id', 'status', 'contextualDebtScore', 'createdAt', 'completedAt',
        'analyzer', 'analyzer_score', 'analyzer_details'
    ]
    with output_path.open('w', encoding='utf-8', newline='') as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

    print(f'Wrote {len(rows)} rows to {output_path}')
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description='Convert evaluation JSON files to CSV (one row per analyzer)')
    p.add_argument('--input', '-i', required=True,
                   help='Path to a JSON file or a directory containing JSON evaluation files')
    p.add_argument('--output', '-o', required=True, help='Output CSV path')
    args = p.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    return convert(input_path, output_path)


if __name__ == '__main__':
    raise SystemExit(main())
