# **Pivot Directive: LogoMesh Strategic Realignment**

**Status:** Approved for feat/cli-and-mcp

**Trigger:** Competitive Analysis (CodeRabbit Threat)

## **1\. The Threat: CodeRabbit**

* **Reality:** CodeRabbit owns "Intent Verification" (Vector-based RAG linked to Jira).  
* **Our Vulnerability:** Our "Rationale Integrity (R-Score)" is currently just vector similarity. In the market, this is a commodity.  
* **The Adjustment:** We will downgrade the marketing value of the R-Score and upgrade the A-Score (Architecture) and Red Agent.

## **2\. Pivot 1: Auditor Mode (logomesh check)**

**From "Semantic Alignment" \-\> To "Architectural Law"**

Vectors are fuzzy; Graphs are absolute. CodeRabbit can tell you if the code *sounds* like the ticket. Only LogoMesh can tell you if the code *violates* the dependency graph.

* **New Priority:** The "A-Score" (Architectural Integrity) is now the primary metric for the Auditor.  
* **Implementation Change:**  
  * The CLI must build a **Dependency Graph** of the repo on startup.  
  * It must enforce "Illegal Edges" (e.g., Controller imports Database directly).  
  * *Why this wins:* This is deterministic. It catches the "Spaghetti Code" that AI Agents love to write but Vectors fail to catch.

## **3\. Pivot 2: Architect Mode (logomesh build)**

**From "Auto-Coder" \-\> To "Pre-Commit Falsification"**

This is our "Zero-to-One" wedge. CodeRabbit is cloud-based; they cannot afford to run a 5-minute MCTS loop to attack every PR. Since we are local (vLLM), we can.

* **New Identity:** We are not a "Copilot." We are a **"Red Team in a Box."**  
* **Implementation Change:**  
  * **Adaptive Compute:** Implement the "System 1 vs System 2" router suggested in the report.  
    * *Simple Task ("Fix Typo"):* Skip Red Agent. Just generate.  
    * *Complex Task ("Auth Logic"):* Engage full MCTS Red Agent Loop.  
  * **The "Siege" Output:** When logomesh build finishes, it shouldn't just show the code. It should show the **Body Count** of the Red Agent (e.g., *"I generated 12 exploits. The final code survived all of them."*).

## **4\. The "Kill Shot": The DBOM**

The report validated that the **Decision Bill of Materials (DBOM)** is our enterprise wedge.

* **Action:** Ensure the mcp\_server.py exposes a specific tool: generate\_dbom().  
* **Use Case:** A CISO doesn't want to read code. They want a PDF that says *"This feature was Red Teamed by MCTS and passed."* We will sell that PDF.

## **5\. Summary of Branch Changes (feat/cli-and-mcp)**

1. **Add src/graph\_analysis.py:** A simple module to parse imports and build a dependency graph (NetworkX) for the A-Score.  
2. **Update src/cli.py:** Add the \--adaptive flag to switch between fast generation and deep Red Teaming.  
3. **Update src/mcp\_server.py:** Ensure assess\_code\_quality returns the Graph violations, not just vector drift.