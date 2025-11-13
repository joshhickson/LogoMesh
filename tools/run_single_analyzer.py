#!/usr/bin/env python3
"""Run a single analyzer locally (scaffold).

This script is a lightweight scaffold to run one analyzer on a single evaluation/input
without starting the entire Docker Compose stack. It intentionally has no hard
dependencies on the TypeScript code in the repo; instead it provides a safe
"dry-run" mode that produces a plausible analyzer output JSON so data scientists
can iterate quickly.

Usage examples:

    # Run the rationale analyzer against the example evaluation JSON (dry-run)
    python tools/run_single_analyzer.py --analyzer rationale --input docs/onboarding/example-evaluation-report.json --output tmp/rationale-output.json

    # Run the testing analyzer with explicit output path
    python tools/run_single_analyzer.py -a testing -i logs/some-eval.json -o out/testing-run.json

Behavior
------
- If --dry-run is set (default), the script reads the input JSON and produces a
  heuristic analyzer result derived from the input contents. This is useful for
  quick EDA and pipeline testing.
- In future, you can extend this script to invoke the Node/TypeScript analyzer
  by calling a CLI or spawning `pnpm --filter @logomesh/...` commands.
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any


def heuristic_rationale_score(obj: Dict[str, Any]) -> Dict[str, Any]:
    # Heuristic: if there's a rationale string, score is based on length and presence
    report = obj.get('report') or {}
    # Look for fields that might contain rationale text in the submission
    rationale_text = None
    # Fallback to any 'rationale' key deep in the JSON
    def find_rationale(d: Dict[str, Any]):
        for k, v in d.items():
            if k.lower().startswith('rationale') and isinstance(v, str):
                return v
            if isinstance(v, dict):
                r = find_rationale(v)
                if r:
                    return r
        return None

    rationale_text = find_rationale(obj) or ''
    length = len(rationale_text)
    # Map length to [0.2, 0.95]
    score = min(0.95, 0.2 + min(length / 400.0, 0.75))
    details = 'Dry-run rationale analyzer. Longer rationale increases score.'
    if length == 0:
        details = 'No rationale text found; heuristic score applied.'
    return {'score': round(score, 2), 'details': details}


def heuristic_architectural_score(obj: Dict[str, Any]) -> Dict[str, Any]:
    # Heuristic: presence and length of sourceCode impacts score
    src = None
    if isinstance(obj, dict):
        src = obj.get('sourceCode') or obj.get('submission') or obj.get('code')
    if isinstance(src, dict):
        # join values
        src = '\n'.join(str(v) for v in src.values())
    src = src or ''
    length = len(src)
    score = min(0.9, 0.3 + min(length / 1000.0, 0.6))
    details = 'Dry-run architectural analyzer: score heuristically based on source size.'
    if length == 0:
        details = 'No source code found in input; architecture score lowered.'
    return {'score': round(score, 2), 'details': details}


def heuristic_testing_score(obj: Dict[str, Any]) -> Dict[str, Any]:
    # Heuristic: presence of testCode or tests in the input increases score
    test_code = None
    test_code = obj.get('testCode') if isinstance(obj, dict) else None
    found = bool(test_code)
    score = 0.8 if found else 0.4
    details = 'Dry-run testing analyzer: tests detected.' if found else 'No tests found; low testing score.'
    return {'score': round(score, 2), 'details': details}


ANALYZERS = {
    'rationale': heuristic_rationale_score,
    'architectural': heuristic_architectural_score,
    'testing': heuristic_testing_score,
}


def main() -> int:
    p = argparse.ArgumentParser(description='Run a single analyzer (dry-run scaffold)')
    p.add_argument('--analyzer', '-a', choices=list(ANALYZERS.keys()), default='rationale', help='Which analyzer to run')
    p.add_argument('--input', '-i', required=True, help='Path to input JSON file')
    p.add_argument('--output', '-o', required=True, help='Path to write analyzer JSON output')
    p.add_argument('--dry-run', action='store_true', help='Run in dry-run heuristic mode (default)')

    args = p.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    if not input_path.exists():
        print(f'Input file {input_path} does not exist')
        return 2

    try:
        obj = json.loads(input_path.read_text(encoding='utf-8'))
    except Exception as e:
        print(f'Failed to parse input JSON: {e}')
        return 3

    analyzer = args.analyzer
    func = ANALYZERS.get(analyzer)
    if func is None:
        print(f'Unknown analyzer: {analyzer}')
        return 4

    # For now always run heuristic/dry-run; future: try calling real analyzer implementation
    result = func(obj)

    out = {
        'id': obj.get('id') or 'local-run',
        'status': 'complete',
        'report': {},
        'createdAt': obj.get('createdAt') or datetime.utcnow().isoformat() + 'Z',
        'completedAt': datetime.utcnow().isoformat() + 'Z',
    }

    key_map = {
        'rationale': 'rationaleDebt',
        'architectural': 'architecturalCoherenceDebt',
        'testing': 'testingVerificationDebt',
    }

    out['report'][key_map[analyzer]] = result

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(out, indent=2), encoding='utf-8')
    print(f'Wrote analyzer output to {output_path}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
