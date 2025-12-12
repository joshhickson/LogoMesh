# Temporary Claims Matrix
**Status:** WORKING_DRAFT
**Linked to:** [Gap Analysis: Recent Documentation](20251203-Gap-Analysis-Recent-Docs.md)

| Category | Claim Description | Primary Source File | Secondary/Linked Sources | Timestamp | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Strategic Goals | The strategy has pivoted to a "Protocol" approach (rigorous, mathematical) from a "Manifesto" approach. | docs/00-Strategy/IP/20251119-Gap-Analysis-Critique-vs-IP-Assets.md | docs/strategy_and_ip/20251118-Strategic-Pivot-Plan-CIS-Formalization.md | 2025-11-19 | "The 'Solution' exists... but is currently trapped in the Logs" |
| Strategic Goals | The solution must be moved from Logs (`logs/ip_and_business/`) to Assets (`docs/strategy_and_ip/`). | docs/00-Strategy/IP/20251119-Gap-Analysis-Critique-vs-IP-Assets.md | | 2025-11-19 | |
| Technical Specs | Rationale Integrity ($I_r$) must be formalized as Vector Cosine Similarity (not link presence). | docs/00-Strategy/IP/20251119-Gap-Analysis-Critique-vs-IP-Assets.md | docs/strategy_and_ip/20251118-Strategic-Pivot-Plan-CIS-Formalization.md | 2025-11-19 | |
| Technical Specs | Architectural Integrity ($I_a$) must be formalized as Graph Centrality/Veto (not static analysis). | docs/00-Strategy/IP/20251119-Gap-Analysis-Critique-vs-IP-Assets.md | | 2025-11-19 | |
| Technical Specs | Testing Integrity ($I_t$) must be formalized as Semantic Alignment (not coverage). | docs/00-Strategy/IP/20251119-Gap-Analysis-Critique-vs-IP-Assets.md | | 2025-11-19 | |
| Strategic Goals | The "History of Debt" and "Human Cost" sections should be cut from the Research Paper. | docs/00-Strategy/IP/20251119-Transformation-Map.md | | 2025-11-19 | |
| Technical Specs | The CIS Composite Score is defined as $CIS(c) = w_r I_r + w_a I_a + w_t I_t$. | docs/00-Strategy/IP/20251119-Transformation-Map.md | docs/strategy_and_ip/20251118-Strategic-Pivot-Plan-CIS-Formalization.md | 2025-11-19 | |
| Strategic Goals | The "Agent-as-a-Judge" architecture must be explicitly linked to the Metric (e.g., Rationale Worker calculates $I_r$). | docs/00-Strategy/IP/20251119-Transformation-Map.md | | 2025-11-19 | |
| Technical Specs | Testing Integrity ($I_t$) formula includes a Semantic Alignment Score ($S_{align}$) and a penalty factor ($P_{fail}$). | docs/00-Strategy/IP/20251119-proposed-Section-2.3.md | | 2025-11-19 | Formula: $I_t = \frac{\sum (P(t) \cdot S_{align}(t, c))}{|T|} \cdot (1 - P_{fail})$ |
| Strategic Goals | The era is defined as "Unknowable Code," where AI generation velocity exceeds human review velocity. | docs/00-Strategy/IP/20251119-deprecated1-The Unknowable Code_ A Protocol for Contextual Integrity.md | | 2025-11-19 | Contains "The Decay Theorem" |
| Technical Specs | Rationale Integrity ($I_r$) is calculated as $\cos(\theta)$ between vector embeddings of Intent and Implementation. | docs/00-Strategy/IP/20251119-deprecated1-The Unknowable Code_ A Protocol for Contextual Integrity.md | | 2025-11-19 | |
| Technical Specs | Architectural Integrity ($I_a$) uses Betweenness Centrality ($C_B(n)$). | docs/00-Strategy/IP/20251119-deprecated1-The Unknowable Code_ A Protocol for Contextual Integrity.md | | 2025-11-19 | |
| Technical Specs | Implementation requires an "Orchestrator-Worker" pattern with Rationale, Architecture, and Testing workers. | docs/00-Strategy/IP/20251119-deprecated2-The Unknowable Code_ A Protocol for Measurable Contextual Integrity.md | | 2025-11-19 | |
| Strategic Goals | "Option A: Blueprint First" is recommended: Freeze coding, refactor IP assets first. | docs/02-Engineering/Verification/20251119-Recommendation-Report-Strategic-Path-Forward.md | | 2025-11-19 | "Eat our own dog food" |
| Deadlines | Option A (Blueprint First) delays functional software demo by ~1 week. | docs/02-Engineering/Verification/20251119-Recommendation-Report-Strategic-Path-Forward.md | | 2025-11-19 | |
