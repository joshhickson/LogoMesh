#!/usr/bin/env python3
"""
Phase 2: Controlled Variance Test
Measures CIS pipeline evaluator variance by submitting identical fixed solutions
N times each, isolating evaluator stochasticity from code-generation variance.

Usage:
    1. Start Green Agent: make run-green   (in a separate terminal, port 9009)
    2. Run this script:   python3 scripts/run_variance_test.py

The script starts a mock Purple server (port 9099) that always returns exactly
the same source code, so any score variation comes purely from the Green pipeline
(Red Agent LLM calls, L-score LLM calls, etc.).

Output: results/paper_data/variance_test.json
"""

import json
import os
import statistics
import sys
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, HTTPServer

import httpx

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(ROOT, "results", "paper_data")
os.makedirs(OUT_DIR, exist_ok=True)

GREEN_URL = "http://localhost:9009"
MOCK_PURPLE_PORT = 9099
MOCK_PURPLE_URL = f"http://localhost:{MOCK_PURPLE_PORT}"

RUNS_PER_TASK = 5
REQUEST_TIMEOUT = 300  # seconds per evaluation

# ── Fixed golden solutions ────────────────────────────────────────────────────
# These are clean, correct implementations that represent typical Purple output.
# Keeping them fixed isolates evaluator variance from code-generation variance.

GOLDEN_SOLUTIONS = {
    "task-002": {
        "title": "Rate Limiter",
        "task_id": "task-002",
        "sourceCode": """\
import time
from collections import defaultdict

class RateLimiter:
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests = defaultdict(list)

    def is_allowed(self, client_id: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds
        self._requests[client_id] = [
            t for t in self._requests[client_id] if t > window_start
        ]
        if len(self._requests[client_id]) < self.max_requests:
            self._requests[client_id].append(now)
            return True
        return False
""",
        "rationale": (
            "Implements a sliding-window rate limiter using a per-client timestamp list. "
            "Stale timestamps outside the window are pruned on each check. "
            "This provides O(max_requests) amortized complexity per call."
        ),
        "testCode": """\
import pytest
from solution import RateLimiter

def test_allows_within_limit():
    rl = RateLimiter(max_requests=3, window_seconds=60)
    assert rl.is_allowed("client1") == True
    assert rl.is_allowed("client1") == True
    assert rl.is_allowed("client1") == True

def test_blocks_over_limit():
    rl = RateLimiter(max_requests=2, window_seconds=60)
    rl.is_allowed("c")
    rl.is_allowed("c")
    assert rl.is_allowed("c") == False

def test_different_clients_independent():
    rl = RateLimiter(max_requests=1, window_seconds=60)
    assert rl.is_allowed("a") == True
    assert rl.is_allowed("b") == True
""",
    },
    "task-003": {
        "title": "LRU Cache",
        "task_id": "task-003",
        "sourceCode": """\
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        if capacity <= 0:
            raise ValueError("Capacity must be positive")
        self.capacity = capacity
        self._cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self._cache:
            return -1
        self._cache.move_to_end(key)
        return self._cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self._cache:
            self._cache.move_to_end(key)
        self._cache[key] = value
        if len(self._cache) > self.capacity:
            self._cache.popitem(last=False)
""",
        "rationale": (
            "Uses Python's OrderedDict as an ordered hash map to achieve O(1) get and put. "
            "move_to_end() marks a key as most-recently-used; popitem(last=False) evicts "
            "the least-recently-used entry when capacity is exceeded."
        ),
        "testCode": """\
import pytest
from solution import LRUCache

def test_basic_get_put():
    cache = LRUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    assert cache.get(1) == 1

def test_eviction():
    cache = LRUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    cache.get(1)        # 1 is now most recent
    cache.put(3, 3)     # evicts 2
    assert cache.get(2) == -1
    assert cache.get(3) == 3

def test_missing_key():
    cache = LRUCache(1)
    assert cache.get(99) == -1

def test_invalid_capacity():
    with pytest.raises(ValueError):
        LRUCache(0)
""",
    },
    "task-004": {
        "title": "Recursive Fibonacci",
        "task_id": "task-004",
        "sourceCode": """\
from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n: int) -> int:
    if not isinstance(n, int) or isinstance(n, bool):
        raise TypeError("n must be an integer")
    if n < 0:
        raise ValueError("n must be non-negative")
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
""",
        "rationale": (
            "Implements memoized recursive Fibonacci with lru_cache for O(n) time and O(n) "
            "space. Input validation covers negative integers and non-integer types. "
            "The recursion is tail-safe for reasonable n values."
        ),
        "testCode": """\
import pytest
from solution import fibonacci

def test_base_cases():
    assert fibonacci(0) == 0
    assert fibonacci(1) == 1

def test_sequence():
    expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
    for i, v in enumerate(expected):
        assert fibonacci(i) == v, f"fibonacci({i}) should be {v}"

def test_larger_value():
    assert fibonacci(20) == 6765

def test_negative_raises():
    with pytest.raises(ValueError):
        fibonacci(-1)
""",
    },
}


# ── Mock Purple HTTP server ───────────────────────────────────────────────────

class _MockPurpleState:
    """Shared mutable state so the handler can read the current task."""
    current_task_id: str = "task-003"


class MockPurpleHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        _ = self.rfile.read(content_length)  # consume body (unused)

        task_id = _MockPurpleState.current_task_id
        sol = GOLDEN_SOLUTIONS.get(task_id, GOLDEN_SOLUTIONS["task-003"])

        code_json = json.dumps({
            "sourceCode": sol["sourceCode"],
            "rationale":  sol["rationale"],
            "testCode":   sol["testCode"],
        })

        response_body = json.dumps({
            "jsonrpc": "2.0",
            "id": "mock",
            "result": {
                "kind": "message",
                "parts": [{"kind": "text", "text": code_json}],
            },
        }).encode()

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_body)))
        self.end_headers()
        self.wfile.write(response_body)

    def log_message(self, fmt, *args):
        pass  # silence default access log


def start_mock_purple():
    server = HTTPServer(("127.0.0.1", MOCK_PURPLE_PORT), MockPurpleHandler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    print(f"[MockPurple] Listening on port {MOCK_PURPLE_PORT}")
    return server


# ── Green Agent health check ──────────────────────────────────────────────────

def check_green_alive():
    try:
        r = httpx.get(f"{GREEN_URL}/docs", timeout=5.0, follow_redirects=False)
        return r.status_code < 500
    except Exception:
        return False


# ── Run one evaluation ────────────────────────────────────────────────────────

def run_evaluation(task_id: str, run_idx: int) -> dict:
    battle_id = f"variance_{task_id}_{run_idx}_{uuid.uuid4().hex[:6]}"
    payload = {
        "purple_agent_url": MOCK_PURPLE_URL,
        "battle_id": battle_id,
        "task_id": task_id,
    }
    try:
        r = httpx.post(
            f"{GREEN_URL}/actions/send_coding_task",
            json=payload,
            timeout=REQUEST_TIMEOUT,
        )
        if r.status_code >= 400:
            return {"run": run_idx, "battle_id": battle_id, "cis_score": None,
                    "error": f"HTTP {r.status_code}: {r.text[:300]}"}
        data = r.json()
        return {
            "run": run_idx,
            "battle_id": battle_id,
            "cis_score": data.get("cis_score", data.get("score", 0.0)),
            "R": data.get("component_scores", {}).get("R", None),
            "A": data.get("component_scores", {}).get("A", None),
            "T": data.get("component_scores", {}).get("T", None),
            "L": data.get("component_scores", {}).get("L", None),
            "error": data.get("error"),
            "raw": data,
        }
    except Exception as e:
        return {"run": run_idx, "battle_id": battle_id, "cis_score": None, "error": str(e)}


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("Phase 2: Controlled Variance Test")
    print(f"  Tasks:     {list(GOLDEN_SOLUTIONS.keys())}")
    print(f"  Runs each: {RUNS_PER_TASK}")
    print(f"  Total:     {len(GOLDEN_SOLUTIONS) * RUNS_PER_TASK} evaluations")
    print("=" * 60)

    # Check Green Agent
    if not check_green_alive():
        print(f"\nERROR: Green Agent not reachable at {GREEN_URL}")
        print("  Start it with:  make run-green")
        print("  (in a separate terminal from the LogoMesh root)")
        sys.exit(1)
    print(f"[OK] Green Agent is up at {GREEN_URL}")

    # Start mock Purple
    start_mock_purple()
    time.sleep(0.5)  # give server a moment to bind

    all_results = {}
    all_cis_scores = []

    for task_id, sol in GOLDEN_SOLUTIONS.items():
        title = sol["title"]
        print(f"\n--- {task_id}: {title} ---")

        _MockPurpleState.current_task_id = task_id

        runs = []
        for i in range(1, RUNS_PER_TASK + 1):
            print(f"  Run {i}/{RUNS_PER_TASK} ...", end=" ", flush=True)
            result = run_evaluation(task_id, i)
            cis = result.get("cis_score")
            if cis is not None:
                print(f"CIS={cis:.4f}")
            else:
                print(f"ERROR: {result.get('error', '?')}")
            runs.append(result)

        # Compute stats for this task
        valid_scores = [r["cis_score"] for r in runs if r.get("cis_score") is not None]
        all_cis_scores.extend(valid_scores)

        if len(valid_scores) >= 2:
            task_stats = {
                "count": len(valid_scores),
                "mean":    round(statistics.mean(valid_scores), 4),
                "std_dev": round(statistics.stdev(valid_scores), 4),
                "min":     round(min(valid_scores), 4),
                "max":     round(max(valid_scores), 4),
            }
        else:
            task_stats = {"count": len(valid_scores), "error": "insufficient data"}

        print(f"  Stats: mean={task_stats.get('mean', '?')}, "
              f"std={task_stats.get('std_dev', '?')}, "
              f"min={task_stats.get('min', '?')}, max={task_stats.get('max', '?')}")

        all_results[task_id] = {
            "title": title,
            "task_id": task_id,
            "runs": [
                {k: v for k, v in r.items() if k != "raw"}
                for r in runs
            ],
            **task_stats,
        }

    # Overall variance
    if len(all_cis_scores) >= 2:
        overall_std = round(statistics.stdev(all_cis_scores), 4)
        overall_mean = round(statistics.mean(all_cis_scores), 4)
        # Per-task std_devs
        per_task_stds = [
            all_results[tid].get("std_dev", 0.0)
            for tid in all_results
            if "std_dev" in all_results[tid]
        ]
        mean_per_task_std = round(statistics.mean(per_task_stds), 4) if per_task_stds else None
        max_per_task_std  = round(max(per_task_stds), 4) if per_task_stds else None
    else:
        overall_std = None
        overall_mean = None
        mean_per_task_std = None
        max_per_task_std = None

    variance_threshold = 0.05
    claim_supported = (
        max_per_task_std is not None and max_per_task_std < variance_threshold
    )

    output = {
        "methodology": (
            f"Fixed golden solutions evaluated {RUNS_PER_TASK} times each to isolate "
            "evaluator variance from code-generation variance. The mock Purple server "
            "returns identical source code on every call; all observed score variation "
            "arises from LLM stochasticity in the Red Agent and L-score components."
        ),
        "runs_per_task": RUNS_PER_TASK,
        "tasks_tested": list(GOLDEN_SOLUTIONS.keys()),
        "results": all_results,
        "overall": {
            "mean_cis": overall_mean,
            "overall_std": overall_std,
            "mean_per_task_std": mean_per_task_std,
            "max_per_task_std": max_per_task_std,
        },
        "variance_claim": {
            "threshold": variance_threshold,
            "max_observed_std": max_per_task_std,
            "claim_supported": claim_supported,
            "note": (
                f"Variance threshold of {variance_threshold} {'met' if claim_supported else 'NOT met'}. "
                f"Max per-task std_dev = {max_per_task_std}."
            ),
        },
    }

    out_path = os.path.join(OUT_DIR, "variance_test.json")
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)

    print("\n" + "=" * 60)
    print("RESULTS SUMMARY")
    print("=" * 60)
    for tid, res in all_results.items():
        mean_s = f"{res['mean']:.4f}" if isinstance(res.get('mean'), float) else "?"
    std_s  = f"{res['std_dev']:.4f}" if isinstance(res.get('std_dev'), float) else "?"
    min_s  = f"{res['min']:.3f}" if isinstance(res.get('min'), float) else "?"
    max_s  = f"{res['max']:.3f}" if isinstance(res.get('max'), float) else "?"
    print(f"  {res['title']:25s}  mean={mean_s}  std={std_s}  range=[{min_s},{max_s}]")
    print(f"\n  Mean per-task std_dev : {mean_per_task_std}")
    print(f"  Max  per-task std_dev : {max_per_task_std}")
    print(f"  Claim (<{variance_threshold}): {'SUPPORTED' if claim_supported else 'NOT SUPPORTED'}")
    print(f"\nOK Wrote {out_path}")


if __name__ == "__main__":
    main()
