# Josh's Action Items (Consolidated 2025-11-26)

This document lists the specific action items assigned to Josh, consolidated from the team feedback analysis log.

### Collaboration & Tooling
- [ ] Create a dedicated folder in Google Docs for project deliverables, starting with the "Contextual Debt Paper."

### Benchmark Strategy & Competition
- [ ] Plan a research task to investigate existing benchmarks and assess their suitability for compilation or adaptation.
- [ ] Investigate benchmark size requirements, with the intention of asking in the MOOC Discord if official documentation is unclear.

### Task Assignments & Role Clarifications
- [ ] Identify a suitable person (potentially "Garrett") for implementation tasks that were previously assigned to Alaa.

### Research & Intellectual Property
- [ ] Use Google Scholar Labs AI (Gemini integration) to perform a literature search for papers similar to the project's. The goal is to clearly identify and articulate the unique contributions of the CIS.

  **Primary Research Question:**
  > "To what extent has existing academic and industry literature addressed the concept of a composite software quality metric that, like the Contextual Integrity Score (CIS), programmatically evaluates AI-generated or human-written code by simultaneously measuring the semantic alignment of **(a)** the code to its documented intent, **(b)** the code's adherence to a defined system architecture, and **(c)** the semantic relevance of its test assertions to the original acceptance criteria?"

  **Sub-Questions for Investigation:**
  1.  **For Rationale Integrity:** "What prior art exists for quantifying the semantic traceability and alignment between source code and its corresponding natural language rationale (e.g., in design documents, code comments, or commit messages), particularly using vector embeddings or other NLP models?"
      *   *Example Search Terms:* `"semantic analysis of code documentation"`, `"measuring code intent alignment"`, `"software traceability NLP"`, `"automated code-to-documentation consistency"`

  2.  **For Architectural Integrity:** "Beyond simple dependency rule-checking, what automated methods or formalisms have been proposed to measure 'architectural integrity' or detect 'architectural drift' by analyzing the structural properties of a specific code change against a predefined architectural model?"
      *   *Example Search Terms:* `"automated architectural conformance checking"`, `"software architecture verification static analysis"`, `"measuring architectural drift"`, `"graph-based architecture analysis"`

  3.  **For Testing Integrity:** "What research has been conducted on 'semantic test coverage,' defining metrics that evaluate the alignment between the natural language assertions in test cases and the high-level functional requirements or acceptance criteria, as distinct from traditional execution-based code coverage?"
      *   *Example Search Terms:* `"semantic test coverage"`, `"natural language processing in software testing"`, `"measuring test case quality from requirements"`, `"acceptance criteria to test assertion mapping"`
