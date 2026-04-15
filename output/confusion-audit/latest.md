# Repository Confusion Audit

Generated at: 2026-04-14T06:14:10.755607+00:00
Repository root: C:/Users/Josh/Documents/LogoMesh

## Summary

- Total hotspots: 8
- Documentation hotspots: 3
- Code hotspots: 3
- Tooling hotspots: 2

## Ranked Hotspots

| Rank | Score | Category | Hotspot |
| --- | --- | --- | --- |
| 1 | 87 | documentation | Stale branch references in active docs |
| 2 | 80 | code | Dual import-fallback pathways in src |
| 3 | 78 | documentation | Port conventions drift across active docs |
| 4 | 77 | documentation | Source-of-truth statements are distributed across docs |
| 5 | 75 | code | Red agent version aliasing obscures true implementation |
| 6 | 65 | code | Many executable entrypoints increase run-path ambiguity |
| 7 | 63 | tooling | Dual dependency surfaces without explicit precedence |
| 8 | 57 | tooling | Tests spread across src and tests directories |

## Details

### 1. Stale branch references in active docs

- Category: documentation
- Score: 87
- Rationale: Active docs still reference feat/agi-agents, which is likely stale and can send contributors to the wrong base branch.
- Signals:
  - reference_count: 7
  - active_docs_with_reference: 2
- Evidence:
  - C:/Users/Josh/Documents/LogoMesh/CONTEXT_PROMPT.md:7 | You are continuing work on **LogoMesh**, a multi-agent AI code evaluation platform built for the UC Berkeley RDI AgentX AgentBeats competition. The repo is a...
  - C:/Users/Josh/Documents/LogoMesh/CONTEXT_PROMPT.md:372 | ### Recent Commits on feat/agi-agents
  - C:/Users/Josh/Documents/LogoMesh/CONTEXT_PROMPT.md:407 | cd LogoMesh && git checkout feat/agi-agents
  - C:/Users/Josh/Documents/LogoMesh/CONTEXT_PROMPT.md:424 | - Branch `feat/agi-agents` is the source of truth, not `master`.
  - C:/Users/Josh/Documents/LogoMesh/docs/02-Engineering/Developer-Guide.md:39 | git checkout feat/agi-agents # <-- active branch, master is stale
  - C:/Users/Josh/Documents/LogoMesh/docs/02-Engineering/Developer-Guide.md:445 | 1. The active branch is **`feat/agi-agents`** (master is stale)
  - C:/Users/Josh/Documents/LogoMesh/docs/02-Engineering/Developer-Guide.md:446 | 2. Create feature branches off `feat/agi-agents`

### 2. Dual import-fallback pathways in src

- Category: code
- Score: 80
- Rationale: Many modules support both local and src-prefixed imports behind ImportError fallbacks, which can hide environment-specific failures.
- Signals:
  - files_with_fallbacks: 10
  - fallback_sites: 32
- Evidence:
  - C:/Users/Josh/Documents/LogoMesh/src/memory.py:612 | except ImportError:
  - C:/Users/Josh/Documents/LogoMesh/src/memory.py:618 | except ImportError:
  - C:/Users/Josh/Documents/LogoMesh/src/task_intelligence.py:23 | except ImportError:
  - C:/Users/Josh/Documents/LogoMesh/src/task_intelligence.py:26 | except ImportError:
  - C:/Users/Josh/Documents/LogoMesh/src/green_logic/analyzer.py:24 | except ImportError:
  - C:/Users/Josh/Documents/LogoMesh/src/green_logic/analyzer.py:31 | except ImportError:
  - C:/Users/Josh/Documents/LogoMesh/src/green_logic/generator.py:22 | except ImportError:
  - C:/Users/Josh/Documents/LogoMesh/src/green_logic/generator.py:25 | except ImportError:
  - C:/Users/Josh/Documents/LogoMesh/src/green_logic/refinement_loop.py:58 | except ImportError:
  - C:/Users/Josh/Documents/LogoMesh/src/green_logic/refinement_loop.py:65 | except ImportError:
  - C:/Users/Josh/Documents/LogoMesh/src/green_logic/refinement_loop.py:72 | except ImportError:
  - C:/Users/Josh/Documents/LogoMesh/src/green_logic/refinement_loop.py:75 | except ImportError:

### 3. Port conventions drift across active docs

- Category: documentation
- Score: 78
- Rationale: Active documentation references both legacy and current ports, creating ambiguity for runbooks and smoke tests.
- Signals:
  - ports_observed: 4
  - refs_9000: 4
  - refs_9009: 23
  - refs_9010: 16
  - refs_9021: 3
- Evidence:
  - C:/Users/Josh/Documents/LogoMesh/docs/05-Competition/Agent-Architecture.md:29 | │ │ Port 9000 │ Solution │ Port 9001 │ │
  - C:/Users/Josh/Documents/LogoMesh/docs/05-Competition/Agent-Architecture.md:53 | | **Green** | Judge/Assessor | 9000 | Orchestrates battles, evaluates responses, computes CIS |
  - C:/Users/Josh/Documents/LogoMesh/docs/05-Competition/Agent-Architecture.md:389 | | Green Agent (Judge) | http://localhost:9000 |
  - C:/Users/Josh/Documents/LogoMesh/docs/05-Competition/Agent-Architecture.md:396 | curl -X POST http://localhost:9000/battle \
  - C:/Users/Josh/Documents/LogoMesh/README.md:120 | uv run main.py --role GREEN --host 0.0.0.0 --port 9009 &
  - C:/Users/Josh/Documents/LogoMesh/README.md:123 | curl -X POST http://localhost:9009/actions/send_coding_task \
  - C:/Users/Josh/Documents/LogoMesh/README.md:149 | docker run -p 9009:9009 \
  - C:/Users/Josh/Documents/LogoMesh/README.md:152 | logomesh-green:latest --host 0.0.0.0 --port 9009
  - C:/Users/Josh/Documents/LogoMesh/README.md:117 | uv run main.py --role PURPLE --host 0.0.0.0 --port 9010 &
  - C:/Users/Josh/Documents/LogoMesh/README.md:127 | "purple_agent_url": "http://localhost:9010/",
  - C:/Users/Josh/Documents/LogoMesh/docs/05-Competition/Agent-Architecture.md:38 | │ │ Port 9021 │ │
  - C:/Users/Josh/Documents/LogoMesh/docs/05-Competition/Agent-Architecture.md:55 | | **Red** | Attacker | 9021 | Finds vulnerabilities in Purple's code |

### 4. Source-of-truth statements are distributed across docs

- Category: documentation
- Score: 77
- Rationale: Multiple active docs declaring source-of-truth semantics can confuse where final authority actually lives.
- Signals:
  - docs_with_phrase: 6
  - match_count: 8
- Evidence:
  - C:/Users/Josh/Documents/LogoMesh/README.md:280 | | Single source of truth per signal | Test failures only penalize T, not T + L + CIS |
  - C:/Users/Josh/Documents/LogoMesh/AGENTS.md:5 | **Before completing any task, update documentation to maintain system integrity.** The single source of truth is `docs/00_CURRENT_TRUTH_SOURCE.md`—if your wo...
  - C:/Users/Josh/Documents/LogoMesh/CLAUDE.md:5 | **Before completing any task, update documentation to maintain system integrity.** The single source of truth is `docs/00_CURRENT_TRUTH_SOURCE.md`—if your wo...
  - C:/Users/Josh/Documents/LogoMesh/CONTEXT_PROMPT.md:424 | - Branch `feat/agi-agents` is the source of truth, not `master`.
  - C:/Users/Josh/Documents/LogoMesh/docs/05-Competition/Judges-Start-Here.md:88 | | Component | Name | Source of Truth | Range |
  - C:/Users/Josh/Documents/LogoMesh/docs/04-Operations/Dual-Track-Arena/README.md:7 | > * [2026-01-03]: The temporary source of truth for the Dual-Track Arena (Custom Green Agent & Lambda Red/Blue Track).
  - C:/Users/Josh/Documents/LogoMesh/docs/04-Operations/Dual-Track-Arena/README.md:9 | # Dual-Track Arena: Temporary Source of Truth
  - C:/Users/Josh/Documents/LogoMesh/docs/04-Operations/Dual-Track-Arena/README.md:13 | This directory serves as the **Operational Source of Truth** for the "Agent Arena." It consolidates the state, plans, and documentation for the agents compet...

### 5. Red agent version aliasing obscures true implementation

- Category: code
- Score: 75
- Rationale: The alias RedAgentV2 = RedAgentV3 blurs version semantics for code readers, tests, and docs.
- Signals:
  - alias_count: 1
- Evidence:
  - C:/Users/Josh/Documents/LogoMesh/src/red_logic/orchestrator.py:1736 | RedAgentV2 = RedAgentV3

### 6. Many executable entrypoints increase run-path ambiguity

- Category: code
- Score: 65
- Rationale: Multiple executable scripts can be useful, but without clear canonical guidance they create onboarding and debugging confusion.
- Signals:
  - entrypoint_count: 18
- Evidence:
  - main.py:62 | if __name__ == "__main__":
  - src/agentbeats/client_cli.py:111 | if __name__ == "__main__":
  - src/agentbeats/run_scenario.py:183 | if __name__ == "__main__":
  - src/green_logic/harmony_parser.py:219 | if __name__ == "__main__":
  - src/green_logic/test_harmony_integration.py:149 | if __name__ == "__main__":
  - src/red_logic/test_red_agent_v2.py:316 | if __name__ == "__main__":
  - scripts/analyze_c_new_001_results.py:260 | if __name__ == '__main__':
  - scripts/check_persistence.py:36 | if __name__ == "__main__":
  - scripts/extract_agent_thinking.py:90 | if __name__ == "__main__":
  - scripts/run_tier2_qwen.py:164 | if __name__ == "__main__":
  - scripts/screenshot_graph.py:25 | if __name__ == "__main__":
  - scripts/test_streaming.py:62 | if __name__ == "__main__":

### 7. Dual dependency surfaces without explicit precedence

- Category: tooling
- Score: 63
- Rationale: Both pyproject.toml and requirements.txt are present, which can diverge unless the install path and precedence are explicit.
- Signals:
  - requirements_entries: 16
- Evidence:
  - C:/Users/Josh/Documents/LogoMesh/pyproject.toml:5 | [project]
  - requirements.txt:4 | a2a-sdk>=0.3.5

### 8. Tests spread across src and tests directories

- Category: tooling
- Score: 57
- Rationale: Split test locations can cause hidden coverage gaps when default pytest discovery targets only one location.
- Signals:
  - tests_dir_count: 6
  - src_dir_count: 2
- Evidence:
  - tests/test_analyzer.py:1 | test file
  - tests/test_harmony_parser.py:1 | test file
  - tests/test_leaderboard_query.py:1 | test file
  - tests/test_red_agent_v2.py:1 | test file
  - src/green_logic/test_harmony_integration.py:1 | test file
  - src/red_logic/test_red_agent_v2.py:1 | test file
