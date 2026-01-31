---
status: DEPRECATED
type: Research
---
> **Context:**
> * [2025-12-17]: Merged into Research Paper.

## **4\. Contextual Debt as a Core Security & Access-Control Liability**

The foundational thesis of this research establishes **Contextual Debt** as "the future cost incurred from a lack of discernible human intent, architectural rationale, and domain-specific knowledge within a codebase".1 This debt, a "failure of the 'why'," has traditionally been analyzed as a critical drag on maintenance, evolution, and institutional memory.1 However, the mass adoption of AI coding agents has fundamentally altered the nature of this liability. The integration of AI assistants into development workflows, now utilized by over 80% of developers 2, is accelerating code generation to "machine speed".3 This paradigm, sometimes called "vibe coding" 4, produces code that is often functionally correct but semantically hollow.

This section argues that Contextual Debt is no longer a passive or future liability. It has transformed into an active, escalating, and largely invisible *security liability*. It represents a systemic blind spot for security leaders, with 92% of Chief Information Security Officers (CISOs) already expressing significant concern about the unchecked use of AI-generated code within their organizations.7 This analysis will demonstrate that this concern is not only justified but that Contextual Debt provides the essential framework for understanding *why* this new code is so profoundly dangerous.

### **4.1 The Unsecurable Enterprise: When the "Why" Becomes the Vulnerability**

The foundational principle of all cybersecurity is the enforcement of *intent*. A security policy is a codified expression of an organization's *intended* behavior for a system. Its entire purpose is to permit *intended* actions while preventing all *unintended* actions. It is from this first principle that the new AI-driven security crisis emerges.

As defined in the preceding research, Contextual Debt is the *evaporation of intent*.1 Code afflicted by this debt becomes "semantically opaque, architecturally adrift, and lacks a clear, human-centric design philosophy".1 An organization that does not understand *why* its own systems behave as they do has lost the ability to define, let alone enforce, intended behavior. You cannot secure what you do not understand.

AI coding agents are high-speed factories for this specific form of debt. Large Language Models (LLMs) are not-cognizant beings; they are probabilistic models optimized for "linguistic and functional coherence, not for minimizing risk".8 This structural limitation has critical security implications. Without explicit guidance and a deep, human-like understanding of context, an LLM may "inadvertently strip away critical safeguards or introduce subtle flaws in pursuit of perceived improvement".8 This act of "improving" code by removing seemingly redundant checks—checks that a human engineer placed for a specific, unstated security reason—is the "why" evaporating *during the moment of creation*. This process gives rise to "AI-native" vulnerabilities: architecturally invisible flaws that violate critical security assumptions.9

#### **The Paradigm Shift: From Technical Debt to Contextual Liability**

It is imperative to distinguish this new risk class from traditional vulnerabilities. The industry has spent two decades focused on **Technical Debt**, which is a failure of the "how"—a suboptimal implementation.1 This debt class leads to well-understood, pattern-based vulnerabilities: SQL injections, buffer overflows, or the use of stale libraries with known CVEs.10 These are, fundamentally, flaws in *implementation*.

**Contextual Liability**, by contrast, is a failure of the "why".1 It does not manifest as a common vulnerability pattern but as "subtle business logic flaws" and "complex access control issues".7 These are flaws in *intent*.

This distinction is the crux of the modern security challenge. The entire "Shift Left" 3 security apparatus, dominated by Static Application Security Testing (SAST) and Dynamic Application Security Testing (DAST) 10, was engineered to find implementation flaws. These tools are pattern-matchers, and they are structurally blind to flaws in *intent*.

In fact, the long-documented "noise problem" of traditional SAST 3 was the first systemic warning of Contextual Debt. These tools have historically buried developers in "tons of false positives" 3 precisely because they "don't understand context".3 A SAST tool flags a potential SQL injection (the "how"), and the human developer dismisses it, *knowing* the architectural rationale (the "why")—for instance, that the Java Spring framework "automatically uses parameterized queries to sanitize the input".3 The tool's "noise" was always the sound of its ignorance of the "why."

AI-generated code represents the final, catastrophic stage of this trend. An AI agent, lacking the human's "why" entirely, can generate a subtle logic flaw that *looks* like a safe, framework-mitigated pattern. This creates the perfect camouflage: a flaw in *intent* (Contextual Liability) that is perfectly disguised as a *valid implementation* (the "how"). This vulnerability is structurally invisible to the SAST scanner, which sees no pattern violation.

This technological failure is amplified by a critical human vulnerability: **automation bias**.15 Developers, overwhelmed by "alert fatigue" 3, are now exhibiting an "unfounded sense of trust" in AI-generated code.16 Because they are "less familiar with the logic behind" this machine-generated code 16, they are psychologically predisposed to approve it with minimal review. This creates the perfect storm: AI agents generate code with subtle, context-free logic flaws 8, and human reviewers, exhibiting automation bias, rubber-stamp it into production. The Contextual Debt is thus immediately and invisibly integrated as a core, and likely exploitable, liability.

| Attribute | Traditional Technical Debt (The "How") | Contextual Liability (The "Why") |
| :---- | :---- | :---- |
| **Core Failure** | Suboptimal implementation. Syntactic or algorithmic inefficiency.1 | Loss of human intent, domain knowledge, and architectural rationale.1 |
| **Primary Symptom** | Brittle, hard-to-maintain code. Difficult to change.1 | Opaque, unpredictable, and unsecurable code. Dangerous to touch.1 |
| **Typical Vulnerability** | Known patterns: SQL Injection, CVEs in stale libraries, hardcoded secrets.10 | Subtle logic flaws: Broken Object Level Authorization (BOLA), IAM privilege escalation, flawed business rule implementation.7 |
| **Primary Source** | Human error, deadline pressure, suboptimal implementation choices. | AI-generated code, fragmented developer memory, "vibe coding".1 |
| **Detection Method** | Static/Dynamic Analysis (SAST/DAST).3 | Contextual Analysis, Intent-Based Audit.17 |

### **4.2 The FGA Tipping Point: A Case Study in Context-Dependent Security**

Nowhere is the danger of Contextual Liability more acute than in the industry's most advanced security systems: Identity and Access Management (IAM), specifically modern Fine-Grained Authorization (FGA).

#### **The Power and Peril of Modern Authorization**

FGA represents the pinnacle of modern, context-aware security. Moving beyond the rigid, one-size-fits-all model of Role-Based Access Control (RBAC), FGA and its common implementation, Relationship-Based Access Control (ReBAC) 18, enable dynamic and granular permissions. These systems, pioneered by Google's Zanzibar 21 and now common in open-source implementations like OpenFGA 20, power the authorization for the world's most complex applications, from Google Docs ("User A can edit Document B") 21 to modern, multi-tenant SaaS applications.19

An FGA system is powerful because it makes decisions based on the *relationship* between a subject (a user) and an object (a resource), and can do so at massive scale with minimal latency.23 A user's access is defined by their relationship to the resource, not just a static role.19

#### **The Achilles' Heel: FGA's "Tight Coupling" to Business Logic**

This power is also FGA's greatest weakness in the age of AI. An FGA system is *not* merely a security layer applied atop an application; it is a *codified model of the business itself*.

Authoritative best practices for FGA modeling explicitly warn developers to "create models that mimic as closely as possible the business logic of the application instead of generic models".24 Unlike authentication, which can be decoupled, authorization is "tightly coupled with business logic".25 This is because to make a correct decision, the system *must* "understand the types of data being processed, who owns the data, and the sensitivity of different actions within the system".25 It must be able to answer nuanced, real-world questions like, "Can this support agent impersonate this user, but only during business hours and only for non-sensitive resources?".26

In short, a well-designed FGA authorization model is the *direct translation* of "human intent" and "domain-specific knowledge" 1 into executable code.

This architecture creates a profound realization. FGA systems, when implemented correctly, are the *antidote* to Contextual Debt. A well-designed FGA model 24 serves as a living, executable, and centralized database of the "why"—the exact business relationships and architectural rationale 1 that define "who can do what." It is the one place where the organization's institutional memory and core business rules are preserved.

The advent of AI coding agents tragically *inverts* this. Instead of being the *solution* for Contextual Debt, the FGA model is now its *primary victim*.

#### **AI Agents: The Unqualified Modeler**

We are now asking AI agents—systems defined by their fundamental lack of "domain-specific knowledge" 1 and their inability to comprehend "architectural nuances" 8—to write and modify these hyper-sensitive, context-dependent models.

When an AI agent is prompted to create or update an FGA policy, it will not—and *cannot*—reason about the company's business model. It will optimize for *functional coherence*.8 It will guess. That guess will manifest as an "omission of necessary security controls" 13 or a "subtle logic error".13 This is not a hypothetical risk; it is a well-documented failure mode of AI code generation, especially in creating authentication bypasses and flawed access controls.9

When an AI "hallucinates" a business rule and codifies it as a security policy, it is committing the most dangerous possible injection of Contextual Debt. The very system built to be the fortress of intent is being poisoned with "semantically opaque" 1 rules that look correct but are logically, and catastrophically, flawed.

### **4.3 Scenario: The AI-Generated Breach and the Logic of Failure**

To make this threat tangible, consider this plausible, near-future scenario.

#### **The Task: A Plausible Developer Request**

A mid-level developer at a multi-tenant B2B SaaS company is assigned a ticket to enable a new partner program. Following the "vibe coding" 5 workflow, they provide a natural language prompt to their AI coding agent:

"We're launching a partner program. Add a sharing feature so that when a 'Partner' is assigned to a project, they can view all documents in that project."

#### **The Contextual Gap: The Unspoken "Why"**

The AI agent 29 receives the prompt and begins generating code. It is completely, structurally blind to the critical, unstated *domain-specific knowledge* 1 that forms the core of the company's business logic 7:

* In this company's domain model, there are *two* distinct types of partners, represented by different user groups:  
  1. group:partner\_internal (Trusted, audited contractors who are onboarded as full team members and are permitted broad access).  
  2. group:partner\_external (Untrusted, third-party vendors who may only view documents they explicitly upload, for compliance reasons).30

The developer's prompt, "Partner," was ambiguous. The AI, possessing no concept of the business's risk model 13, optimizes for the *path of least resistance*.8 It finds the most generic parent object, group:partner, which, for legacy reasons, includes *both internal and external* types as members.

#### **The Flawed Code: The Context-Free Policy**

The AI agent generates a *syntactically perfect* but *semantically catastrophic* change to the FGA authorization model.19

**Previous (Secure) Model:**

Code snippet

model  
  schema 1.1

type user

type group  
  relations  
    define member: \[user\]

type document  
  relations  
    define owner: \[user\]  
    define editor: \[user\] or editor from owner  
    define viewer: \[user\] or editor

**AI-Generated (Insecure) Model Change:**

Code snippet

type document  
  relations  
    define owner: \[user\]  
    define editor: \[user\] or editor from owner  
    define viewer: \[user\] or editor or project\_partner\_viewer  
    define project\_partner\_viewer: \[group:partner\#member\] // \<-- THE FLAW

The AI has *functionally* completed the task. It has successfully linked members of the group:partner object to the viewer relation on all document objects. This is a classic "subtle logic error" 13 and a critical "omission of necessary security controls".13 It is a form of Broken Object Level Authorization (BOLA) 17, but one that is not hidden in a vulnerable API endpoint 29 but is instead codified *directly into the central authorization policy of the entire platform*.

#### **The Breach and the Post-Mortem**

Weeks later, a user from an external, third-party vendor (group:partner\_external) logs into the platform. They idly query the projects API. For every document in the project, the system's enforcement point makes a high-speed FGA check 23: can(user:external\_partner\_xyz, 'viewer', document:internal\_strategy\_doc\_abc)?

The FGA system, *correctly evaluating the flawed policy*, returns Allowed. The external partner gains "viewer" access to every sensitive internal strategy document, financial projection, and engineering blueprint in the project. A massive, catastrophic data breach occurs.

In the ensuing post-mortem, the failure of the entire modern security stack becomes clear:

* **SAST (Static Analysis):** Failed. The FGA model syntax was 100% correct.3 There were no "vulnerable patterns" to detect.  
* **DAST (Dynamic Analysis):** Failed. The system *functioned as designed*.31 The logic error *was* the new design. The breach was an *authorized* action according to the flawed policy.  
* **Human Review:** Failed. The developer, suffering from "automation bias" 15 and an "unfounded sense of trust" 16 in the AI's output, glanced at the code. It *looked* correct and "did what I asked." Being "less familiar with the logic" 16 they were reviewing, they approved the pull request.

The breach was not caused by a "bug" in the traditional sense. The breach *was* the Contextual Debt. The system failed because the *intent* ("internal partners only") was lost, and the AI agent, a machine with no "why" 1, codified this *lack of intent* directly into the organization's core security policy.

### **4.4 The Cyber-Sentinel: From Static Analysis to Contextual Assurance**

The inescapable conclusion from this scenario is that our current security paradigm is broken. We cannot "solve an AI velocity problem with more human review or more static scans".3 The entire security toolchain, built for the pre-AI era, is now obsolete.5 These tools are *pattern-matchers* in a world where the most dangerous vulnerabilities are *logic-based*.

The industry's first reaction—"AI-augmented SAST" 32—is a dangerous and insufficient half-measure. Using an AI to find *known* patterns 10 or reduce "noise" 17 completely misses the *new* risk: the novel, subtle logic flaws that AI itself creates.12 This is a "retrofit approach" 17 that fails to address the root cause.

#### **The New Paradigm: The "Cyber-Sentinel Agent"**

We must fight a new class of AI-generated flaws with a new *class* of AI-driven defense. This report proposes the "Cyber-Sentinel Agent"—a specialized *evaluator agent* 34 designed not to find *bugs* but to audit for *intent*.

This new category embodies the principles of "AI-Native SAST".17 Unlike legacy tools, it is built from the ground up not to match patterns, but to "reason across users, data, and permissions" 17 and to be "crucial for catching vulnerabilities like IDOR and Broken Object-Level Authorization (BOLA)".17

#### **How the Cyber-Sentinel Functions: Auditing the "Why"**

The Cyber-Sentinel operates as a new, mandatory assurance gate in the CI/CD pipeline. Its function is to restore the "why" and act as the organization's automated institutional memory.

1. **Constitutional Ingestion:** The Sentinel is first "trained" on the organization's *intent*. This is not a code model; it is a *business logic* model. It ingests "gold-standard answers, business policies, or expert rubrics".35 This could be a natural language "constitution" (e.g., "A core security invariant: 'External' users must never access 'Internal' classified data.") or by ingesting and modeling the FGA policies themselves.  
2. **Contextual Audit:** The Sentinel analyzes new, AI-generated pull requests. It moves beyond checking CodeVulnerabilities (the "how") to perform IntentResolution and TaskAdherence checks (the "why").34  
3. **Intent-Based Reasoning:** In our scenario, the Sentinel would cross-reference the AI's code change (the new project\_partner\_viewer: \[group:partner\#member\] relation) against its internal "constitution." It would analyze the relationships in the FGA model and identify that group:partner contains members from the group:partner\_external domain.  
4. **The Sentinel's Verdict (The Fix):** The Sentinel would fail the build and leave a natural language comment, acting as an automated code-review AI agent 11:Contextual Violation Detected:  
   "This change grants viewer permissions to group:partner\#member. My analysis shows that group:partner includes members from the 'External' domain. This violates Security Invariant \#4 ('External users must not access internal project data').  
   **Recommendation:** Did you mean to grant access *only* to group:partner\_internal? Please confirm and refactor."

This Cyber-Sentinel represents a necessary and inevitable bifurcation of the AI security tooling market. The future will not have one "AI security" category. It will have two:

1. **AI-Augmented SAST (Commodity):** These tools 33 will use LLMs to find *implementation* flaws (the "how") better and with less noise. This is a valuable but sustaining innovation.  
2. **Contextual Assurance Agents (Strategic):** These are the true "AI-Native" security solutions.17 They are not scanners; they are *automated governance platforms*. They are the commercial application of IntentResolution evaluators.34 They are the only scalable solution to Contextual Debt, acting as the living, automated institutional memory (the "why") 1 that organizations are currently losing at machine speed.

### **4.5 A Call to Action for the Post-AI Security Landscape**

The "digital trust dilemma" 36 is that we are building the future of our digital infrastructure on code we no longer understand. The "unfounded sense of trust" 16 that developers place in AI is a critical human vulnerability that CISOs and enterprise leaders must now actively manage.

The "Shift Left" 3 paradigm, in its current form, is obsolete. It was built on the implicit assumption that a human, imbued with full context and intent, was writing the code. That assumption is now false. To navigate this new landscape, leaders must pivot from "shifting left" to "thinking contextually."

#### **For CISOs and Enterprise Leaders:**

1. **Mandate Visibility:** You cannot secure what you cannot see.37 Immediately implement governance policies to *tag* all AI-generated code.37 This is the non-negotiable first step to quantifying your organization's exposure to Contextual Debt.  
2. **Evolve Developer Education:** Investment in developer training is now a critical security control.16 This training must go beyond secure coding patterns and focus on the *unique risks* of AI code. Developers must be taught to "critically evaluate" the *logic paths* of AI-generated snippets 16, not just their syntax, and to treat AI code as fundamentally untrusted.  
3. **Demand Contextual Tooling:** Your current SAST/DAST stack is a firewall for a house whose blueprints are being rewritten by an autonomous, context-blind agent. Demand that your security vendors provide "AI-Native" tools 17 that can "reason across users, data, and permissions".17 Your next question to every vendor must be: "How do you audit for *intent*?"

#### **For Security Vendors:**

The race is on. Retrofitting LLMs onto legacy scanners 17 is a  
losing, short-term strategy. The market opportunity of the next decade is not to find more known vulnerabilities faster; it is to build the first generation of tools that can find the unknown and unknowable vulnerabilities in business logic. The future of security is "proactive, context-aware risk mitigation".38 It is "Contextual Security Analysis".17 It is the Cyber-Sentinel.  
The original research defined Contextual Debt as the "silent tax" from the loss of the "why".1 This analysis concludes that this tax is no longer silent. With the advent of AI coding agents, it has become an *active, exploitable liability* that is accumulating at a velocity that human-led security practices cannot possibly match.

The next generation of catastrophic, enterprise-ending breaches will not be found in CVE reports. They will be found in the subtle, context-free, and perfectly-syntactic logic of an AI-generated FGA policy. The central challenge for the next decade of cybersecurity is not to secure our code, but to secure our *intent*.

#### **Works cited**

1. Research\_Paper-Contextual\_Debt-A\_Software\_Liability.md  
2. Security Degradation in Iterative AI Code Generation \-- A Systematic Analysis of the Paradox \- arXiv, accessed November 15, 2025, [https://arxiv.org/pdf/2506.11022](https://arxiv.org/pdf/2506.11022)  
3. Your AI coding assistant is creating security debt at machine speed, accessed November 15, 2025, [https://www.devprojournal.com/technology-trends/security/your-ai-coding-assistant-is-creating-security-debt-at-machine-speed/](https://www.devprojournal.com/technology-trends/security/your-ai-coding-assistant-is-creating-security-debt-at-machine-speed/)  
4. When the Vibes Are Off: The Security Risks of AI-Generated Code ..., accessed November 15, 2025, [https://www.lawfaremedia.org/article/when-the-vibe-are-off--the-security-risks-of-ai-generated-code](https://www.lawfaremedia.org/article/when-the-vibe-are-off--the-security-risks-of-ai-generated-code)  
5. AI and Secure Code Generation | Lawfare, accessed November 15, 2025, [https://www.lawfaremedia.org/article/ai-and-secure-code-generation](https://www.lawfaremedia.org/article/ai-and-secure-code-generation)  
6. 15 Best Vibe Coding Tools and Editors To Use in 2026, accessed November 15, 2025, [https://securityboulevard.com/2025/11/15-best-vibe-coding-tools-and-editors-to-use-in-2026/](https://securityboulevard.com/2025/11/15-best-vibe-coding-tools-and-editors-to-use-in-2026/)  
7. AI-generated code risks: What CISOs need to know | IT Pro, accessed November 15, 2025, [https://www.itpro.com/technology/artificial-intelligence/ai-generated-code-risks-what-cisos-need-to-know](https://www.itpro.com/technology/artificial-intelligence/ai-generated-code-risks-what-cisos-need-to-know)  
8. Iterative AI Code Generation \- Exploring the Study \- Symbiotic Security, accessed November 15, 2025, [https://www.symbioticsec.ai/blog/exploring-security-degradation-iterative-ai-code-generation](https://www.symbioticsec.ai/blog/exploring-security-degradation-iterative-ai-code-generation)  
9. The Most Common Security Vulnerabilities in AI-Generated Code | Blog \- Endor Labs, accessed November 15, 2025, [https://www.endorlabs.com/learn/the-most-common-security-vulnerabilities-in-ai-generated-code](https://www.endorlabs.com/learn/the-most-common-security-vulnerabilities-in-ai-generated-code)  
10. AI code security: Risks, best practices, and tools | Kiuwan, accessed November 15, 2025, [https://www.kiuwan.com/blog/ai-code-security/](https://www.kiuwan.com/blog/ai-code-security/)  
11. Announcing a New Framework for Securing AI-Generated Code ..., accessed November 15, 2025, [https://blogs.cisco.com/ai/announcing-new-framework-securing-ai-generated-code](https://blogs.cisco.com/ai/announcing-new-framework-securing-ai-generated-code)  
12. Velocity vs. Vulnerability: Why AI-Generated Code Demands Human ..., accessed November 15, 2025, [https://www.cobalt.io/blog/velocity-vs-vulnerability-why-ai-generated-code-demands-human-led-security](https://www.cobalt.io/blog/velocity-vs-vulnerability-why-ai-generated-code-demands-human-led-security)  
13. Understanding Security Risks in AI-Generated Code | CSA, accessed November 15, 2025, [https://cloudsecurityalliance.org/blog/2025/07/09/understanding-security-risks-in-ai-generated-code](https://cloudsecurityalliance.org/blog/2025/07/09/understanding-security-risks-in-ai-generated-code)  
14. What Is Static Application Security Testing (SAST)? \- Palo Alto Networks, accessed November 15, 2025, [https://www.paloaltonetworks.com/cyberpedia/what-is-sast-static-application-security-testing](https://www.paloaltonetworks.com/cyberpedia/what-is-sast-static-application-security-testing)  
15. AI's Hidden Security Debt \- Palo Alto Networks Blog, accessed November 15, 2025, [https://www.paloaltonetworks.com/blog/cloud-security/ai-security-debt/](https://www.paloaltonetworks.com/blog/cloud-security/ai-security-debt/)  
16. 2025 CISO Guide to Securing AI-Generated Code \- Checkmarx, accessed November 15, 2025, [https://checkmarx.com/blog/ai-is-writing-your-code-whos-keeping-it-secure/](https://checkmarx.com/blog/ai-is-writing-your-code-whos-keeping-it-secure/)  
17. The Rise of AI‑Native SAST \- Dryrun Security, accessed November 15, 2025, [https://www.dryrun.security/blog/the-rise-of-ai-native-sast](https://www.dryrun.security/blog/the-rise-of-ai-native-sast)  
18. How to Implement Relationship-Based Access Control (ReBAC) in a Ruby On Rails API?, accessed November 15, 2025, [https://auth0.com/blog/what-is-rebac-and-how-to-implement-rails-api/](https://auth0.com/blog/what-is-rebac-and-how-to-implement-rails-api/)  
19. What Is Relationship-based access control (ReBAC) \- Auth0, accessed November 15, 2025, [https://auth0.com/blog/relationship-based-access-control-rebac/](https://auth0.com/blog/relationship-based-access-control-rebac/)  
20. An Overview of Commonly Used Access Control Paradigms \- Auth0, accessed November 15, 2025, [https://auth0.com/blog/an-overview-of-commonly-used-access-control-paradigms/](https://auth0.com/blog/an-overview-of-commonly-used-access-control-paradigms/)  
21. An Introduction to Google Zanzibar and Relationship-Based Authorization Control \- AuthZed, accessed November 15, 2025, [https://authzed.com/learn/google-zanzibar](https://authzed.com/learn/google-zanzibar)  
22. Google's Zanzibar and Beyond: A Deep Dive into Relation-based Authorization, accessed November 15, 2025, [https://blog.swcode.io/authz/2023/10/13/authz-keto-introduction/](https://blog.swcode.io/authz/2023/10/13/authz-keto-introduction/)  
23. Fine-Grained Authorization (FGA) at scale for developers \- Auth0, accessed November 15, 2025, [https://auth0.com/fine-grained-authorization](https://auth0.com/fine-grained-authorization)  
24. Modeling Best Practices | Auth0 Fine-Grained Authorization (FGA ..., accessed November 15, 2025, [https://docs.fga.dev/best-practices/modeling](https://docs.fga.dev/best-practices/modeling)  
25. What is Fine Grained Authorization (FGA)? \- Permit.io, accessed November 15, 2025, [https://www.permit.io/blog/what-is-fine-grained-authorization-fga](https://www.permit.io/blog/what-is-fine-grained-authorization-fga)  
26. Fine Grained Authorization: Why It Matters and How to Get It Right \- Oso, accessed November 15, 2025, [https://www.osohq.com/learn/what-is-fine-grained-authorization](https://www.osohq.com/learn/what-is-fine-grained-authorization)  
27. Taught by the Flawed: How Dataset Insecurity Breeds Vulnerable AI Code \- arXiv, accessed November 15, 2025, [https://arxiv.org/html/2511.09879v1](https://arxiv.org/html/2511.09879v1)  
28. Securing Code in the Era of Agentic AI | Veracode, accessed November 15, 2025, [https://www.veracode.com/blog/securing-code-and-agentic-ai-risk/](https://www.veracode.com/blog/securing-code-and-agentic-ai-risk/)  
29. Security Vulnerabilities in Autonomous AI Agents | by Facundo ..., accessed November 15, 2025, [https://fdzdev.medium.com/security-vulnerabilities-in-autonomous-ai-agents-26f905b2dc36](https://fdzdev.medium.com/security-vulnerabilities-in-autonomous-ai-agents-26f905b2dc36)  
30. What is Fine-Grained Access Control? (And Why It's So Important) \- Immuta, accessed November 15, 2025, [https://www.immuta.com/blog/what-is-fine-grained-access-control-and-why-its-so-important/](https://www.immuta.com/blog/what-is-fine-grained-access-control-and-why-its-so-important/)  
31. AI-Generated Code Security: Security Risks and Opportunities \- Apiiro, accessed November 15, 2025, [https://apiiro.com/blog/ai-generated-code-security/](https://apiiro.com/blog/ai-generated-code-security/)  
32. AI SAST vs AI DAST: Friends or Foes? Building a Comprehensive Testing Strategy, accessed November 15, 2025, [https://dev.to/clouddefenseai/ai-sast-vs-ai-dast-friends-or-foes-building-a-comprehensive-testing-strategy-3bpp](https://dev.to/clouddefenseai/ai-sast-vs-ai-dast-friends-or-foes-building-a-comprehensive-testing-strategy-3bpp)  
33. How AI enhances static application security testing (SAST) \- The GitHub Blog, accessed November 15, 2025, [https://github.blog/ai-and-ml/llms/how-ai-enhances-static-application-security-testing-sast/](https://github.blog/ai-and-ml/llms/how-ai-enhances-static-application-security-testing-sast/)  
34. Agent Evaluators for Generative AI \- Azure AI Foundry | Microsoft ..., accessed November 15, 2025, [https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/evaluation-evaluators/agent-evaluators](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/evaluation-evaluators/agent-evaluators)  
35. AI Agent Evaluation: Reliable, Compliant & Scalable AI Agents, accessed November 15, 2025, [https://www.kore.ai/blog/ai-agents-evaluation](https://www.kore.ai/blog/ai-agents-evaluation)  
36. AI Agents & IAM: A Digital Trust Dilemma | Ping Identity, accessed November 15, 2025, [https://www.pingidentity.com/en/resources/blog/post/digital-trust-dilemma.html](https://www.pingidentity.com/en/resources/blog/post/digital-trust-dilemma.html)  
37. 3-Step AI Code Security Plan CISOs can adopt in less than 3 hours, accessed November 15, 2025, [https://brightsec.com/blog/3-step-ai-code-security-plan-cisos-can-adopt-in-less-than-3-hours/](https://brightsec.com/blog/3-step-ai-code-security-plan-cisos-can-adopt-in-less-than-3-hours/)  
38. What Are the Predictions of AI In Cybersecurity? \- Palo Alto Networks, accessed November 15, 2025, [https://www.paloaltonetworks.com/cyberpedia/predictions-of-artificial-intelligence-ai-in-cybersecurity](https://www.paloaltonetworks.com/cyberpedia/predictions-of-artificial-intelligence-ai-in-cybersecurity)