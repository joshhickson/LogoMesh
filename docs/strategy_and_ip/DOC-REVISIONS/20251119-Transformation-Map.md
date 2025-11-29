# Transformation Map: Paper Refactoring (2025-11-19)

**Objective:** Transform the Research Paper from a "Manifesto" to a "Protocol" by injecting mathematical formalization and architectural definitions.

## 1. The Mathematical Core (New Section 3)
**Source:** `[docs/strategy_and_ip/DOC-REVISIONS/20251118-proposed-Section-2.2.md](docs/strategy_and_ip/DOC-REVISIONS/20251118-proposed-Section-2.2.md)`
**Target:** `[docs/strategy_and_ip/20251118-Copyright-Edition-Contextual-Debt-Paper.md](docs/strategy_and_ip/20251118-Copyright-Edition-Contextual-Debt-Paper.md)`
**Action:** Replace the rubric-based "Contextual Integrity Score (CIS) v0.1" section.

**New Content:**
- **3. Formalization: The Contextual Integrity Score (CIS)**
- **3.1 Rationale Integrity (R):** Vector Cosine Similarity.
- **3.2 Architectural Integrity (A):** Graph Centrality / Critical Veto.
- **3.3 Testing Integrity (T):** Semantic Coverage.
- **3.4 The Impossibility of Manual Governance:** The Decay Theorem ($P(Knowable) \approx e^{-(\lambda - \mu)t}$).

## 2. The Protocol Architecture (New Section 4)
**Source:** `[docs/strategy_and_ip/DOC-REVISIONS/20251119-proposed-Section-2.3.md](docs/strategy_and_ip/DOC-REVISIONS/20251119-proposed-Section-2.3.md)`
**Target:** `[docs/strategy_and_ip/20251118-Copyright-Edition-Contextual-Debt-Paper.md](docs/strategy_and_ip/20251118-Copyright-Edition-Contextual-Debt-Paper.md)`
**Action:** Replace/Enhance the "Automated Governance" section.

**New Content:**
- **4. The Protocol: Agent-as-a-Judge Architecture** (Glass Box Protocol).
- **4.1 The Orchestrator-Worker Topology.**
- **4.2 The Decision Bill of Materials (DBOM):** Crypto-tuple $\langle H(\Delta_i), \vec{v}_{intent}, Score_{CIS}, \sigma_{Judge} \rangle$.
- **4.3 Adversarial Context Defense:** KL Divergence check.

## 3. Structural Cleanup (Deletions)
**Target:** `[docs/strategy_and_ip/20251118-Copyright-Edition-Contextual-Debt-Paper.md](docs/strategy_and_ip/20251118-Copyright-Edition-Contextual-Debt-Paper.md)`
**Action:** DELETE the following sections to shift tone from "History" to "Protocol":
- "The Debt Metaphor Revisited" (Cunningham/Fowler history).
- "The Quadrant of Culpability".
- "The Modern Dilution".
- Keep "The Executive Summary" but potentially rename/tighten it (optional, but primary focus is removing the history bloat).
