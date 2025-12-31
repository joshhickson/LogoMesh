# **`Lambda × Berkeley AgentBeats Security Arena: Building the Future of AI Security Testing`**

**`Repository:`** [`https://github.com/LambdaLabsML/agentbeats-lambda`

---

## **`Track Description`**

`The Agent Security Arena challenges participants to advance the field of AI agent security evaluation. Implement realistic security scenarios from our curated library of 400+ specifications—testing vulnerabilities like prompt injection, data exfiltration, and jailbreaking—using an industry‑standard adversarial testing framework. Your contributions will help define how we evaluate and secure AI agents operating in real‑world environments, from financial advisors to healthcare systems.`

`Browse the current scenario library on our scenario browser.`

---

## **`Competition Structure: Two Phases`**

### **`Overview`**

`As AI agents gain autonomy and take on sensitive tasks, current security testing methods fall short. The Agent Security Arena provides a framework for testing AI vulnerabilities through realistic adversarial scenarios. The competition runs in two sequential phases; all participants compete in both.`

* **`Phase 1 (November 24 – January 16):`** `Implement security scenarios that test real vulnerabilities.`

* **`Phase 2 (February 2 – February 23):`** `Compete with advanced attack or defense agents.`

`This track focuses on building realistic test scenarios that reveal actual vulnerabilities before they’re exploited in production. Participants will balance creating challenging attack scenarios while maintaining clear success criteria and realistic constraints.`

---

## **`Tasks & Deliverables`**

### **`Phase 1: Scenario Implementation (November 24 – January 16)`**

`Your deliverable is high‑quality Pull Requests to the main repository implementing security scenarios from Lambda’s specification library to be run by the Green Agent (orchestrator). We invite contributions across all attack categories:`

1. **`Implement Security Scenarios`**  
    `Design and implement realistic, challenging scenarios from the library. Current specifications include:`  
   * **`Prompt Injection & Jailbreaking:`** `Bypass safety guardrails in customer service agents.`  
   * **`Data Exfiltration & PII Leakage:`** `Extract sensitive information from healthcare or financial systems.`  
   * **`Indirect Injection:`** `Manipulate agents through external data sources (emails, documents, web content).`  
   * **`Insecure Output Handling:`** `Generate XSS, malicious code, or dangerous links.`  
   * **`Supply Chain Attacks:`** `Compromise dependencies or inject malicious packages.`

2. **`Demonstrate Security Impact`**  
    `For each scenario, provide:`  
   * `A working baseline test showing the scenario functions correctly.`  
   * **`Realistic target artifacts`** `(e.g., actual PII formats, functional exploits, real credential structures).`  
   * **`Creative implementation`** `beyond basic specifications.`  
   * **`Bonus:`** `Successful attack demonstration with evidence.`

3. **`Quality Documentation`**  
    `Submit comprehensive documentation explaining:`  
   * `Why the target is sensitive and realistic.`  
   * `What makes the implementation creative or novel.`  
   * `Evidence of functionality (baseline passing, attack success).`

### **`Phase 2: Agent Competition (February 2 – February 23)`**

`After Phase 1, teams will be assigned to Attacker or Defender tracks (after gathering preferences) and compete on selected scenarios from Phase 1:`

*   `Attackers: Develop advanced agents to break through defenses`  
*   `Defenders: Build hardened agents to resist attacks`  
*   `Weekly public leaderboard enables iteration and improvement`  
*  ` Final private leaderboard determines winners`

---

## **`Evaluation Criteria`**

`Submissions are evaluated on quality, realism, and security impact.`

###  `Phase 1 Scoring (100 points per scenario)`

 ` Required Gate:`

* `Must include attack_succeeded.json showing 1 successful attack`  
* `Can use up to 15 rounds for demonstration`

  `If missing → scenario receives 0 points`

  **`Scoring:`**

* **`Functionality (20%)`**`: Baseline passes, no crashes`  
* **`Realism (40%):`** `Real system, real vulnerability, actual security impact`  
* **`Security Challenge (40%):`** `Sophisticated attack vector, well-designed success conditions`

**`Important:`** `Trivial/placeholder targets (like "get the LLM to say 'banana'" or "repeat the password 'password123'") → 0 points`

**`Submission Limits:`** `Minimum 3 scenarios, maximum 6 scenarios. Diversity is appreciated so submitting at least 1 of each type is recommended!`

**`Phase 1 Winner`**`: Highest total score across all submitted scenarios`

### `Phase 2 Scoring`

`Winners will be determined based on performance on the private leaderboard, which uses a held-out set of scenarios not available during the public competition period.`

**`For each Phase`**`, the Top 3 finishers will receive cash prizes and consideration for employment opportunities`

* **`1st Place:`** `$5,000`  
* **`2nd Place:`** `$3,000`  
* **`3rd Place:`** `$1,000`

---

**`Resources & Getting Started`**

### **`Repository & Framework`**

`The Agent Security Arena framework is fully extensible to implement new scenarios and purple agents. Submissions will be in the form of a high quality PR (example for a scenario here).`

### 

### **`Documentation`**

`Study existing examples:`

* **`PortfolioIQ`** `— Data injection in financial risk assessment`  
   `scenarios/security_arena/plugins/portfolioiq.py`  
* **`Thingularity`** `— Information disclosure from shopping assistant`  
   `scenarios/security_arena/plugins/thingularity.py`  
* **`GlitchInTheMatrix`** `— Resource exhaustion (DoS)`  
   `submissions/lambda_example/glitchinthematrix/`

`Core docs:`

* **`README.md`** `- Framework architecture and usage`  
* **`SCENARIO_SPECIFICATIONS.md`** `- Plugin interface and submission requirements`

### **`Scenario Library`**

`Browse 462 security scenario specifications. Each specification includes:` 

* `attack vectors`  
* `target artifacts`  
* `success conditions`  
* `visual diagrams.`

---

**`Support`**

`Lambda engineers have set up dedicated support for participants:`

* **`Discord:`** `Support channel`   
* **`GitHub Issues:`** `Bug reports and technical questions`  
* **`Response Time:`** `Critical issues same‑day; general questions within 24 hours`

**`POC:`** `Devina Jain`

**`Team:`** `David Hartmann, Chuan Li`

`We’re committed to helping you succeed - ask us anything about the framework, scenario implementation, or evaluation criteria.`

---

## **`Technical Specifications`**

### **`Model Constraint`**

**`Model Constraint:`** `Use gpt-oss-20b to ensure fair compute (fits in 80GB H100); no proprietary API advantage.`

## **`Key Dates`**

| `Date` | `Milestone` |
| ----- | ----- |
| `Nov 24, 2025` | `Phase 1 begins - Start building scenarios` |
| `Jan 16, 2026` | `Phase 1 submissions due` |
| `Feb 2, 2026` | `Phase 2 begins - Agent competition launches` |
| `Feb 23, 2026` | `Winners announced` |

