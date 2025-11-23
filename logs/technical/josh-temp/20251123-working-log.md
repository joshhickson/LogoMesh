# Working Log - 2025-11-23

*Transcribed from `logs/technical/josh-temp/251123_0338 (transcribed on 23-Nov-2025 14-59-11).txt`*

## Primary Goal: Improve Clarity and Define Tasks

The main objective is to clarify the direction for the LogoMesh team and break down the work into granular tasks.

## "Big Brain Idea": Documentation & Contextual Integrity

The core idea is to visualize the contextual relationships between all documents in the `docs/` and `logs/` directories using simple graph theory. This is outlined in the work-in-progress file:

- `logs/technical/20251122-Documentation-Graph-Setup.md`

The plan is to apply the proposed logic for the "Contextual Integrity Score" (CIS) to this documentation graph. The logic for the CIS is detailed in:

- `docs/strategy_and_ip/DOC-REVISIONS/20251118-proposed-Section-2.2.md`

The goal is not to generate a "contextual debt" score for the documentation, but simply to visualize the connections and understand which documents reference each other. The results of this analysis should be viewable in the `onboarding/` website.

## Related Strategic Documents

Several other documents provide context for this work:

- **Strategic Pivot Plan:** Proposes a pivot to implement the recovery plan, with details on the CIS formulation.
  - `logs/ip_and_business/20251118-Strategic-Pivot-Plan-CIS-Formalization.md`
- **Recovery Plan:** The most recent plan currently in active implementation.
  - `logs/technical/20251113_RECOVERY_PLAN.md`

## Core Problem: Documentation Management

The biggest challenge is the organization of the `docs/` and `logs/` folders.
- **Redundancy:** Having two separate root-level directories for documentation is inefficient.
- **Reference Rot:** Renaming or moving a document breaks all existing references to it in other files, leading to a loss of context.

## Proposed Solution: A Revisionary Plan

Before implementing the documentation graph, a clear plan is needed to manage the documentation itself. This plan must address:

1.  **Consolidation:** Reach a consensus on how to efficiently organize, move, and archive existing documentation to improve context.
2.  **Automated Reference Updates:** Develop a method to automatically find and update all references to a file when it is renamed or moved.
3.  **Changelog:** Create a log file to track all document revisions made during this process.

This "documentation revision plan" is a prerequisite for the larger goal of visualizing and analyzing the document relationships. The idea is to potentially simplify the proposed CIS logic to tackle this specific documentation problem first.
