#!/usr/bin/env python3
"""Generate a ranked confusion-hotspot audit for this repository.

This script performs static discovery checks across docs and code to identify
likely confusion hotspots, then writes:
- a markdown report for humans
- a JSON report for tooling

It is intentionally lightweight and uses only the Python standard library.
"""
from __future__ import annotations

import argparse
import fnmatch
import json
import os
import re
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple


ACTIVE_DOC_CANDIDATES = [
    "README.md",
    "CONTRIBUTING.md",
    "AGENTS.md",
    "CLAUDE.md",
    "CONTEXT_PROMPT.md",
    "docs/00_CURRENT_TRUTH_SOURCE.md",
    "docs/02-Engineering/Developer-Guide.md",
    "docs/05-Competition/Agent-Architecture.md",
    "docs/05-Competition/Judges-Start-Here.md",
    "docs/04-Operations/Dual-Track-Arena/README.md",
]

EXCLUDED_TREE_PREFIXES = (
    ".git",
    ".venv",
    "external",
    "legacy",
    "docs/Archive",
)

SKIP_DIR_NAMES = {
    ".git",
    ".venv",
    "__pycache__",
    ".mypy_cache",
    ".pytest_cache",
    "node_modules",
    "external",
    "legacy",
    "Archive",
}


@dataclass
class Evidence:
    path: str
    line: int
    snippet: str


@dataclass
class Hotspot:
    key: str
    title: str
    category: str
    score: int
    rationale: str
    evidence: List[Evidence]
    signals: Dict[str, int]


def normalize_snippet(line: str, max_len: int = 160) -> str:
    clean = " ".join(line.strip().split())
    if len(clean) <= max_len:
        return clean
    return clean[: max_len - 3] + "..."


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def iter_python_files(root: Path) -> Iterable[Path]:
    if not root.exists():
        return
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIR_NAMES]
        for name in filenames:
            if not name.endswith(".py"):
                continue
            yield Path(dirpath) / name


def find_literal_evidence(path: Path, literal: str, case_sensitive: bool = True) -> List[Evidence]:
    text = read_text(path)
    if case_sensitive:
        needle = literal
        lines = text.splitlines()
        out: List[Evidence] = []
        for idx, line in enumerate(lines, start=1):
            if needle in line:
                out.append(Evidence(path=path.as_posix(), line=idx, snippet=normalize_snippet(line)))
        return out

    needle = literal.lower()
    lines = text.splitlines()
    out = []
    for idx, line in enumerate(lines, start=1):
        if needle in line.lower():
            out.append(Evidence(path=path.as_posix(), line=idx, snippet=normalize_snippet(line)))
    return out


def find_regex_evidence(path: Path, pattern: str) -> List[Evidence]:
    compiled = re.compile(pattern)
    out: List[Evidence] = []
    for idx, line in enumerate(read_text(path).splitlines(), start=1):
        if compiled.search(line):
            out.append(Evidence(path=path.as_posix(), line=idx, snippet=normalize_snippet(line)))
    return out


def get_active_docs(root: Path) -> List[Path]:
    paths: List[Path] = []
    for candidate in ACTIVE_DOC_CANDIDATES:
        p = root / candidate
        if p.exists():
            paths.append(p)
    return paths


def clamp_score(value: int) -> int:
    if value < 0:
        return 0
    if value > 100:
        return 100
    return value


def compute_score(
    *,
    contradiction: int,
    ambiguity: int,
    staleness: int,
    blast_radius: int,
    evidence_count: int,
) -> int:
    # Weighted 1-5 dimensions with bounded evidence boost, normalized to 0-100.
    weighted = (
        contradiction * 3
        + ambiguity * 3
        + staleness * 2
        + blast_radius * 3
        + min(10, evidence_count) // 2
    )
    max_weighted = 60
    normalized = int(round((weighted / max_weighted) * 100))
    return clamp_score(normalized)


def check_duplicate_protocol_files(root: Path) -> Optional[Hotspot]:
    agents = root / "AGENTS.md"
    claude = root / "CLAUDE.md"
    if not agents.exists() or not claude.exists():
        return None

    agents_text = read_text(agents).strip()
    claude_text = read_text(claude).strip()
    if agents_text != claude_text:
        return None

    evidence: List[Evidence] = []
    evidence.extend(find_literal_evidence(agents, "# AGENTS.md", case_sensitive=False)[:1])
    evidence.extend(find_literal_evidence(claude, "# AGENTS.md", case_sensitive=False)[:1])

    score = compute_score(
        contradiction=4,
        ambiguity=5,
        staleness=3,
        blast_radius=4,
        evidence_count=len(evidence),
    )
    return Hotspot(
        key="duplicate-protocol-files",
        title="Duplicate protocol docs with overlapping authority",
        category="documentation",
        score=score,
        rationale=(
            "AGENTS.md and CLAUDE.md currently contain identical protocol content, "
            "which can create split-brain updates and unclear ownership."
        ),
        evidence=evidence,
        signals={"identical_files": 1, "evidence_count": len(evidence)},
    )


def check_stale_branch_references(root: Path, active_docs: Sequence[Path]) -> Optional[Hotspot]:
    matches: List[Evidence] = []
    for doc in active_docs:
        matches.extend(find_literal_evidence(doc, "feat/agi-agents", case_sensitive=False))

    if not matches:
        return None

    score = compute_score(
        contradiction=5,
        ambiguity=4,
        staleness=5,
        blast_radius=4,
        evidence_count=len(matches),
    )
    return Hotspot(
        key="stale-branch-references",
        title="Stale branch references in active docs",
        category="documentation",
        score=score,
        rationale=(
            "Active docs still reference feat/agi-agents, which is likely stale and can "
            "send contributors to the wrong base branch."
        ),
        evidence=matches[:12],
        signals={"reference_count": len(matches), "active_docs_with_reference": len({m.path for m in matches})},
    )


def check_active_port_drift(active_docs: Sequence[Path]) -> Optional[Hotspot]:
    port_regex = re.compile(r"\b(9000|9009|9010|9021)\b")
    by_port: Dict[str, List[Evidence]] = {"9000": [], "9009": [], "9010": [], "9021": []}

    for doc in active_docs:
        for idx, line in enumerate(read_text(doc).splitlines(), start=1):
            found = set(port_regex.findall(line))
            for port in found:
                by_port[port].append(
                    Evidence(path=doc.as_posix(), line=idx, snippet=normalize_snippet(line))
                )

    active_port_count = sum(1 for port, refs in by_port.items() if refs)
    has_conflict = bool(by_port["9000"] and by_port["9009"])
    if active_port_count < 2 or not has_conflict:
        return None

    evidence: List[Evidence] = []
    evidence.extend(by_port["9000"][:4])
    evidence.extend(by_port["9009"][:4])
    evidence.extend(by_port["9010"][:2])
    evidence.extend(by_port["9021"][:2])

    score = compute_score(
        contradiction=4,
        ambiguity=4,
        staleness=3,
        blast_radius=4,
        evidence_count=len(evidence),
    )
    return Hotspot(
        key="active-port-drift",
        title="Port conventions drift across active docs",
        category="documentation",
        score=score,
        rationale=(
            "Active documentation references both legacy and current ports, creating "
            "ambiguity for runbooks and smoke tests."
        ),
        evidence=evidence,
        signals={
            "ports_observed": active_port_count,
            "refs_9000": len(by_port["9000"]),
            "refs_9009": len(by_port["9009"]),
            "refs_9010": len(by_port["9010"]),
            "refs_9021": len(by_port["9021"]),
        },
    )


def check_import_fallback_patterns(root: Path) -> Optional[Hotspot]:
    fallback_sites: List[Evidence] = []
    dual_import_files = 0

    for py_file in iter_python_files(root / "src"):
        text = read_text(py_file)
        has_src_import = "from src." in text
        has_non_src_import = bool(re.search(r"\n\s*from\s+[a-zA-Z_][\w\.]*\s+import", text))
        if "except ImportError" in text and has_src_import and has_non_src_import:
            dual_import_files += 1
            for idx, line in enumerate(text.splitlines(), start=1):
                if "except ImportError" in line:
                    fallback_sites.append(
                        Evidence(path=py_file.as_posix(), line=idx, snippet=normalize_snippet(line))
                    )

    if dual_import_files == 0:
        return None

    score = compute_score(
        contradiction=3,
        ambiguity=5,
        staleness=2,
        blast_radius=5,
        evidence_count=len(fallback_sites),
    )
    return Hotspot(
        key="dual-import-fallbacks",
        title="Dual import-fallback pathways in src",
        category="code",
        score=score,
        rationale=(
            "Many modules support both local and src-prefixed imports behind ImportError "
            "fallbacks, which can hide environment-specific failures."
        ),
        evidence=fallback_sites[:12],
        signals={"files_with_fallbacks": dual_import_files, "fallback_sites": len(fallback_sites)},
    )


def check_red_alias(root: Path) -> Optional[Hotspot]:
    target = root / "src/red_logic/orchestrator.py"
    if not target.exists():
        return None

    evidence = find_literal_evidence(target, "RedAgentV2 = RedAgentV3")
    if not evidence:
        return None

    score = compute_score(
        contradiction=4,
        ambiguity=5,
        staleness=3,
        blast_radius=4,
        evidence_count=len(evidence),
    )
    return Hotspot(
        key="red-agent-aliasing",
        title="Red agent version aliasing obscures true implementation",
        category="code",
        score=score,
        rationale=(
            "The alias RedAgentV2 = RedAgentV3 blurs version semantics for code readers, "
            "tests, and docs."
        ),
        evidence=evidence,
        signals={"alias_count": len(evidence)},
    )


def check_entrypoint_fragmentation(root: Path) -> Optional[Hotspot]:
    entrypoints: List[Evidence] = []

    search_paths: List[Path] = [root / "main.py"]
    search_paths.extend(iter_python_files(root / "src"))
    search_paths.extend(iter_python_files(root / "scripts"))
    search_paths.extend(iter_python_files(root / "tools"))

    # Deduplicate paths while preserving order.
    seen: set[str] = set()
    deduped_paths: List[Path] = []
    for path in search_paths:
        key = path.resolve().as_posix() if path.exists() else path.as_posix()
        if key in seen:
            continue
        seen.add(key)
        if path.exists() and path.is_file():
            deduped_paths.append(path)

    for py_file in deduped_paths:
        rel = py_file.relative_to(root).as_posix()
        for idx, line in enumerate(read_text(py_file).splitlines(), start=1):
            if "if __name__ == '__main__'" in line or 'if __name__ == "__main__"' in line:
                entrypoints.append(Evidence(path=rel, line=idx, snippet=normalize_snippet(line)))

    if len(entrypoints) <= 3:
        return None

    score = compute_score(
        contradiction=2,
        ambiguity=4,
        staleness=2,
        blast_radius=4,
        evidence_count=len(entrypoints),
    )
    return Hotspot(
        key="entrypoint-fragmentation",
        title="Many executable entrypoints increase run-path ambiguity",
        category="code",
        score=score,
        rationale=(
            "Multiple executable scripts can be useful, but without clear canonical "
            "guidance they create onboarding and debugging confusion."
        ),
        evidence=entrypoints[:12],
        signals={"entrypoint_count": len(entrypoints)},
    )


def check_dependency_surface(root: Path) -> Optional[Hotspot]:
    pyproject = root / "pyproject.toml"
    requirements = root / "requirements.txt"
    if not pyproject.exists() or not requirements.exists():
        return None

    req_lines = [
        line.strip()
        for line in read_text(requirements).splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]
    if not req_lines:
        return None

    evidence: List[Evidence] = []
    evidence.extend(find_literal_evidence(pyproject, "[project]", case_sensitive=True)[:1])

    first_req = req_lines[0]
    for idx, line in enumerate(read_text(requirements).splitlines(), start=1):
        if line.strip() == first_req:
            evidence.append(
                Evidence(path="requirements.txt", line=idx, snippet=normalize_snippet(line))
            )
            break

    score = compute_score(
        contradiction=3,
        ambiguity=4,
        staleness=2,
        blast_radius=4,
        evidence_count=len(evidence),
    )
    return Hotspot(
        key="dual-dependency-surfaces",
        title="Dual dependency surfaces without explicit precedence",
        category="tooling",
        score=score,
        rationale=(
            "Both pyproject.toml and requirements.txt are present, which can diverge unless "
            "the install path and precedence are explicit."
        ),
        evidence=evidence,
        signals={"requirements_entries": len(req_lines)},
    )


def check_test_location_scatter(root: Path) -> Optional[Hotspot]:
    test_in_tests = list((root / "tests").rglob("test_*.py")) if (root / "tests").exists() else []
    test_in_src = list((root / "src").rglob("test_*.py")) if (root / "src").exists() else []

    if not test_in_tests or not test_in_src:
        return None

    evidence: List[Evidence] = []
    for path in sorted(test_in_tests)[:4]:
        evidence.append(Evidence(path=path.relative_to(root).as_posix(), line=1, snippet="test file"))
    for path in sorted(test_in_src)[:4]:
        evidence.append(Evidence(path=path.relative_to(root).as_posix(), line=1, snippet="test file"))

    score = compute_score(
        contradiction=2,
        ambiguity=4,
        staleness=2,
        blast_radius=3,
        evidence_count=len(evidence),
    )
    return Hotspot(
        key="test-location-scatter",
        title="Tests spread across src and tests directories",
        category="tooling",
        score=score,
        rationale=(
            "Split test locations can cause hidden coverage gaps when default pytest "
            "discovery targets only one location."
        ),
        evidence=evidence,
        signals={"tests_dir_count": len(test_in_tests), "src_dir_count": len(test_in_src)},
    )


def check_source_of_truth_ambiguity(active_docs: Sequence[Path]) -> Optional[Hotspot]:
    matches: List[Evidence] = []
    for doc in active_docs:
        if fnmatch.fnmatch(doc.as_posix(), "*/Archive/*"):
            continue
        matches.extend(find_literal_evidence(doc, "source of truth", case_sensitive=False))

    doc_paths = {m.path for m in matches}
    if len(doc_paths) <= 1:
        return None

    score = compute_score(
        contradiction=4,
        ambiguity=4,
        staleness=3,
        blast_radius=4,
        evidence_count=len(matches),
    )
    return Hotspot(
        key="source-of-truth-ambiguity",
        title="Source-of-truth statements are distributed across docs",
        category="documentation",
        score=score,
        rationale=(
            "Multiple active docs declaring source-of-truth semantics can confuse where "
            "final authority actually lives."
        ),
        evidence=matches[:12],
        signals={"docs_with_phrase": len(doc_paths), "match_count": len(matches)},
    )


def collect_hotspots(root: Path) -> List[Hotspot]:
    active_docs = get_active_docs(root)

    checks = [
        check_duplicate_protocol_files(root),
        check_stale_branch_references(root, active_docs),
        check_active_port_drift(active_docs),
        check_source_of_truth_ambiguity(active_docs),
        check_import_fallback_patterns(root),
        check_red_alias(root),
        check_entrypoint_fragmentation(root),
        check_dependency_surface(root),
        check_test_location_scatter(root),
    ]

    out = [c for c in checks if c is not None]
    out.sort(key=lambda item: item.score, reverse=True)
    return out


def write_json_report(path: Path, payload: Dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def format_markdown_report(payload: Dict[str, object]) -> str:
    generated_at = payload["generated_at"]
    root = payload["root"]
    hotspots = payload["hotspots"]
    summary = payload["summary"]

    lines: List[str] = []
    lines.append("# Repository Confusion Audit")
    lines.append("")
    lines.append(f"Generated at: {generated_at}")
    lines.append(f"Repository root: {root}")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- Total hotspots: {summary['total_hotspots']}")
    lines.append(f"- Documentation hotspots: {summary['documentation_hotspots']}")
    lines.append(f"- Code hotspots: {summary['code_hotspots']}")
    lines.append(f"- Tooling hotspots: {summary['tooling_hotspots']}")
    lines.append("")

    lines.append("## Ranked Hotspots")
    lines.append("")
    lines.append("| Rank | Score | Category | Hotspot |")
    lines.append("| --- | --- | --- | --- |")
    for idx, hotspot in enumerate(hotspots, start=1):
        lines.append(
            f"| {idx} | {hotspot['score']} | {hotspot['category']} | {hotspot['title']} |"
        )
    lines.append("")

    lines.append("## Details")
    lines.append("")
    for idx, hotspot in enumerate(hotspots, start=1):
        lines.append(f"### {idx}. {hotspot['title']}")
        lines.append("")
        lines.append(f"- Category: {hotspot['category']}")
        lines.append(f"- Score: {hotspot['score']}")
        lines.append(f"- Rationale: {hotspot['rationale']}")
        lines.append("- Signals:")
        for key, value in hotspot["signals"].items():
            lines.append(f"  - {key}: {value}")

        evidence = hotspot["evidence"]
        if evidence:
            lines.append("- Evidence:")
            for item in evidence:
                lines.append(
                    f"  - {item['path']}:{item['line']} | {item['snippet']}"
                )
        lines.append("")

    return "\n".join(lines).strip() + "\n"


def write_markdown_report(path: Path, payload: Dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(format_markdown_report(payload), encoding="utf-8")


def build_payload(root: Path, hotspots: Sequence[Hotspot], max_hotspots: int) -> Dict[str, object]:
    selected = list(hotspots[:max_hotspots])
    summary = {
        "total_hotspots": len(selected),
        "documentation_hotspots": sum(1 for h in selected if h.category == "documentation"),
        "code_hotspots": sum(1 for h in selected if h.category == "code"),
        "tooling_hotspots": sum(1 for h in selected if h.category == "tooling"),
    }
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "root": root.as_posix(),
        "summary": summary,
        "hotspots": [
            {
                "key": h.key,
                "title": h.title,
                "category": h.category,
                "score": h.score,
                "rationale": h.rationale,
                "signals": h.signals,
                "evidence": [asdict(e) for e in h.evidence],
            }
            for h in selected
        ],
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate a repository confusion audit report.")
    parser.add_argument(
        "--root",
        default=None,
        help="Repository root. Defaults to the parent directory of this script.",
    )
    parser.add_argument(
        "--output-md",
        default="output/confusion-audit/latest.md",
        help="Markdown report output path, relative to root.",
    )
    parser.add_argument(
        "--output-json",
        default="output/confusion-audit/latest.json",
        help="JSON report output path, relative to root.",
    )
    parser.add_argument(
        "--max-hotspots",
        type=int,
        default=15,
        help="Max number of ranked hotspots to emit.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.root).resolve() if args.root else Path(__file__).resolve().parents[1]

    hotspots = collect_hotspots(root)
    payload = build_payload(root, hotspots, max_hotspots=max(1, args.max_hotspots))

    md_path = root / args.output_md
    json_path = root / args.output_json
    write_markdown_report(md_path, payload)
    write_json_report(json_path, payload)

    print(f"Generated confusion audit markdown: {md_path.as_posix()}")
    print(f"Generated confusion audit json: {json_path.as_posix()}")
    print(f"Hotspots found: {payload['summary']['total_hotspots']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
