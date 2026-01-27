
---
status: DRAFT
type: Log
---
> **Context:**
> *   2026-01-26: Source code and documentation audit for AgentBeats final submission. This log will capture outdated, disorganized, or missing documentation/code, and track triage and consolidation actions.

# AgentBeats Submission Audit Log

## Purpose
To systematically review, triage, and consolidate source code and documentation for the AgentBeats competition submission. **The /docs/ folder is being prepared for a near-complete overhaul to ensure that only necessary, current, and submission-critical files remain. The explicit goal is to eliminate all obsolete, redundant, or unnecessary documents before final repository submission for the AgentX AgentBeats competition.**

> **Nuance:** File labeling (e.g., ACTIVE, DEPRECATED) and index references are ideally consistent, but in practice may be imperfect due to human or agentic error. Therefore, the documentation overhaul must be guided not only by labels or master index references, but by a direct comparison of documentation content against the current review of the codebase (see detailed code audit below, lines 102–333). Human/agentic judgment and cross-referencing are required to ensure that all critical features, architecture, and requirements reflected in the code are actually documented, regardless of file status tags or navigation structure.

This log will record findings, action items, and decisions, and serve as a handoff artifact for autonomous agents tasked with executing this documentation overhaul.

## Audit Checklist

- [x] List and review all main agent logic files (src/green_logic/, src/purple_logic/, src/red_logic/)
  - Complete file-by-file audit of all agent logic files, with structured summaries in this log.

- [x] Review and triage documentation in priority order, with the explicit intent to prepare /docs/ for a near-complete overhaul:
  1. **Docs root folder:**
    - 00_CURRENT_TRUTH_SOURCE.md (master index)
    - Docs-Management-Instruction-Manual.md (documentation protocol)
    - index.rst (navigation root)
    - TEMPLATE_DOC.md (doc template)
    - requirements.txt, Makefile, make.bat, conf.py (build/config files)
  2. **Master index and navigation files:**
    - Use 00_CURRENT_TRUTH_SOURCE.md and index.rst to identify critical/active docs.
  3. **Escalate to subfolders only as needed:**
    - Review docs/00-Strategy/, docs/01-Architecture/, docs/02-Engineering/, docs/03-Research/, docs/04-Operations/, docs/05-Competition/ only if referenced or required.
  4. **Prepare for large-scale removal and consolidation:**
    - Identify all files not required for submission, not referenced in the master index, or not supported by the current code review for removal or archival.

- [ ] Identify outdated, draft, or superseded files:
  - Mark files as DEPRECATED or SNAPSHOT as appropriate.
  - Log all findings in this audit log.

- [x] Cross-reference code and documentation for coverage and gaps:
  - Ensure all critical code features and architecture are documented in ACTIVE or REVIEW docs.
  - Note any missing, outdated, or inconsistent documentation.

- [ ] Prioritize files for update, consolidation, or removal:
  - Focus on ACTIVE, required, or submission-critical docs.
  - Propose consolidation or removal of obsolete planning/log files.
  - **Explicitly plan for the removal of all unnecessary files from /docs/ prior to submission.**

## Findings

### Documentation Review and Overhaul Approach

Given the large volume of planning and legacy documents (over 240 files across the main documentation folders), a full review is not feasible before the submission deadline. **Instead, this audit log mandates a near-complete upheaval of the /docs/ folder: all files not required for submission, not referenced in the master index, or not marked as ACTIVE will be targeted for removal or archival.**

**Prioritized approach:**

1. **Start with the docs root folder:**
  - Review and triage the following key files:
    - 00_CURRENT_TRUTH_SOURCE.md (master index and single source of truth)
    - Docs-Management-Instruction-Manual.md (documentation protocol)
    - index.rst (Sphinx/ReadTheDocs navigation root)
    - TEMPLATE_DOC.md (doc template and metadata requirements)
    - requirements.txt, Makefile, make.bat, conf.py (build/config files)
  - These files define the current documentation structure, protocols, and navigation, and are the best starting point for identifying what is current, required, or deprecated.

2. **Use the master index and navigation files to identify critical/active docs:**
  - Rely on 00_CURRENT_TRUTH_SOURCE.md and index.rst to surface the most important and up-to-date documents.
  - Only escalate to subfolders (00-Strategy, 01-Architecture, etc.) if referenced by the master index or if gaps are found in the root-level review.

3. **Triage-first for all other docs:**
  - Do not attempt to review every planning or log file.
  - Focus on files that are:
    - Referenced in the master index or navigation
    - Marked as ACTIVE or required for submission
    - Directly related to competition requirements or current architecture
    - Or, most importantly, that are necessary to document features, requirements, or architecture identified in the current code review (see below).

4. **Prepare for large-scale removal:**
  - All files not meeting the above criteria should be marked for removal or archival.
  - **Do not rely solely on file status tags or index references; cross-reference all documentation against the code audit to ensure nothing critical is lost.**
  - The final /docs/ folder should be lean, current, and submission-ready, with no obsolete or redundant files.

5. **Log all findings and triage actions in this audit log.**

This approach maximizes impact, ensures compliance with competition requirements, and minimizes wasted effort on outdated or superseded planning documents. **The intent is to leave the repository in a state where only essential, up-to-date documentation remains.**
---
status: DRAFT
type: Log
---
> **Context:**
> *   2026-01-26: Source code and documentation audit for AgentBeats final submission. This log will capture outdated, disorganized, or missing documentation/code, and track triage and consolidation actions.

# AgentBeats Submission Audit Log

## Purpose
To systematically review, triage, and consolidate source code and documentation for the AgentBeats competition submission. This log will record findings, action items, and decisions.

## Audit Checklist
- [ ] List and review all main agent logic files (src/green_logic/, src/purple_logic/, src/red_logic/)
- [ ] List and review all docs in docs/05-Competition, docs/04-Operations, docs/01-Architecture, docs/00-Strategy
- [ ] Identify outdated, draft, or superseded files
- [ ] Cross-reference code and documentation for coverage and gaps
- [ ] Prioritize files for update, consolidation, or removal

## Findings

### Main Agent Logic Files

#### src/green_logic/
  - YAML configuration file defining both architecture and test constraints for CIS evaluation.
  - Structure:
    - For each task (e.g., task-001: Email Validator, task-002: Rate Limiter, etc.), specifies constraints under a constraints: block.
    - Constraints include forbidden/required/recommended imports, forbidden patterns, penalties (as multipliers), and rationales for each rule.
    - Penalties are multiplicative and non-cumulative (max penalty applies for multiple violations).
    - Includes both static (import/pattern) and dynamic (sandbox) checks.
  - Also defines test requirements for each task (e.g., task-001-tests), specifying required test patterns, descriptions, and weights for each pattern.
    - Test evaluation notes describe how specificity multipliers are calculated for testing_score.
  - Extensively commented, with clear rationale and scoring notes for each section.
  - Critical for compliance-based evaluation, as referenced by the scoring logic and analyzer modules.
  - File is up-to-date, well-structured, and directly supports both architecture_score and testing_score in the CIS pipeline.

- compare_vectors.py
  - Implements the VectorScorer class for vector-based text similarity using sentence-transformers and scipy.
  - Loads a lightweight embedding model (default: all-MiniLM-L6-v2) for efficient inference.
  - Key methods:
    - get_embedding(text): Generates an embedding vector for a given text string.
    - calculate_similarity(text1, text2): Computes cosine similarity between two texts, returning a score between 0 and 1. Handles empty input and clamps output to [0, 1].
  - Includes a top-level compare_texts() function for one-off similarity comparisons without manual class instantiation.
  - Used for quantifying alignment between intent, rationale, and code in the CIS pipeline (core to vector math scoring).
  - Code is modern, focused, and production-ready, with clear docstrings and robust handling of edge cases.

- generator.py
  - Implements the TestGenerator class for dynamic adversarial test generation using both an LLM (Qwen-2.5-Coder) and a programmatic fuzzer.
  - Key features:
    - **Programmatic Fuzzer:** Includes `CodeAnalyzer` (AST-based) and `generate_fuzz_tests` to systematically generate edge case tests (empty inputs, boundaries, type confusion) without LLM dependency.
    - **LLM-Based Generation:** `generate_adversarial_tests` prompts the LLM to generate 3 additional adversarial tests targeting complex logic gaps.
    - **Hybrid Strategy:** Combines deterministic fuzz tests with creative LLM tests for maximum coverage.
    - Robust error handling: Falls back to fuzz tests if LLM fails, or a safe `FALLBACK_TEST` if both fail.
  - Code is modern, robust, and now significantly enhanced with deterministic testing capabilities.

- harmony_parser.py
  - Implements the HarmonyParser class for parsing responses from gpt-oss-20b models using the Harmony Response Format.
  - Key features:
    - parse(response_text): Extracts structured channels (analysis, final, etc.) from XML-style tags, mapping them to a dictionary. Handles both standard and fallback formats.
    - extract_code_from_final(final_content): Extracts code from the 'final' channel, handling JSON, markdown, and plain code formats.
    - extract_rationale_from_analysis(analysis_content): Extracts design rationale from the 'analysis' channel, using regex patterns for rationale/approach/reasoning sections.
    - format_for_display(parsed, max_length): Formats parsed output for human-readable display, previewing analysis and final channels.
  - Extensively documented, with clear references to Harmony protocol and example usage/test cases in the main block.
  - Handles edge cases and fallback scenarios robustly, ensuring graceful degradation if Harmony format is not detected.
  - Used for parsing model outputs for CIS validation, especially for extracting requirements (intent) and code for scoring.
  - Code is modern, modular, and production-ready, with strong regex handling and clear separation of parsing logic.

- red_report_parser.py
  - Implements the RedReportParser class for parsing Red Agent responses into structured vulnerability reports.
  - Key features:
    - parse(red_result_data): Main entry point. Extracts text from A2A JSON-RPC response, attempts structured JSON parsing, and falls back to keyword-based detection if needed.
    - _extract_text(red_result_data): Extracts text content from various possible A2A response structures, with robust fallbacks and debug logging.
    - _try_parse_structured(raw_text): Attempts to parse a JSON object from the response, cleaning up LLM artifacts and comments. Validates required fields and builds a RedAgentReport with vulnerabilities.
    - _parse_with_keywords(raw_text): If structured parsing fails, uses regex patterns to detect exploit keywords and severity, building vulnerabilities and determining attack success.
  - Uses EXPLOIT_KEYWORDS and SUCCESS_INDICATORS to map text patterns to severity levels and attack outcomes.
  - Imports and builds RedAgentReport, Vulnerability, and Severity objects from red_report_types.
  - Handles both structured and unstructured Red Agent outputs, ensuring robust parsing for CIS penalty calculation.
  - Code is modern, modular, and production-ready, with strong error handling and debug output for traceability.

- red_report_types.py
  - Defines structured data types for Red Agent vulnerability reports, used by the scoring system for CIS penalty calculation.
  - Key components:
    - Severity (Enum): CVSS-like severity levels (CRITICAL, HIGH, MEDIUM, LOW, INFO) with associated penalty percentages.
    - Vulnerability (dataclass): Represents a single vulnerability, including severity, category, title, description, exploit code, line number, and confidence.
    - RedAgentReport (dataclass): Structured report containing attack_successful flag, list of vulnerabilities, attack summary, and raw response for debugging.
      - get_max_severity(): Returns the highest severity among all vulnerabilities.
      - get_penalty_multiplier(): Returns a penalty multiplier (1.0 = no penalty, 0.6 = max penalty) based on the highest severity found.
  - Used by red_report_parser and scoring logic to apply severity-based penalties to CIS scores.
  - Code is modern, type-annotated, and production-ready, with clear docstrings and robust handling of edge cases.

- sandbox.py
  - Implements the Sandbox class for secure, isolated code execution using Docker containers.
  - Key features:
    - **Security Upgrade:** Uses `put_archive` to copy files into containers (no volume mounts), ensuring compatibility with Docker-in-Docker (dind) environments and improving isolation.
    - **No-Pytest Dependency:** Generates a dynamic `runner.py` to execute tests using the standard `unittest` library, reducing dependencies inside the container.
    - **Strict Isolation:** Runs with `network_disabled=True`, memory limits (128m), and CPU quotas to prevent resource exhaustion attacks.
    - Robust cleanup: Ensures containers are stopped/removed even on timeout or error.
  - Code is modern, secure, and production-ready.

- scoring.py
  - Implements the ContextualIntegrityScorer class, the core of the Green Agent’s CIS scoring pipeline.
  - Key features:
    - **Embedded Red Agent Support:** Now accepts a direct `RedAgentReport` object (skipping parsing) to support the embedded Red Agent architecture.
    - Integrates LLM-based logic review, vector similarity scoring, static/dynamic analysis, and Red Agent vulnerability reports.
    - Loads architecture and test constraints from YAML; applies penalties for violations.
    - _perform_logic_review(): Prompts LLM for code review and logic scoring, deterministic with fixed seed/temperature.
    - evaluate(): Main async method. Computes all scores (R, A, T, L), applies Red Agent penalties, anchors logic score to test results, and returns a detailed evaluation dict.
  - Handles all error cases robustly, with clear debug output and fallback logic.
  - Code is modern, modular, and production-ready, with extensive docstrings and comments.

- server.py
  - Implements the FastAPI server for the Green Agent, orchestrating the full evaluation pipeline.
  - Key features:
    - **Embedded Red Agent:** Directly initializes `RedAgentV2` from `src.red_logic` if available, removing the need for a separate Red Agent microservice for local/internal checks.
    - Exposes endpoints for A2A protocol, agent card discovery, and coding task evaluation.
    - **Orchestration:** Coordinates Purple Agent (Defender) and Red Agent (Attacker) execution.
    - `send_coding_task_action`: Sends task to Purple Agent, invokes embedded Red Agent (if active), runs static/dynamic analysis, and computes CIS.
    - Integrates GreenAgent, ContextualIntegrityScorer, SemanticAuditor, TestGenerator, and Docker-based Sandbox.
  - Code is modern, modular, and production-ready. **Major architectural shift: Monolith capability (embedded Red Agent) now supported.**

- tasks.py
  - Defines the CODING_TASKS list, a comprehensive set of coding challenges for Purple Agent evaluation.
  - Each task includes:
    - id, title, and detailed description with requirements and constraints.
    - Optional hidden_tests for Green Agent-only validation.
    - Constraints for static/dynamic analysis (e.g., require_recursion, forbid_loops, allowed_imports).
  - Tasks cover a wide range of topics: validation, data structures, algorithms, security, blockchain, concurrency, system design, and more.
  - Used by the Green Agent server to select, describe, and evaluate tasks in the competition pipeline.
  - File is up-to-date, well-structured, and critical for orchestrating the evaluation and leaderboard process.

- test_harmony_integration.py
  - Integration test for the Harmony Protocol parser and ContextualIntegrityScorer.
  - Tests end-to-end parsing of gpt-oss-20b Harmony-formatted and standard A2A Purple Agent responses.
  - Verifies extraction and normalization of code, rationale, and test code from Harmony channels.

#### src/purple_logic/

- agent.py
  - Implements the entrypoint and server logic for the Purple Agent (Defender) using the A2A SDK and Starlette/uvicorn.
  - Key features:
    - Defines run_purple_agent(host, port): starts the Purple Agent server, printing startup info and configuring the agent card.
    - Uses AgentCard to describe the agent (name, description, URL, version, input/output modes, streaming capability).
    - Loads the model name from the OPENAI_MODEL environment variable (default: gpt-4o-mini).
    - Instantiates a GenericDefenderExecutor (from scenarios.security_arena.agents) as the agent's core executor.
    - Sets up an in-memory task store and a default request handler for A2A protocol requests.
    - Builds the Starlette application and runs it with uvicorn on the specified host/port.
  - Integrates with the broader A2A protocol and security_arena scenario framework.
  - Code is modern, concise, and production-ready, with clear separation of agent configuration, execution, and serving logic.

- __init__.py
  - Empty file (placeholder for Python package structure).

#### src/red_logic/

- agent.py
  - Entrypoint and server logic for the Red Agent (Attacker), supporting both legacy and hybrid (V2) modes.
  - Key features:
    - Defines run_red_agent(host, port, use_v2): starts the Red Agent server, printing startup info and configuring the agent card.
    - Supports both legacy GenericAttackerExecutor and new RedAgentV2Executor (hybrid multi-layer engine).
    - Loads configuration from environment variables (RED_AGENT_V2, RED_AGENT_TIMEOUT, etc.).
    - Integrates with A2A protocol, Starlette/uvicorn, and security_arena scenario framework.
    - Handles ImportError gracefully if V2 is unavailable.
  - Code is modern, robust, and production-ready, with clear separation of agent configuration, execution, and serving logic.

- dependency_analyzer.py
  - **New File:** Implements `DependencyAnalyzer` and `analyze_dependencies` for context-aware static analysis.
  - Key features:
    - Uses Python AST to analyze imports and usage patterns (data flow analysis).
    - Flags dangerous patterns (e.g., `subprocess.run`, `eval`, `pickle.loads`) with risk levels based on context.
    - Distinguishes between CRITICAL risks (user input) and lower risks (hardcoded values).
    - Includes heuristics for detecting user input (variable names, function parameters).
  - Significantly enhances the Red Agent's static analysis capabilities beyond simple regex.

- executor.py
  - Implements RedAgentV2Executor, the A2A protocol executor for the hybrid Red Agent.
  - Key features:
    - Wraps RedAgentV2 and exposes it via the A2A protocol for attack requests.
    - Receives attack requests, runs the hybrid engine, and returns structured vulnerability reports.
    - Logs initialization and execution steps for traceability.
    - Handles input parsing, error handling, and structured output.
  - Code is modular, type-annotated, and production-ready, with clear docstrings and robust error handling.

- orchestrator.py
  - Main orchestrator and core engine for RedAgentV2, the hybrid multi-layer vulnerability detection system.
  - Key features:
    - **Integrated Dependency Analyzer:** Now incorporates `dependency_analyzer` into Layer 1 (Static Analysis) for deeper, context-aware checks.
    - Orchestrates three layers: static workers, smart reasoning (LLM), and optional reflection.
    - Defines AttackConfig and AttackMetrics dataclasses for configuration and metrics.
    - Integrates static workers (StaticMirrorWorker, ConstraintBreakerWorker) and reasoning layers.
    - Provides async attack_code and RedAgentV2 classes for running full attack pipelines.
    - Designed for extensibility and robust time/resource management.
  - Code is modern, well-documented, and central to the Red Agent's advanced capabilities.

- reasoning.py
  - Implements SmartReasoningLayer and ReflectionLayer, the LLM-powered logic flaw and deep analysis layers.
  - Key features:
    - SmartReasoningLayer: Uses OpenAI LLMs to find logic flaws, edge cases, and business logic vulnerabilities missed by static analysis.
    - ReflectionLayer: Optional deeper analysis for complex or ambiguous cases.
    - Task-specific attack hints for targeted vulnerability discovery.
    - Bounded turns, hard timeouts, and lazy LLM initialization for reliability.
  - Code is advanced, modular, and production-ready, with strong focus on logic flaw detection and extensibility.

- test_red_agent_v2.py
  - Comprehensive test script for RedAgentV2, covering known vulnerabilities and attack scenarios.
  - Key features:
    - Defines test cases for SQL injection, eval injection, and other critical vulnerabilities.
    - Runs RedAgentV2 and validates detection of expected severity and category.
    - Designed to be run as a module for automated regression testing.
  - Code is clear, well-structured, and essential for validating Red Agent's effectiveness.

- workers/
  - base.py
    - Defines BaseWorker (abstract base class) and WorkerResult for all Red Agent workers.
    - WorkerResult: Holds vulnerabilities, execution time, and error info; provides severity helpers.
    - BaseWorker: Abstract class requiring name and analyze() methods for all workers.
    - Foundation for all specialized vulnerability detection workers.

  - constraint_breaker.py
    - Implements ConstraintBreakerWorker, which finds task-specific constraint violations.
    - Encodes all task constraints (forbidden imports, patterns, required/forbidden constructs) as TaskConstraint dataclasses.
    - Analyzes code for violations and reports vulnerabilities with severity and exploit hints.
    - References src/green_logic/tasks.py for constraint definitions.
    - Critical for enforcing compliance and catching specification violations.

  - static_mirror.py
    - Implements StaticMirrorWorker, which mirrors Green Agent's SemanticAuditor checks.
    - Detects forbidden imports, dangerous functions, SQL/command injection, high complexity, and deep nesting.
    - Ensures that any vulnerability penalized by Green Agent is also found by Red Agent.
    - Mirrors logic and thresholds from src/green_logic/analyzer.py for consistency.
    - Essential for robust, deterministic vulnerability detection.

  - __init__.py
    - Imports and exposes all Red Agent worker classes for package use.
    - No logic; serves as a package aggregator.

- __init__.py
  - Package initializer for red_logic; imports and exposes all core Red Agent classes and functions.
  - Provides a clear usage guide and re-exports orchestrator, executor, and agent entrypoints.
  - No logic; serves as a package aggregator and documentation point.

### Documentation Audit Findings

#### Root Folder (`docs/`)
- **00_CURRENT_TRUTH_SOURCE.md**: [ACTIVE] Critical Master Index.
- **Docs-Management-Instruction-Manual.md**: [ACTIVE] Critical for Sphinx/ReadTheDocs.
- **index.rst**: [ACTIVE] Navigation root.
- **TEMPLATE_DOC.md**: [ACTIVE] Standard template.

#### Competition (`docs/05-Competition/`)
- **Agent-Architecture.md**: [ACTIVE] Primary technical architecture doc. Referenced by Master Index.
- **Submission-Requirements-Matrix.md**: [ACTIVE] Referenced in Master Index.
- **Judges-Start-Here.md**: [ACTIVE] Referenced in Master Index.
- **Green-Agent-Detailed-Guide.md**: [REVIEW] Referenced by `Agent-Architecture.md` but contains extensive "Phase 1" context (Oct-Dec 2025). Recommend checking for obsolete content or consolidating.
- **Purple-Agent-Detailed-Guide.md**: [REVIEW] Similar to Green Guide. Likely contains historical Phase 1 info.
- **AgentBeats-Competition-Summary.md**: [REVIEW] Potential duplicate of `00_CURRENT_TRUTH_SOURCE.md` or `Judges-Start-Here.md`.

#### Operations (`docs/04-Operations/`)
- **Intent-Log/Technical/**: Contains ~40 legacy logs from Nov/Dec 2025.
  - **Status**: Mostly obsolete. Master Index only references `20251231-Polyglot-Consolidation-Master-Log.md` and `20260101-Agent-Arena-Upgrade-Plan.md`.
  - **Action**: Bulk archive pre-2026 logs to `docs/Archive/Logs/Technical/`.

#### Strategy (`docs/00-Strategy/`)
- **IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md**: [ACTIVE] Core theory document defining "Contextual Debt" and "CIS". Referenced by Master Index.

### Findings - Code vs. Documentation Gaps

A direct comparison between `src/` and `docs/05-Competition/Agent-Architecture.md` reveals the following discrepancies that must be reconciled:

1.  **Green Agent Filenames (Structural Drift):**
    -   **Documentation:** Lists `src/green_logic/orchestrator.py` and `src/green_logic/cis_scorer.py`.
    -   **Codebase:** Actual files are `src/green_logic/server.py` and `src/green_logic/scoring.py`.
    -   **Action:** Update `Agent-Architecture.md` to reflect actual filenames.

2.  **Scoring Formula (Logic Drift):**
    -   **Documentation:** Section 4 lists "Rationale Debt 33%, Architectural Debt 33%, Testing Debt 33%" (Total 100%).
    -   **Codebase:** `src/green_logic/scoring.py` implements Equal Weighting (0.25 each) for R, A, T, and L (Logic Score).
    -   **Action:** Update `Agent-Architecture.md` to match the 4-part CIS formula found in code and `00_CURRENT_TRUTH_SOURCE.md`.

3.  **Default Ports (Configuration Drift):**
    -   **Documentation:** Lists Green Agent on Port 9000.
    -   **Codebase:** `src/green_logic/server.py` defaults to Port 9040.
    -   **Action:** Verify intended port configuration and synchronize docs/code.

4.  **Agent Architecture (Embedding Drift):**
    -   **Documentation:** Likely describes Red Agent as a distinct microservice communicating via HTTP/A2A.
    -   **Codebase:** `src/green_logic/server.py` now supports and prefers an **Embedded Red Agent** (library mode) for internal vulnerability scanning, bypassing the network layer.
    -   **Action:** Update architecture documentation to reflect this dual-mode capability (Microservice vs. Embedded).

5.  **Testing Strategy (Capability Drift):**
    -   **Documentation:** Describes LLM-based test generation.
    -   **Codebase:** `src/green_logic/generator.py` now includes a **Programmatic Fuzzer** that generates deterministic edge case tests (AST-based) in addition to LLM tests.
    -   **Action:** Document the "Hybrid Testing Strategy" (Deterministic Fuzzing + Probabilistic LLM) in the Green Agent guide.

## Action Items

- [ ] **Fix `docs/05-Competition/Agent-Architecture.md`**: Update filenames, scoring weights, port numbers, and Red Agent embedding details.
- [ ] **Update Testing Documentation**: Document the new Programmatic Fuzzer in `Green-Agent-Detailed-Guide.md` or Architecture docs.
- [ ] Archive pre-2026 logs in `docs/04-Operations/Intent-Log/Technical/`.
- [ ] Review `docs/05-Competition/Green-Agent-Detailed-Guide.md` and `Purple-Agent-Detailed-Guide.md` for consolidation.
- [ ] Verify `docs/00_CURRENT_TRUTH_SOURCE.md` links are robust after any moves.

## Prompts for Future Sessions

To the next agent: Please execute the following "Documentation Cleanup" plan based on the findings above:

1.  **Archive Legacy Logs**:
    -   Create a directory `docs/Archive/Logs/Technical/`.
    -   Move all files in `docs/04-Operations/Intent-Log/Technical/` that are dated **before 2025-12-31** to this archive folder.
    -   Exceptions: Keep `20251231-Polyglot-Consolidation-Master-Log.md`.

2.  **Consolidate Competition Docs**:
    -   Review `docs/05-Competition/Green-Agent-Detailed-Guide.md`. If it is purely historical (Phase 1 rules), move it to `docs/Archive/Phase1/`. If it contains valid implementation details, ensure they are present in `Agent-Architecture.md` and then archive the guide.
    -   Do the same for `docs/05-Competition/Purple-Agent-Detailed-Guide.md`.

3.  **Sanity Check Links**:
    -   After moving files, run a quick grep or search to ensure `docs/00_CURRENT_TRUTH_SOURCE.md` and `docs/index.rst` do not point to missing files. Update links if necessary to point to the `Archive` location or the new consolidated location.

4.  **Reconcile Agent Architecture**:
    -   Edit `docs/05-Competition/Agent-Architecture.md`.
    -   Replace `orchestrator.py` with `server.py` and `cis_scorer.py` with `scoring.py` in the file structure tree.
    -   Update the "Contextual Debt Framework" table to reflect the 4-part CIS formula (Rationale, Architecture, Testing, Logic - 25% each).
    -   Update the Green Agent port to 9040.
    -   Add a section describing the "Embedded Red Agent" capability.
    -   Add a section describing the "Programmatic Fuzzer" in the Testing module.

## Notes
