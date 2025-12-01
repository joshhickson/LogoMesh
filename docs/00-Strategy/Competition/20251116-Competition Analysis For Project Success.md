# **AgentX-AgentBeats: A Strategic Due Diligence Report for Foundational Innovation**

This report provides a strategic, expert-level analysis of the AgentX-AgentBeats Competition and its organizers, the Berkeley Center for Responsible, Decentralized Intelligence (RDI). It is prepared for an intelligent participant with a "zero-to-one" project idea. The analysis moves beyond a simple summary of the rules to deconstruct the underlying philosophies, technical preferences, and strategic objectives of the organizers. The goal is to provide a comprehensive competitive intelligence briefing, enabling a novel project to be positioned for maximum impact and success.

The central thesis of this analysis is that the AgentX-AgentBeats Competition is not merely a contest to build a high-performing AI agent. It is a sophisticated, large-scale mechanism for the Berkeley RDI to *crowdsource the very definition of "good" AI*. The competition is designed to identify, cultivate, and fund new, "responsible" benchmarks in the organizers' specific domains of interest—namely, AI safety, formal verification, and decentralized finance. For a participant with a foundational project, the primary opportunity is not to *win* a pre-defined game, but to *define the rules* of the next game.

## **Strategic Analysis of the AgentX-AgentBeats Competition Framework**

The formal structure of the competition dictates a clear strategic path. Understanding the design of its two-phase system, the specific judging criteria, and the technical architecture is the first step in aligning a novel project for victory.

### **Deconstructing the Two-Phase Structure: Why Your "Zero-to-One" Idea Must Be a "Green Agent"**

The competition is explicitly bifurcated into two distinct, sequential phases.1 A strategic misunderstanding of this structure is the most likely cause of failure for a novel project.

1. **🟢 Phase 1 · Green (Oct 16 \- Dec 20, 2025):** This phase is for building "green agents." The explicit function of these agents is to *define assessments and automate scoring*.1 This is the *benchmark creation* phase.  
2. **🟣 Phase 2 · Purple (Jan 12 \- Feb 23, 2026):** This phase is for building "purple agents." These are the competitor agents that *tackle the select top green agents from Phase 1* and compete on public leaderboards.1

This two-phase structure is the most critical piece of strategic intelligence. The competition is not just about building a superior "purple agent." In fact, the foundational and most important phase is the first one: creating the benchmark, or "green agent," itself.

This design reveals the RDI's primary objective. The organizers are not seeking to simply identify the "best" agent. They are strategically *crowdsourcing the definition of "best."* The stated goal is to advance agentic AI by "creating high-quality, broad-coverage, realistic agent evaluations" that will be shared as "public goods".1 The RDI's vision is to create a "unified space" that solves the core problems of *fragmentation* (scattered leaderboards) and *reproducibility* (stateful, non-consistent results) that plague current AI evaluation.2 Phase 1 is their solution to this problem.

For a participant with a "zero-to-one" project idea, this structure presents an asymmetric opportunity. The entire focus must be on Phase 1\. A successful "green agent" *becomes the battlefield* for all of Phase 2\. Instead of merely winning a battle on someone else's terms, the innovator gets to *define the terms of the war*. A winning green agent is one that is selected as a "top green agent" 1, effectively forcing all participants in Phase 2—including, potentially, teams from major industrial labs—to optimize their agents against the problem *you* defined. Success, therefore, is not just a spot on a leaderboard; it is the establishment of a novel project idea as the new industry standard, promoted and distributed by Berkeley RDI as a "shared public good".1

### **The Strategic Significance of Phase 1: Deconstructing the Judging Criteria**

The path to selection in Phase 1 is not a black box. The competition's info session slides provide a detailed, rigorous rubric for all green agent submissions.1 These criteria function as a *direct statement of the RDI's intellectual and technical biases*. They are heavily weighted against "toy" problems and in favor of robust, real-world systems.

A project's success hinges on excelling against two distinct, but related, sets of criteria:

**Judging Criteria for *New* Benchmarks (The "Zero-to-One" Path):**

* **Goal & Novelty:** The benchmark must be important, cover a new capability space, and be novel.1  
* **Scope & Scale:** It must be large and diverse enough to yield reliable results.1  
* **Evaluator Quality:** Metrics must be clear; the "judge" (the assessor agent) must be high-quality and consistent.1  
* **Validation:** Manual or spot-check validation of the assessor agent's outputs must be performed.1  
* **Reliability:** The evaluation scripts and assessor agent *must* run robustly on the AgentBeats platform.1  
* **Quality Assurance:** Bias and contamination checks should be included.1  
* **Realism:** The benchmark must be realistic, using "real-world workload" and avoiding "toy or unrealistic settings".1  
* **Impact:** The benchmark must be reusable, well-documented, and presented clearly.1

**Judging Criteria for *Integrating Existing* Benchmarks (The "Porting" Path):**

* This path requires all the same criteria as new benchmarks (Evaluator Quality, Validation, Reliability, Impact) but replaces "Novelty" and "Realism" with:  
* **Analysis:** The participant must analyze the quality issues and find flaws in the original benchmark.1  
* **Faithfulness:** The implementation must reproduce the original results, *excluding* the flaws that were fixed.1  
* **Quality Assurance (Correction & Expansion):** The implementation must correct flaws and expand the coverage of the original benchmark.1

The criteria overwhelmingly prioritize "Realism," "Reliability," and "Impact." This signals a clear institutional preference for engineering robustness over theoretical cleverness. The explicit demand for "Validation" and "Quality Assurance" is the direct implementation of the RDI's "Responsible" mission.

A "zero-to-one" idea must be framed as a *novel capability space* ("Novelty") that addresses a *real-world workload* ("Realism") and is *meticulously engineered for robustness* ("Reliability"). The most decisive criteria—the ones that separate winners from a field of technically competent entries—will be "Impact" and "Realism." A project that defines a new, vital, and *realistic* task (e.g., auditing the safety of multi-agent financial systems) will be rated far higher than a project that is a clever but minor iteration on an existing "toy" academic problem.

The following table translates these abstract criteria into actionable, strategic goals, designed to align a project with the RDI's specific, known preferences.

**Table 1: Phase 1 "Green Agent" Judging Criteria: A Strategic Translation**

| Stated Criterion | Official Description | Analyst's Translation (The Real Question) | Action Item for a "Zero-to-One" Project |
| :---- | :---- | :---- | :---- |
| **Goal & Novelty** | "important, novel, and cover new capability space" | Does this benchmark test a capability that RDI leadership (e.g., Song, Parlour, Seshia) is actively researching and finds "important"? Is it *truly* new? | Clearly articulate in the submission how this project creates the *first* benchmark for a *specific, high-value* capability (e.g., "the first benchmark for provably secure multi-agent DeFi interactions"). |
| **Realism** | "realistic, e.g., with real-world workload, instead of toy or unrealistic settings" | Does this benchmark solve a problem that a *real* company (like those in the RDI Xcelerator portfolio or at the Agentic AI Summit) actually has? | Avoid all "toy" problems. Root the project in a "real-world workload," e.g., "auditing agent-generated code for security flaws" or "simulating agent behavior in a real-world financial market." |
| **Reliability** | "evaluation scripts and assessor agents must run robustly on AgentBeats" | Does the code *actually work*? Is it a well-engineered, non-deterministic mess, or is it a robust, reproducible system? | This is a *non-negotiable filter*. The project must be architected *from day one* to comply perfectly with the A2A protocol and agentbeats/tutorial. Failure here invalidates all other criteria. |
| **Impact** | "reusable, well-documented, and presented clearly" | Will RDI be *proud* to release this as a "public good"? Will other researchers (especially at Berkeley) *use* this benchmark for their *own* papers? | This is the *narrative* of the project. The documentation (README.md) is as important as the code. It must be written as a research contribution, complete with a clear abstract, methodology, and (critically) an explanation of its *impact* on the field. |
| **Evaluator Quality** | "metrics must be clear, and the judge/evaluator must be high quality and consistent" | Is the benchmark's "judge" (the green agent) fair, unbiased, and effective? Is the scoring *meaningful*? | For a "zero-to-one" idea, the "judge" *is* the innovation. This judge must be automated, consistent, and defensible. Leveraging formal methods for the judge (see Section III.C) would be a "best-in-class" solution. |
| **Validation** | "manual checks or spot validation must be performed on the evaluation outputs" | Was the "judge" itself validated? How is the *assessor's* accuracy proven? | Include a VALIDATION.md file in the repository. Show manual spot-checks of the green agent's scoring, demonstrating a commitment to "Responsible" and "Robust" evaluation. |

### **Interpreting the Evaluation Tracks: A Strategic Map of Organizer Priorities**

When submitting a green agent (Phase 1), participants must choose an "agent type" for their benchmark.1 This list is not a flat menu of options; it is a ranked list of the RDI's intellectual, research, and commercial priorities.

**Phase 1 Evaluation Tracks:**

* Agent Safety (Sponsored by Lambda)  
* Coding Agent (Sponsored by Nebius)  
* Healthcare Agent (Sponsored by Nebius)  
* Web Agent  
* Computer Use Agent  
* Research Agent  
* Software Testing Agent  
* Game Agent  
* DeFi Agent  
* Cybersecurity Agent  
* Finance Agent  
* Legal Domain Agent  
* Multi-agent Evaluation  
* Other Agent

**Custom Tracks:**

* \[λ\] Lambda \- Agent Security: A red-teaming and automated security testing challenge.1  
* Sierra \- τ²-Bench.1

A deep analysis of this list reveals a significant and unmissable cluster of tracks related to the *specific, documented research* of the RDI leadership (profiled in-depth in Section III):

* **"Agent Safety" & "Cybersecurity Agent":** These tracks align *perfectly* with the research portfolio of RDI Co-Director **Dawn Song**, a world-renowned expert in AI security and privacy.3  
* **"DeFi Agent" & "Finance Agent":** These tracks align *perfectly* with the research portfolio of RDI Co-Director **Christine Parlour**, a leading financial economist focused on DeFi and market microstructure.3  
* **"Software Testing Agent" & "Multi-agent Evaluation":** These tracks align *perfectly* with RDI faculty **Sanjit Seshia** (a expert in formal verification and software testing) 3 and the platform's "Arena Mode" for multi-agent evaluation.1

The tracks sponsored by Lambda ("Agent Safety" and the "Agent Security" custom track) 1 and Nebius ("Coding Agent" and "Healthcare Agent") 1 represent the points of *maximum* institutional and commercial alignment. A "zero-to-one" project in one of these domains will be reviewed by people who have a deep, personal, and professional stake in its success.

This alignment is a powerful strategic signal. The "Agent Safety" track, for example, is not just a track; it is the convergence of:

1. **Academic Leadership:** The core research of RDI Co-Director Dawn Song.  
2. **Commercial Sponsorship:** A key prize sponsor (Lambda) is funding it.  
3. **Custom Focus:** The same sponsor is running a dedicated "custom track" on the same topic.

This *triangulated* consensus (RDI leadership, commercial sponsor, custom track) signals that "Agent Safety" is of paramount importance. A novel "green agent" submitted to one of these specific,-aligned domains (Safety, Security, DeFi, Finance) targets the judges' primary expertise and deep-seated interests, maximizing its perceived "Novelty" and "Impact".1

### **Analysis of the agentbeats/tutorial and A2A Protocol: Technical Hurdles and Strategic Opportunities**

The "Start Coding" link on the competition page directs participants to the github.com/agentbeats/tutorial repository.1 This repository is the *technical ground truth* for the competition.

**Core Technical Requirements:**

* **Protocol, Not Language:** The platform is language-agnostic. Participants can "develop agents using any programming language, framework, or SDK of your choice".1  
* **The A2A Server:** The one, non-negotiable requirement is that the agent *must* "expose... as an A2A server".1  
* **Green Agent as Orchestrator:** The "green agent" (the benchmark) is the *orchestrator* of the evaluation. It receives an assessment\_request signal, which includes the addresses of the participating "purple agents." The green agent then "creates a new A2A task" and uses the A2A protocol to interact with the purple agents, produce logs, and, finally, generate "an A2A artifact with the assessment results".1  
* **The "Debate" Example:** The repository's quickstart guide and primary example is a multi-agent *debate*.1 The scenarios/debate/scenario.toml configuration file defines a debate\_judge.py (the Green Agent) that orchestrates and evaluates a debater.py (the Purple Agent).1

The technical barrier for entry is not proficiency in a specific language; it is proficiency in this *protocol-specific architecture*. The "debate" example is a critical clue. The organizers could have chosen a simple, static input-output test (like a math quiz). Instead, they chose a *stateful, interactive, multi-turn, and multi-agent* scenario.

This choice strongly signals a preference for dynamic evaluations that use the "Arena Mode with Multi-Agent" capability mentioned in the info session slides 1, as opposed to the simpler "Benchmark Mode with Single-Agent".1

For a "zero-to-one" project, this technical architecture *is* the project. The core innovation must be architected *as an A2A server-orchestrator from day one*. The "Reliability" criterion from the judging rubric ("Do your evaluation scripts and assessor agents run robustly on AgentBeats?") 1 functions as an absolute, non-negotiable filter. A strategically brilliant idea that is poorly engineered and fails to run robustly on the platform will be immediately disqualified. The "debate" example 1 should be seen as the minimum viable architecture: a green agent that *orchestrates* a complex, multi-step task and *evaluates* the performance of one or more purple agents participating in that task.

## **The Organizer's Mind: Deconstructing the Berkeley RDI Philosophy**

To succeed, a project must be not only technically sound but also *ideologically aligned* with the organizing institution. The Berkeley Center for Responsible, Decentralized Intelligence (RDI) is not a neutral convener; it is a mission-driven organization with a specific, public-facing philosophy.

### **The "Responsible, Decentralized Intelligence" Doctrine: Translating the Mission**

The RDI's name is a literal statement of its doctrine.

* **Name:** Berkeley Center for **Responsible, Decentralized Intelligence (RDI)**.3  
* **Mission:** "advancing the science, technology, and education of AI and Agentic AI to empower a **responsible digital economy**".3  
* **Philosophy:** "advancing AI and decentralized intelligence that **empowers individuals**, enrich societies, and amplify human potential—setting the stage for a **robust, safe**, and transformative AI-powered future".3

This is not a "move fast and break things" organization. The RDI is its philosophical opposite. Its identity is built on *preventing* negative AI outcomes ("Responsible," "Safe") and *promoting* individual empowerment ("Empowers Individuals") through a specific technical methodology ("Decentralized").

This doctrine is further elaborated in associated research, such as the paper "A Decentralized Approach towards Responsible AI in Social Ecosystems".7 This paper argues that narrow, technology-focused approaches to "Responsible AI" are failing. It proposes, as a core solution, a "decentralized computational infrastructure" or "set of public utilities" that can bridge the gap between technical AI systems and the social systems they impact. The key mechanisms for this are "computational human agency" (empowering users with control over their data) and "regulation" (enforcing rules and norms on AI systems).7

The project's *narrative* is therefore as important as its technology. It must be framed through this specific sociotechnical lens.

* **Good Framing (Aligned):** "A novel benchmark (Green Agent) to *verify* the *robustness* of DeFi agents against exploits, *empowering* users and creating a more *responsible* and *transparent* financial system."  
* **Bad Framing (Misaligned):** "A new agent that can 1000x trading profits by exploiting market inefficiencies."

To win, the project must *embody* these values. The judging criteria ("Impact," "Quality Assurance," "Realism") 1 are the *measurement* of these values. The competition's goal to create "shared public goods" 1 is the *expression* of these values. The project submission must explicitly state *how* it advances "responsible," "safe," or "decentralized" AI, reflecting the RDI's core philosophy.

### **RDI's Three Pillars as an Entrepreneurial Funnel**

The RDI's work is explicitly organized around three pillars: "Research," "Education," and "Community & Entrepreneurship". Analysis of these pillars reveals that they are not separate silos but a deeply integrated *funnel* for talent and innovation.

1. **Research:** "tackle fundamental challenges," "develop open frameworks," and conduct "rigorous science" to shape a future where "advanced AI systems amplify human potential".  
2. **Education:** "Pioneering educational initiatives" like the "Agentic AI MOOC" (with a global community of 32,000+ learners) and the "Zero Knowledge Proofs MOOC".  
3. **Community & Entrepreneurship:** "Building a global innovation hub" that connects research to real-world impact through events (hackathons with 7,000+ participants) and programs like the "Xcelerator" (110 global teams incubated, generating over $650 million in follow-on funding).

These three pillars are a flywheel. The "Education" pillar (MOOCs) builds a massive global "Community." This "Community" is then activated through "Research" initiatives and events—like this very competition. The best ideas and teams from this "Community" are then identified and channeled directly into the "Entrepreneurship" pillar (the Xcelerator).

This competition is a *high-throughput talent-sourcing mechanism* for the RDI's "Community & Entrepreneurship" pillar. This is stated explicitly: the competition is "hosted by Berkeley RDI in conjunction with the Agentic AI MOOC and its global community of 32K+ registered learners".1 This directly connects the "Education" and "Community" pillars to the event.

A participant with a "zero-to-one" project idea is, by definition, a pre-seed entrepreneur. This competition is therefore not just a contest; it is a *pitch for incubation*. The RDI is actively *scouting* for the next 110 teams for their Xcelerator. A winning "Green Agent" is a powerful, validated signal for acceptance into this program, which provides access to resources ($1M+ in prizes) 1 and a direct line into a network that has generated over $650 million in funding. The project should be built, documented, and presented not just as a competition entry, but as the *prototype for a future company*.

## **Key Influencer Profile: The Judging Lens of the RDI Leadership**

No specific organizers or judges for the competition are listed.1 Therefore, the *de facto* intellectual judges are the leadership of the RDI itself. The list of RDI faculty, co-directors, and staff is public.3 A successful project *must* appeal to the deep-seated, published intellectual interests of these key individuals.

### **Co-Director Dawn Song: The "Provably Secure" Agent**

Professor Dawn Song is the dominant intellectual force behind the "Responsible" and "Decentralized" aspects of the RDI.

* **Role:** Co-Director of the Berkeley RDI.3  
* **Research Interests:** Her research interests are a perfect match for the competition's themes: "AI safety and security, Agentic AI, deep learning, decentralization technology, security and privacy".4 She also focuses on "blockchain," "program synthesis," "secure deep learning," and "applied cryptography".9  
* **Core Philosophy (Provable Security):** Her project as a Schmidt Sciences Fellow is to move beyond reactive security. It aims to develop AI tools that "produce formal security specifications and mathematical proofs that the code is correct and secure".10 This "provably secure" approach is her core thesis.  
* **Commercial Application (Oasis Labs):** She is the founder of **Oasis Labs**, a "privacy-first cloud computing and blockchain infrastructure" platform.11 Oasis Labs has already engaged in high-profile, real-world deployments, such as a partnership with Meta (Instagram) to "assess the fairness of their artificial intelligence models" using "advanced privacy computing technologies".12  
* **Recent (2025) Talks & Papers:** Her focus is intense and consistent. She delivered keynotes at the ICLR, the RDI Agentic AI Summit ("Towards Building Safe and Secure Agentic AI") 13, and the Graph the Planet conference. Her Graph the Planet talk explicitly warned of "generative AI... supercharging phishing, social engineering, and zero-day discovery" and called for defenses "from deep program analysis to formal verification".15 She also won a Distinguished Paper Award at the 2025 IEEE Symposium on Security and Privacy for "DataSentinel: A Game-Theoretic Detection of Prompt Injection Attacks".4

Professor Song's philosophy is *proactive and foundational*. She is not interested in *reactive* defenses (patching exploits after the fact). She is interested in *provably* secure systems built "from the ground up".15 Her work on "DataSentinel" 4 shows she is hyper-focused on *current, practical* threats to agentic AI, such as prompt injection.

The "Agent Safety" and "Cybersecurity Agent" tracks 1 are, without question, Dawn Song's personal domain. This is the track sponsored by Lambda, a company that *also* featured on the main stage of her Agentic AI Summit.13 A winning project for this track *must* go beyond simple red-teaming. It should incorporate her core concepts:

1. **Provable Security:** A Green Agent benchmark that *formally verifies* the security properties of a Purple Agent, not just one that checks for a list of known exploits.  
2. **Privacy-Preserving Evaluation:** A benchmark that tests an agent's ability to perform a task while *respecting privacy*, perhaps using differential privacy or Zero-Knowledge Proofs (ZKP), reflecting her work at Oasis Labs 12 and RDI's own ZKP MOOC.3  
3. **Modern Threat Modeling:** A benchmark that creates *new, automated tests* for the threats she *explicitly names* in her 2025 talks and papers: "AI-assisted zero-day discovery" and "prompt injection".4

### **Co-Director Christine Parlour: The "Battle of the Bots"**

Professor Christine Parlour, the other Co-Director of RDI, provides the economic and financial grounding for the center's "decentralized" mission.

* **Role:** Co-Director of the Berkeley RDI.3  
* **Research Interests:** Her focus is on "FinTech," "Digital Payments," "Credit Markets," "Finance," "Microstructure," "Banking," and "DeFi".5  
* **Core Research Question:** In a 2025 interview with Haas, she stated her key research question at the intersection of blockchain and AI: "**What is the difference... between a human taking an action and a machine taking an action. When is that better? When is that worse?**".18  
* **Key Publications & Work:** Her work empirically analyzes data from blockchains to answer this question. Her CV lists a 2023 Best Paper Award for a paper titled **"Battle of the Bots"**.5 Her research on "Decentralized Exchange" analyzes all 19 million interactions on Uniswap to understand "automated market making".19 She also authored a paper for the Federal Reserve Bank of Atlanta, "An Introduction to Web3 with Implications for Financial Services".5

Professor Parlour is a financial economist who sees DeFi and blockchains as *real-world laboratories for agent-based economics*. When she sees "bots," she sees AI agents. Her work is not just theoretical; she analyzes *actual transaction data* 18 to see how these automated agents are *already* competing in real-world financial markets. Her "Battle of the Bots" paper 5 and her "human vs. machine" question 18 are the clearest possible signals of her interest.

The "DeFi Agent" and "Finance Agent" tracks 1 are her domain. A winning project here *must* be a *realistic economic simulation* that helps her and other researchers answer her core research question.

1. **Agent-vs-Agent Arena:** The project should be a "Green Agent" that creates a "market microstructure" (her specialty) 5 and *evaluates* Purple Agents on their economic performance (P\&L, risk, market impact) within that simulation.  
2. **"Battle of the Bots" Benchmark:** A "zero-to-one" idea should be a benchmark that recreates her "Battle of the Bots".5 This Green Agent would test how different AI agents (Purple Agents) compete for liquidity, execute trades, or engage in price discrimination on a simulated DEX (like her Uniswap research).19  
3. **Realism is Paramount:** This benchmark *must* be "realistic," using real-world data models, not a "toy" setup.1 This is critical to helping her study when "a machine taking an action" is better or worse than a human one.18

### **The Extended Faculty Bench: The "How-To" for a Winning Project**

The RDI's extended faculty bench provides the *technical underpinning* for the RDI's "Responsible" mission. This faculty's work provides a clear "how-to" guide for building a project that will resonate with the judges.

**Sanjit Seshia: The "Verified AI" Methodology**

* **Role:** RDI Faculty.3  
* **Research:** Professor Seshia's research is in "formal methods for dependable and secure computing," with a focus on "cyber-physical systems," "computer security," "machine learning," and "robotics".6  
* **Key Concept ("Verified AI"):** He is a proponent of **"Verified AI"**, which he defines as the goal of designing AI systems that have "strong, ideally provable, assurances of correctness with respect to formally-specified requirements".6  
* **Key Toolkits:** His lab has implemented this approach in open-source tools, including **"VerifAI"** ("a system for design and verification of AI-based systems") and **"Scenic"** ("a probabilistic programming system for scenario description and data generation for autonomous systems").6

**Trevor Darrell: The "Multimodal" Agent**

* **Role:** RDI Faculty.3  
* **Research:** Professor Darrell's interests include "computer vision, machine learning... and perception-based human computer interfaces" and "multimodal interaction with robots and mobile devices".26  
* **Lab:** He is a Founding Co-Director of the **Berkeley Artificial Intelligence Research (BAIR)** Lab and **Berkeley Deep Drive (BDD)**.28 BAIR's research includes agentic topics like "Whole-Body Conditioned Egocentric Video Prediction".31

This faculty bench reveals the RDI's internal logic: "Responsible AI" is not just a vague ethical guideline; at Berkeley, it means *formally verified* AI. Professor Seshia's work on "Verified AI" 22 provides the *methodology* to achieve Professor Song's *goal* of "provably secure" AI.10 Professor Darrell's work 28 applies this to the "real world" of multimodal, embodied agents (like self-driving cars, a classic "cyber-physical system" 6).

This creates an enormous strategic opportunity:

1. **Leverage Seshia's Tools:** The most significant strategic advantage a participant could have is to *use* Professor Seshia's "Scenic" or "VerifAI" toolkits *within* their "Green Agent" benchmark.  
2. **The "Seshia-Song" Synthesis:** A "Green Agent" for the "Agent Safety" track 1 that uses "Scenic" 23 to *probabilistically generate* thousands of novel, diverse, and complex "red-teaming" scenarios to test Purple Agents. This directly combines the competition's *topic* (Agent Safety) with the *core research tool* of its key faculty (Formal Methods).  
3. **The "Darrell-Parlour" Synthesis:** A "zero-to-one" idea for a "DeFi Agent" could be a *multimodal* agent that must read financial charts or social media sentiment (vision/NLP, ala Darrell) *and* execute trades (economics, ala Parlour).

The following table creates a "cheat sheet" for strategic project alignment, mapping RDI's most powerful figures to their interests and the specific competition tracks they most likely care about.

**Table 2: RDI Key Faculty Research Matrix and Competition Track Alignment**

| RDI Faculty | Key Research Areas & Affiliations | Relevant Competition Tracks | Strategic Opportunity for a "Green Agent" Benchmark |
| :---- | :---- | :---- | :---- |
| **Dawn Song** (Co-Director) | AI Safety & Security; Agentic AI; Decentralization; Provable Security; **Oasis Labs** | Agent Safety; Cybersecurity Agent; DeFi Agent | **The "Provably Secure" Agent:** A benchmark that *formally verifies* the security and privacy-preserving properties of agents, or (more simply) *automates the detection* of modern threats like prompt injection, as described in her "DataSentinel" paper.4 |
| **Christine Parlour** (Co-Director) | DeFi; FinTech; Market Microstructure; "Battle of the Bots"; **Haas School of Business** | DeFi Agent; Finance Agent; Multi-agent Evaluation | **The "Economic Arena":** A multi-agent "Arena Mode" benchmark that *simulates a decentralized financial market* (e.g., a DEX). This allows researchers to test her "human vs. machine" question 18 and study the "Battle of the Bots".5 |
| **Sanjit Seshia** (Faculty) | Formal Methods; Dependable & Secure Computing; "Verified AI"; **"Scenic"** & **"VerifAI"** toolkits | Agent Safety; Software Testing Agent; Cybersecurity Agent | **The "Formal Methods" Benchmark:** A benchmark that *uses Seshia's "Scenic" toolkit* 23 to *probabilistically generate* a massive and diverse set of test scenarios for agent robustness. This demonstrates "insider" knowledge of the RDI's technical stack. |
| **Trevor Darrell** (Faculty) | Computer Vision; Multimodal AI; Natural Language Processing; **BAIR Lab** & **BDD** | Web Agent; Game Agent; Computer Use Agent; Healthcare Agent | **The "Multimodal" Benchmark:** A benchmark for *multimodal* agents that must parse a combination of text, images (charts, graphs), and/or video (egocentric prediction 31) to complete a complex task, moving beyond text-only evaluations. |

## **Mapping the Ecosystem: Participants, Competitors, and Partners**

A project is judged on its "Impact" 1, which is defined by its relevance to the specific ecosystem of academic and commercial partners that RDI has cultivated. This network is the target audience.

### **Analysis of the Agentic AI Summit (August 2025): The "State of the Art" Audience**

In August 2025, RDI hosted a massive Agentic AI Summit, with over 2,000 in-person attendees and approximately 40,000 more online.3 This summit was not a general-purpose conference; it was a curated gathering of the *exact* companies and researchers RDI considers the leaders of the field. The program 13 provides a perfect "mental model" of how RDI sees the entire agentic AI field, broken down into five key sessions:

1. **Session 1: Building Infrastructure for Agents:** The hardware layer.  
   * **Speakers & Companies:** NVIDIA (Keynote by Bill Dally), AMD, **Lambda**, Groq, Foundry.  
2. **Session 2: Frameworks & Stacks for Agentic Systems:** The software layer.  
   * **Speakers & Companies:** Databricks (Keynote by Ion Stoica), **OpenAI** (Sherwin Wu), **Google DeepMind** (Chi Wang), LlamaIndex (Jerry Liu), PyTorch (Matt White), Block (Brad Axen).  
3. **Session 3: Foundations of Agents:** The core research and safety layer.  
   * **Speakers & Companies:** UC Berkeley (Keynote by **Dawn Song**, Sergey Levine), **Google DeepMind** (Ed Chi), **OpenAI** (Jakub Pachocki).  
4. **Session 4: Next Generation Enterprise Agents:** The application layer.  
   * **Speakers & Companies:** Google, Glean, Writer, You.com.  
5. **Session 5: Agents Transforming Industries:** The vertical application layer.  
   * **Speakers & Companies:** **Replit** (Michele Catasta), **Sierra** (Karthik Narasimhan), Khosla Ventures (Fireside Chat).

This summit's attendees are the *audience* for the competition. This competition, with its agentbeats platform, is RDI's attempt to create a *standardized component* for the "Frameworks & Stacks for Agentic Systems" layer, to be used by the very people (from OpenAI, Google DeepMind, LlamaIndex, etc.) who spoke in that session.

The "public leaderboards" 1 of Phase 2 will almost certainly be populated by teams from these exact organizations, who are all already deeply embedded in RDI's ecosystem.13 A "zero-to-one" project's "Green Agent" (Phase 1\) is a chance to *make them compete on your terms*. The goal should be to design a benchmark so novel, challenging, and relevant that the SOTA labs *must* participate on it to prove their credentials. This is the ultimate path to "Impact".1

### **The RDI Xcelerator Portfolio: A Landscape Analysis of 110 "Approved" Ideas**

The RDI Xcelerator (formerly the Berkeley Blockchain Xcelerator) is the "Entrepreneurship" pillar of RDI. It has incubated 110 global teams, which have raised over $650 million in follow-on funding.3 This portfolio 36 is a map of what *RDI* believes are viable, fundable, "responsible, decentralized" businesses.

A deep analysis of the 110 portfolio companies 36 reveals several dominant themes:

1. **Decentralized Finance (DeFi) & Financial Infrastructure:** This is the largest category.  
   * **Examples:** Acala, AltLayer, Ava Protocol, Pendulum, ViteX, Lulubit, Fourth State Labs, Moon (crypto bank), Kryptik (wallet).  
2. **Web3 Infrastructure & Development Tools:** The foundational layer for developers.  
   * **Examples:** Automata Network (privacy), Kylin Network (data), OnFinality (infra), PADO Labs (cryptography), Blockless (infra), Pinata (IPFS), Dyson Network (accelerator), Astar.  
3. **Data, AI, and Analytics:** The intersection of AI and blockchain.  
   * **Examples:** Giza (verifiable ML), Glacier Network (data), Anchain.ai (security), Coophive (decentralized intelligence), AutoAPE.AI (AI robo-advisory), Zip Inc. (AI agents for on-chain actions).  
4. **Real-World Asset (RWA) & Enterprise/Specialized Applications:** Applying blockchain to non-crypto-native industries.  
   * **Examples:** Dtravel (vacation rentals), Ever Medical Technologies (healthcare data), Leaf Global Fintech (refugee finance), Blok-Z (sustainable energy), Liquid Mortgage (traditional debt), Apocene Co. (fashion), LOOPID (Circular Economy), Cincel Digital (document security), RIPChain (estate industry).  
5. **Security, Identity, and Compliance:**  
   * **Examples:** Auth3 Network, Cube Security, Inc., Demox Labs, Inc. (ZK chains), Anchain.ai, KryptoGo (regulation), Litentry (identity).  
6. **Metaverse & Gaming (GameFi):**  
   * **Examples:** metaENGINE, Curio, Sortium, Bit Country, PlayTable, ARterra.  
7. **Creator Economy, Social, and Community:**  
   * **Examples:** Societal Labs, Belong.net, Campground, ARterra.

This portfolio is a goldmine for competitive analysis. First, it confirms the RDI leadership's preferences: the heavy focus on DeFi/Finance/RWA maps directly to **Christine Parlour**, and the deep focus on Security/Privacy/Infrastructure maps directly to **Dawn Song**.

Second, the 2024 cohort (Cohort 7\) 36 shows a *clear and decisive pivot* toward the **intersection of AI and Web3**. Companies in this cohort include "AutoAPE.AI" (AI-Powered Robo-Advisory), "Coophive" (coordination layer for decentralized intelligence), "exaBITS" (global computing network for GPUs), "Giza" (verifiable ML platform), and "Zip Inc." (network of AI agents for on-chain actions). This *proves* RDI is aggressively investing at this intersection *right now*. The AgentX-AgentBeats competition is the logical next step of their 2024 investment thesis.

This portfolio presents three strategic opportunities for a "zero-to-one" project:

1. **Identify High-Potential Gaps:** The "Legal Domain Agent" track 1 is *dramatically* underrepresented in the Xcelerator portfolio 36 compared to the "DeFi Agent" track. A novel "Green Agent" here would have extremely high "Novelty."  
2. **Find High-Leverage Synergies:** A "Green Agent" could be designed to *test a capability* that is critical for *many* of these 110 startups. For example, a benchmark for "Verifiable ML Inference" would be directly relevant to "Giza".36 A benchmark for "Decentralized Identity" would be relevant to "Auth3 Network" and "Litentry".36 This creates *instant* "Impact".1  
3. **Follow the Trend:** Aligning with the 2024 cohort's theme (AI+Web3) 36 ensures the project is perfectly timed and aligned with RDI's *current* investment thesis.

**Table 3: RDI Xcelerator Portfolio Thematic Analysis** 36

| Thematic Cluster | Representative Companies | Alignment with RDI Leadership | Strategic Insight & Opportunity Gap |
| :---- | :---- | :---- | :---- |
| **DeFi & Financial Infrastructure** | Acala, Ava Protocol, Pendulum, ViteX, Lulubit | **Christine Parlour** (DeFi, Microstructure) | This is a *crowded* but *high-priority* field. A "Green Agent" here must be *extremely* novel. A "Battle of the Bots" 5 arena would stand out. |
| **Web3 Infrastructure & Dev Tools** | Automata, Blockless, PADO Labs, Pinata | **Dawn Song** (Decentralization, Privacy) | This is the "picks and shovels" category. A benchmark for "Software Testing Agents" 1 that can verify the robustness of these new protocols would be highly valued. |
| **Security, Identity, & Compliance** | Anchain.ai, Cube Security, Auth3 Network, KryptoGo | **Dawn Song** (Security, Privacy) | This is a *core* RDI pillar. This aligns perfectly with the "Agent Safety" and "Cybersecurity" tracks.1 A benchmark here is guaranteed to have a receptive audience. |
| **AI \+ Web3 (2024 Cohort)** | **Giza**, **AutoAPE.AI**, **Coophive**, **Zip Inc.** | **Song** (Decentralized AI) \+ **Parlour** (Finance) | **This is the *newest, highest-priority* investment thesis.** A benchmark for "Verifiable ML" (for Giza) or "On-chain AI Agents" (for Zip Inc.) would be perfectly timed and seen as high-impact. |
| **RWA & Enterprise** | Dtravel, Ever Medical, Liquid Mortgage, Blok-Z, Apocene | **Christine Parlour** (Finance, Economics) | This track is "realistic" 1 by definition. A benchmark for the "Healthcare Agent" track 1 (for Ever Medical) or "Finance Agent" 1 (for Liquid Mortgage) would be strong. |
| **Legal / Compliance** | KryptoGo, Cincel Digital, RIPChain | **RDI Law Faculty** (Partnoy, Wexler) 3 | **This is a "blue ocean" gap.** The "Legal Domain Agent" track 1 is on the list, but the portfolio is light. A "zero-to-one" idea here would have *extremely high* "Novelty".1 |

### **Sponsor Analysis: Aligning with Commercial Goals**

Finally, the prize sponsors are not neutral; they are participants with clear commercial goals, revealed by the tracks they have chosen to sponsor.

* **Prizes:** Over $1M in prizes and resources.1  
* **Key Sponsors:**  
  * **DeepMind:** Up to $50k in GCP/Gemini credits.1  
  * **Lambda:** $750 credits per winner ($400 for all).1  
  * **Nebius:** Up to $50k in inference credits ($50 for all).1  
  * **Amazon:** Up to $10k in AWS credits.1  
  * **Snowflake:** Credits and software access.1  
* Sponsored Tracks 1:  
  * **Lambda:** Sponsors the general **"Agent Safety"** track *and* the custom **"\[λ\] Lambda \- Agent Security"** track.  
  * **Nebius:** Sponsors the **"Coding Agent"** track and the **"Healthcare Agent"** track.

This is the final and most potent signal. Lambda is *doubling down* on security, sponsoring both the general-purpose track and a specific custom track for red-teaming.1 This reveals a clear commercial *demand* for high-quality, reusable benchmarks in this domain.

This creates a "triple-alignment" opportunity in the "Agent Safety" track:

1. **Academic Alignment:** It is the core research topic of RDI Co-Director **Dawn Song**.4  
2. **Methodological Alignment:** It is the prime use case for RDI Faculty **Sanjit Seshia's** formal verification tools.23  
3. **Commercial Alignment:** It is the *explicitly sponsored* domain of a key prize donor, **Lambda**.1

A "zero-to-one" project that aligns with "Safety," "Coding," or "Healthcare" has a dual path to success. It will appeal not only to the *academic* interests of the RDI faculty but also to the *commercial* interests of the sponsors who are providing the prizes and resources.

## **Strategic Recommendations for a "Zero-to-One" Project**

This final section synthesizes all preceding analysis into actionable, high-level strategies for positioning a "zero-to-one" project for victory.

### **The "Green Agent Flywheel": A Strategy for a Multi-Layered Win**

The analysis reveals that this competition is an entrepreneurial funnel. A participant should not aim for a single win (a prize) but for a *multi-layered* victory. This can be achieved via the "Green Agent Flywheel" strategy:

1. **Step 1: Get Selected (Phase 1).** The "zero-to-one" project must be designed as a "Green Agent" benchmark. It must be engineered for "Novelty," "Realism," and "Reliability" 1 by *perfectly aligning* with the core, published research of the RDI faculty (see Section III).  
2. **Step 2: Attract "Apex" Competitors (Phase 2).** The benchmark must be so novel and realistic that it *forces* the big labs (OpenAI, Google) and top startups (Replit, Sierra) from the Agentic AI Summit 13 to compete on it in Phase 2\. Their participation on *your* benchmark validates it on a global stage.  
3. **Step 3: Become a "Public Good" (Post-Competition).** As a "top green agent" 1, the project is adopted by RDI and promoted as a "shared public good".1 It becomes a new industry standard, cited in papers and used by other researchers (especially at Berkeley).  
4. **Step 4: Get Incubated (The Real Prize).** The project, now a validated, high-impact, SOTA benchmark, becomes the *prototype* for a startup. This startup is then a prime, fast-tracked candidate for the RDI Xcelerator, providing access to their $650M+ funding network and community.

This is not a competition entry; it is a *go-to-market strategy*. The AgentX-AgentBeats competition is a high-velocity, RDI-sponsored platform for launching a new company.

### **Actionable Opportunity Tracks (High-Potential "Green Agent" Concepts)**

Based on this analysis, three "zero-to-one" project concepts stand out as having the highest probability of success due to their deep alignment with the RDI's full-stack (academic, commercial, and technical) interests.

**Track 1: The Song-Parlour Intersection (Provably Secure DeFi Agents)**

* **Concept:** A "Green Agent" for the "DeFi Agent" track 1 that *fuses* Professor Parlour's "Battle of the Bots" 5 with Professor Song's "Provably Secure" AI.10  
* **Implementation:** The Green Agent would be an "Arena Mode" 1 DEX simulation. It would score Purple Agents on P\&L and market efficiency (Parlour's interest) *while simultaneously* subjecting them to a barrage of security and economic exploits (e.g., prompt-injection-based trade commands 4, flash loan attacks, oracle manipulation) and *formally verifying* their robustness (Song's interest).  
* **Why it Wins:** It directly targets the *intersecting* research of *both* RDI Co-Directors. It is "Novel" (combines security and economics), "Realistic" (addresses real DeFi exploits), and "Impactful" (critical for the *entire* Xcelerator DeFi portfolio 36).

**Track 2: The Seshia-Song Synthesis (Formally Verified Agentic Safety)**

* **Concept:** A "Green Agent" for the "Agent Safety" track 1 that *uses Sanjit Seshia's "Scenic" toolkit*.6  
* **Implementation:** The Green Agent would use "Scenic," a formal methods tool from Seshia's lab, to *probabilistically generate* a vast, diverse, and provably novel set of test scenarios for Purple Agents. This could be applied to "Cybersecurity" (generating novel attack vectors for the Lambda track 1) or "Healthcare" (generating novel patient edge cases for the Nebius track 1). This directly answers Song's call for "deep program analysis to formal verification".15  
* **Why it Wins:** It demonstrates an *unparalleled* understanding of the RDI's internal intellectual property. It *uses* an RDI faculty's *own tool* to build the benchmark, making it the most "Berkeley-aligned" project possible. It would score 10/10 on "Evaluator Quality" and "Impact" 1 and achieves the "triple-alignment" of Song, Seshia, and the sponsor Lambda.

**Track 3: The Parlour-Xcelerator Gap (Real-World Asset & Legal Agents)**

* **Concept:** A "Green Agent" benchmark that targets a *high-value, real-world vertical* that is *present* on the competition track list but *underrepresented* in the Xcelerator portfolio.  
* **Implementation:** The "Legal Domain Agent" track 1 is a prime example. The Xcelerator portfolio is light on LegalTech 36, but RDI *does* have law faculty (Frank Partnoy, Rebecca Wexler).3 A Green Agent that provides a complex, realistic benchmark for agents performing *contract analysis, due diligence, or regulatory compliance verification* would be extremely "Novel" 1 and "Realistic."  
* **Why it Wins:** It fills a "blue ocean" gap in RDI's ecosystem. It avoids the crowded "DeFi" space, defines a new capability that is critical for "Enterprise Agents" (a key summit theme) 13, and aligns perfectly with the "responsible digital economy" mission 3, which is heavily reliant on law and regulation.

### **Positioning Your Submission: Crafting the Narrative for Victory**

The submission is not just code; it is a *research contribution* and a *startup pitch*. The narrative must be crafted for this specific audience.

* **Use the RDI's Language:** The documentation (README.md, submission forms) *must* be saturated with the RDI's core vocabulary: "responsible," "safe," "robust," "provable," "decentralized," "empowering individuals," "public good," "real-world workload," and "impactful".1  
* **Explicitly Align with Faculty:** Demonstrate deep research. "This benchmark is inspired by Professor Song's work on provably secure AI..." or "This agent arena addresses the core question posed by Professor Parlour regarding machine-vs-human action in financial markets...".18 This proves alignment and diligence.  
* **Highlight "Zero-to-One" Status:** Frame the project as *defining a new capability space* 1, not just improving an old one. This aligns the "zero-to-one" identity with the "Novelty" criterion.  
* **Write for the Xcelerator:** The documentation should be structured like a pitch deck's problem/solution/impact statement. Clearly state the *problem* (e.g., "evaluating agentic DeFi security is fragmented and non-existent"), the *solution* (this Green Agent benchmark), and the *impact* (a "public good" that makes the entire ecosystem safer and more responsible).

### **Final Checklist for Success**

This checklist provides a final go/no-go test for a "zero-to-one" project's strategy.

* \[ \] **Phase 1 Focus:** Is 100% of the project's effort focused on building a "Green Agent"? 1  
* \[ \] **Technical Compliance:** Does the Green Agent *perfectly* implement the A2A server-orchestrator protocol as defined in the agentbeats/tutorial? 1  
* \[ \] **RDI Faculty Alignment:** Does the project *directly* target a core research area of Song (Security/Safety) 4, Parlour (DeFi/Finance) 5, or Seshia (Verification)?23  
* \[ \] **RDI Mission Alignment:** Does the [README.md](../../../README.md) and submission narrative frame the project as "responsible," "robust," "decentralized," and a "public good"? 1
* \[ \] **Ecosystem Awareness:** Does the project target a "triple-alignment" track (e.g., "Agent Safety") 1, a "double-alignment" track (e.g., "DeFi Agent") 1, or a "blue ocean" gap (e.g., "Legal Domain Agent")?36  
* \[ \] **Entrepreneurial Vision:** Is the project built like a *startup prototype* that would be eligible for the RDI Xcelerator?  
* \[ \] **Community Engagement:** Has the project team joined the Discord 1 and reviewed the Agentic AI MOOC 1 to build visibility and network with the 32,000+ community members?

#### **Works cited**

1. AgentX AgentBeats Competition \- Berkeley RDI, accessed November 16, 2025, [https://rdi.berkeley.edu/agentx-agentbeats.html](https://rdi.berkeley.edu/agentx-agentbeats.html)  
2. AgentX AgentBeats Competition \- Berkeley RDI, accessed November 16, 2025, [https://rdi.berkeley.edu/agentx-agentbeats](https://rdi.berkeley.edu/agentx-agentbeats)  
3. Berkeley RDI, accessed November 16, 2025, [https://rdi.berkeley.edu/](https://rdi.berkeley.edu/)  
4. Dawn Xiaodong Song's Home Page, accessed November 16, 2025, [https://dawnsong.io/](https://dawnsong.io/)  
5. Christine Parlour \- Berkeley Haas, accessed November 16, 2025, [https://haas.berkeley.edu/faculty/christine-parlour/](https://haas.berkeley.edu/faculty/christine-parlour/)  
6. Sanjit A. Seshia | EECS at UC Berkeley, accessed November 16, 2025, [https://www2.eecs.berkeley.edu/Faculty/Homepages/seshia.html](https://www2.eecs.berkeley.edu/Faculty/Homepages/seshia.html)  
7. A Decentralized Approach towards Responsible AI in Social ... \- arXiv, accessed November 16, 2025, [https://arxiv.org/pdf/2102.06362](https://arxiv.org/pdf/2102.06362)  
8. Dawn Song | EECS at UC Berkeley, accessed November 16, 2025, [https://www2.eecs.berkeley.edu/Faculty/Homepages/song.html](https://www2.eecs.berkeley.edu/Faculty/Homepages/song.html)  
9. Dawn Song \- UC Berkeley Research, accessed November 16, 2025, [https://vcresearch.berkeley.edu/faculty/dawn-song](https://vcresearch.berkeley.edu/faculty/dawn-song)  
10. Dawn Song \- AI2050 \- Schmidt Sciences, accessed November 16, 2025, [https://ai2050.schmidtsciences.org/fellow/dawn-song/](https://ai2050.schmidtsciences.org/fellow/dawn-song/)  
11. Dawn Song | Professor of Computer Science, University of California, UC Berkeley, accessed November 16, 2025, [https://www.ciforecast.com/speakers-talks/dawn-song](https://www.ciforecast.com/speakers-talks/dawn-song)  
12. A New Vision for Data Security \- UC Berkeley Research, accessed November 16, 2025, [https://vcresearch.berkeley.edu/uc-noyce-initiative/dawn-song](https://vcresearch.berkeley.edu/uc-noyce-initiative/dawn-song)  
13. Agentic AI Summit 2025 at UC Berkeley \- Center for Responsible ..., accessed November 16, 2025, [https://rdi.berkeley.edu/events/agentic-ai-summit](https://rdi.berkeley.edu/events/agentic-ai-summit)  
14. Day 33: Berkeley RDI's Agentic AI Summit August 2, 2025 — Foundations, Next Gen and How Agents Transform Industries (final part of 3 part series) \- LAKSHMI VENKATESH, accessed November 16, 2025, [https://luxananda.medium.com/day-33-berkeley-rdis-agentic-ai-summit-august-2-2025-foundations-next-gen-and-how-agents-9864f04ffe09](https://luxananda.medium.com/day-33-berkeley-rdis-agentic-ai-summit-august-2-2025-foundations-next-gen-and-how-agents-9864f04ffe09)  
15. Dawn Song | Reversing AI Asymmetry in Cybersecurity |Graph the Planet 2025 \- YouTube, accessed November 16, 2025, [https://www.youtube.com/watch?v=E6CfIqOO8e4](https://www.youtube.com/watch?v=E6CfIqOO8e4)  
16. PLENARY SESSION III | Christine PARLOUR: Liquidity Fragmentation on Decentralized Exchanges \[\#RF24\] \- YouTube, accessed November 16, 2025, [https://www.youtube.com/watch?v=SuemjWu7tfk](https://www.youtube.com/watch?v=SuemjWu7tfk)  
17. Christine Parlour \- UC Berkeley Research, accessed November 16, 2025, [https://vcresearch.berkeley.edu/faculty/christine-parlour](https://vcresearch.berkeley.edu/faculty/christine-parlour)  
18. Demystifying DeFi: Professor Christine Parlour talks decentralized ..., accessed November 16, 2025, [https://newsroom.haas.berkeley.edu/research/demystifying-defi-professor-christine-parlour-talks-decentralized-finance/](https://newsroom.haas.berkeley.edu/research/demystifying-defi-professor-christine-parlour-talks-decentralized-finance/)  
19. The Finance Parlour \- Google Sites, accessed November 16, 2025, [https://sites.google.com/berkeley.edu/thefinanceparlour/](https://sites.google.com/berkeley.edu/thefinanceparlour/)  
20. An Introduction to Web3 with Implications for Financial Services \- Federal Reserve Bank of Atlanta, accessed November 16, 2025, [https://www.atlantafed.org/-/media/documents/research/publications/policy-hub/2023/05/15/03--introduction-to-web3-with-implilcations-for-financial-services.pdf](https://www.atlantafed.org/-/media/documents/research/publications/policy-hub/2023/05/15/03--introduction-to-web3-with-implilcations-for-financial-services.pdf)  
21. ‪Sanjit A. Seshia‬ \- ‪Google Scholar‬, accessed November 16, 2025, [https://scholar.google.com/citations?user=SlZavnIAAAAJ\&hl=en](https://scholar.google.com/citations?user=SlZavnIAAAAJ&hl=en)  
22. NCSA | National Center for Supercomputing Applications: Distinguished Lecture: Sanjit Seshia, "Towards Verified AI-Based Autonomy" \- Calendars, accessed November 16, 2025, [https://calendars.illinois.edu/detail/7097/33477191](https://calendars.illinois.edu/detail/7097/33477191)  
23. Sanjit Seshia's Home \- People @EECS \- University of California, Berkeley, accessed November 16, 2025, [https://people.eecs.berkeley.edu/\~sseshia/](https://people.eecs.berkeley.edu/~sseshia/)  
24. Sanjit A. Seshia \- Towards a Design Flow for Verified AI-Based Autonomy \- YouTube, accessed November 16, 2025, [https://www.youtube.com/watch?v=JsrvC61oLYQ](https://www.youtube.com/watch?v=JsrvC61oLYQ)  
25. Theoretical Aspects of Trustworthy AI \- Simons Institute, accessed November 16, 2025, [https://simons.berkeley.edu/workshops/theoretical-aspects-trustworthy-ai](https://simons.berkeley.edu/workshops/theoretical-aspects-trustworthy-ai)  
26. Trevor Darrell | EECS at UC Berkeley, accessed November 16, 2025, [https://www2.eecs.berkeley.edu/Faculty/Homepages/darrell.html](https://www2.eecs.berkeley.edu/Faculty/Homepages/darrell.html)  
27. Trevor Darrell \- UC Berkeley Research, accessed November 16, 2025, [https://vcresearch.berkeley.edu/faculty/trevor-darrell](https://vcresearch.berkeley.edu/faculty/trevor-darrell)  
28. Prof. Trevor Darrell \- People @EECS, accessed November 16, 2025, [https://people.eecs.berkeley.edu/\~trevor/](https://people.eecs.berkeley.edu/~trevor/)  
29. Darrell Group at UC Berkeley, accessed November 16, 2025, [https://darrellgroup.github.io/](https://darrellgroup.github.io/)  
30. ‪Trevor Darrell‬ \- ‪Google Scholar‬, accessed November 16, 2025, [https://scholar.google.com/citations?user=bh-uRFMAAAAJ\&hl=en](https://scholar.google.com/citations?user=bh-uRFMAAAAJ&hl=en)  
31. The Berkeley Artificial Intelligence Research Blog, accessed November 16, 2025, [https://bair.berkeley.edu/blog/](https://bair.berkeley.edu/blog/)  
32. Events @Berkeley RDI, accessed November 16, 2025, [https://rdi.berkeley.edu/events](https://rdi.berkeley.edu/events)  
33. Agentic AI Summit 2025 \- A Record-Breaking Gathering at UC Berkeley\!, accessed November 16, 2025, [https://rdi.berkeley.edu/blog/agentic-ai-summit-2025](https://rdi.berkeley.edu/blog/agentic-ai-summit-2025)  
34. Agentic AI Summit \- Mainstage, Morning Sessions \- YouTube, accessed November 16, 2025, [https://www.youtube.com/watch?v=c39fJ2WAj6A](https://www.youtube.com/watch?v=c39fJ2WAj6A)  
35. Berkeley Blockchain Xcelerator: Home, accessed November 16, 2025, [https://xcelerator.berkeley.edu/](https://xcelerator.berkeley.edu/)  
36. Portfolio \- Berkeley Blockchain Xcelerator, accessed November 16, 2025, [https://xcelerator.berkeley.edu/portfolio/](https://xcelerator.berkeley.edu/portfolio/)