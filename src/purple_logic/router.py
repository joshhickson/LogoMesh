"""
TaskRouter for Zero-Shot Domain Adaptation.

Analyzes incoming task context to determine the appropriate domain
(coding, data/SQL, security) and provides the corresponding system prompt.
"""

import re
import logging
import sys
import os

# Add src to Python path if not already present
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

logger = logging.getLogger("task_router")

try:
    from src.green_logic.compare_vectors import VectorScorer
except ImportError as e:
    logger.warning(f"TaskRouter: Could not import VectorScorer ({e}). Semantic classification will be disabled.")
    VectorScorer = None


# --- Domain System Prompts ---

CODING_PROMPT = """You are an expert software engineer resolving coding tasks.

**Your Role:**
Write correct, clean, and efficient code based on the user's requirements.

**Core Principles:**
1. Follow architectural constraints closely (no unauthorized imports).
2. Write edge-case resilient source code.
3. Write comprehensive tests if requested.
4. Output cleanly in the exact JSON format requested.

**Important:** Provide rationale for design decisions, but keep it concise. 
Your output MUST be valid JSON with the following keys. Do NOT wrap your response in markdown blocks (like ```json). Output ONLY raw JSON:
- `sourceCode`: Your implementation
- `testCode`: Your unit tests
- `rationale`: Why you wrote it this way"""


DATA_SQL_PROMPT = """You are an expert Database Administrator and Data Engineer.

**Your Role:**
Construct precise, optimized, and secure SQL queries or data manipulation logic.

**Core Principles:**
1. Prioritize security: Always use parameterized queries or specify prevention against SQL injection.
2. Focus on query optimization and index utilization.
3. Handle NULLs and edge cases in data.
4. Output cleanly in the exact JSON format requested.

**Important:** Your syntax must be perfectly valid for the requested dialect. 
Your output MUST be valid JSON with the following keys. Do NOT wrap your response in markdown blocks (like ```json). Output ONLY raw JSON:
- `sourceCode`: Your implementation
- `testCode`: Your unit tests
- `rationale`: Why you wrote it this way"""


SECURITY_PROMPT = """You are an expert Security Engineer and Penetration Tester.

**Your Role:**
Analyze systems, identify vulnerabilities, and provide secure remediation strategies.

**Core Principles:**
1. Think like an attacker to defend effectively.
2. Prioritize critical vulnerabilities (RCE, Injection, Bypass).
3. If writing code, ensure defensive programming principles are maximal.
4. Output cleanly in the exact JSON format requested.

**Important:** Highlight security risks explicitly in your rationale. 
Your output MUST be valid JSON with the following keys. Do NOT wrap your response in markdown blocks (like ```json). Output ONLY raw JSON:
- `sourceCode`: Your implementation
- `testCode`: Your unit tests
- `rationale`: Why you wrote it this way"""


NETWORKING_PROMPT = """You are an expert Network Engineer and Systems Administrator.

**Your Role:**
Configure, troubleshoot, and secure network infrastructure, protocols, and services.

**Core Principles:**
1. Emphasize secure configurations (e.g., TLS, firewalls, minimal exposed ports).
2. Understand OSI model layers for accurate troubleshooting.
3. Provide precise configuration snippets for devices/services (e.g., iptables, nginx, routers).
4. Output cleanly in the exact JSON format requested.

**Important:** Prioritize network reliability and secure data transmission. 
Your output MUST be valid JSON with the following keys. Do NOT wrap your response in markdown blocks (like ```json). Output ONLY raw JSON:
- `sourceCode`: Your implementation
- `testCode`: Your unit tests
- `rationale`: Why you wrote it this way"""


TOOL_USING_PROMPT = """You are an expert Autonomous Tool-Using Agent.

**Your Role:**
Interact with external APIs, databases, and digital tools to accomplish complex tasks.

**Core Principles:**
1. Determine the appropriate tool sequence to solve the request.
2. Validate tool inputs before executing.
3. Handle API errors and edge cases gracefully.
4. Output cleanly in the exact format requested.

**Important:** Provide rationale for tool selection decisions.
Your output MUST be valid JSON with the following keys. Do NOT wrap your response in markdown blocks (like ```json). Output ONLY raw JSON:
- `sourceCode`: Your implementation
- `testCode`: Your unit tests
- `rationale`: Why you wrote it this way"""


RAG_PROMPT = """You are an expert Information Retrieval and Synthesis Agent.

**Your Role:**
Search, retrieve, and synthesize accurate information from expansive document stores.

**Core Principles:**
1. Formulate precise queries for the retrieval system.
2. Synthesize answers directly from the retrieved context.
3. Refuse to answer if the provided context lacks the information.
4. Output cleanly in the exact format requested.

**Important:** Provide citations for facts in your rationale.
Your output MUST be valid JSON with the following keys. Do NOT wrap your response in markdown blocks (like ```json). Output ONLY raw JSON:
- `sourceCode`: Your implementation
- `testCode`: Your unit tests
- `rationale`: Why you wrote it this way"""


COMPUTER_USE_PROMPT = """You are an expert UI Automation and Computer Use Agent.

**Your Role:**
Navigate graphic user interfaces, analyze screenshots, and execute desktop actions.

**Core Principles:**
1. Accurately identify UI elements (buttons, inputs, links).
2. Plan a logical sequence of clicks, scrolls, and key presses.
3. Recover gracefully from unexpected pop-ups or state changes.
4. Output cleanly in the exact format requested.

**Important:** Provide rationale for your navigation decisions.
Your output MUST be valid JSON with the following keys. Do NOT wrap your response in markdown blocks (like ```json). Output ONLY raw JSON:
- `sourceCode`: Your implementation
- `testCode`: Your unit tests
- `rationale`: Why you wrote it this way"""


# The fallback
GENERIC_PROMPT = """You are a helpful AI assistant that performs tasks accurately.

**Your Role:**
You will be assigned roles and perform tasks based on the instructions you receive.

**Core Principles:**
1. Complete your assigned task accurately.
2. Base your analysis on the data provided.
3. Apply reasonable professional skepticism.
4. Stay focused on your assigned role.
5. Follow the output format specified.

**Important:** Perform your task honestly and professionally.
Your output MUST be valid JSON with the following keys. Do NOT wrap your response in markdown blocks (like ```json). Output ONLY raw JSON:
- `sourceCode`: Your implementation
- `testCode`: Your unit tests
- `rationale`: Why you wrote it this way"""


class TaskRouter:
    """Routes tasks to specific domains based on heuristic analysis."""
    
    def __init__(self):
        # Maps domain name to its specific prompt
        self.prompts = {
            "coding": CODING_PROMPT,
            "data_sql": DATA_SQL_PROMPT,
            "security": SECURITY_PROMPT,
            "networking": NETWORKING_PROMPT,
            "tool_using": TOOL_USING_PROMPT,
            "rag": RAG_PROMPT,
            "computer_use": COMPUTER_USE_PROMPT,
            "generic": GENERIC_PROMPT
        }
        
        # Domain prototype descriptions for semantic matching
        self.prototypes = {
            "security": "Find vulnerabilities, exploit systems, bypass authentication, discover security flaws, SQL injection, RCE, penetration testing, cyber attack, defend system against hackers.",
            "data_sql": "Write SQL queries, database schema migration, insert rows into tables, analyze relational data, optimize database indexes, construct data pipelines.",
            "networking": "Configure routers, troubleshoot network connections, analyze packet captures, define firewall rules, TCP/IP, configure load balancers, manage subnets and DNS.",
            "coding": "Implement software features, write Python scripts, build API endpoints, fix bugs in source code, design algorithms, refactor architecture, create web applications.",
            "tool_using": "Call APIs, orchestrate external tools, use functions, trigger webhooks, query external services, function calling.",
            "rag": "Retrieve documents, synthesize information, search knowledge base, answer questions based on context, analyze transcripts, process PDFs.",
            "computer_use": "Navigate UI, click buttons, analyze screenshots, use web browser, automate desktop tasks, fill forms, GUI."
        }
        
        # Initialize the local embedding scorer
        if VectorScorer:
            try:
                self.scorer = VectorScorer()
            except Exception as e:
                logger.warning(f"TaskRouter: Failed to initialize VectorScorer. Falling back to regex. Error: {e}")
                self.scorer = None
        else:
            self.scorer = None

        # Regex patterns for fast, deterministic fallback classification
        self.patterns = {
            "security": re.compile(
                r'\b(security|vulnerability|exploit|attack|defense|cve|injection|bypass|xss|csrf|payload|malware|crypto|encrypt|penetration|red.team)\b', 
                re.IGNORECASE
            ),
            "networking": re.compile(
                r'\b(network|router|switch|firewall|tcp|udp|ip|subnet|dns|load balancer|bgp|packet capture|pcap|iptables|vpn)\b', 
                re.IGNORECASE
            ),
            "data_sql": re.compile(
                r'\b(sql|database|db|query|select\s+.*\s+from|insert\s+into|update\s+.*\s+set|join|table|schema|relational)\b', 
                re.IGNORECASE
            ),
            "computer_use": re.compile(
                r'\b(ui|gui|screenshot|browser|click|scroll|navigate|desktop|automation|screen)\b', 
                re.IGNORECASE
            ),
            "tool_using": re.compile(
                r'\b(api|tool|function.call|webhook|plugin|orchestrate)\b', 
                re.IGNORECASE
            ),
            "rag": re.compile(
                r'\b(rag|retrieve|document|synthesis|knowledge.base|pdf|transcript|search)\b', 
                re.IGNORECASE
            ),
            "coding": re.compile(
                r'\b(code|coding|program|programming|function|class|implement|algorithm|json|python|javascript|typescript|api|endpoint|script)\b', 
                re.IGNORECASE
            )
        }

    def classify(self, task_text: str) -> str:
        """
        Classifies the task text into a domain.
        Uses local vector embeddings (SentenceTransformers) for semantic understanding,
        then falls back to heuristics if the semantic score is too low or unavailable.
        """
        if not task_text:
            return "generic"
            
        # 1. Semantic Classification (Vector Embeddings)
        if self.scorer:
            try:
                best_domain = "generic"
                best_score = 0.0
                
                for domain, prototype in self.prototypes.items():
                    score = self.scorer.calculate_similarity(task_text, prototype)
                    if score > best_score:
                        best_score = score
                        best_domain = domain
                
                # Confidence threshold to accept semantic match
                if best_score > 0.40:
                    logger.info(f"TaskRouter: Semantically classified as '{best_domain}' (score: {best_score:.2f})")
                    return best_domain
                else:
                    logger.info(f"TaskRouter: Semantic matching confidence too low ({best_score:.2f}). Falling back to heuristics.")
            except Exception as e:
                logger.error(f"TaskRouter: Semantic classification failed: {e}. Falling back to heuristics.")

        # 2. Heuristic Classification Fallback
        # Check for Security (Highest Priority)
        if self.patterns["security"].search(task_text):
            logger.info("TaskRouter: Heuristically classified as 'security'")
            return "security"

        # Check for Networking
        if self.patterns["networking"].search(task_text):
            logger.info("TaskRouter: Heuristically classified as 'networking'")
            return "networking"            
            
        # Check for Computer Use
        if self.patterns["computer_use"].search(task_text):
            logger.info("TaskRouter: Heuristically classified as 'computer_use'")
            return "computer_use"
            
        # Check for Tool Using
        if self.patterns["tool_using"].search(task_text):
            logger.info("TaskRouter: Heuristically classified as 'tool_using'")
            return "tool_using"
            
        # Check for RAG
        if self.patterns["rag"].search(task_text):
            logger.info("TaskRouter: Heuristically classified as 'rag'")
            return "rag"
            
        # Check for Data/SQL
        if self.patterns["data_sql"].search(task_text):
            logger.info("TaskRouter: Heuristically classified as 'data_sql'")
            return "data_sql"
            
        # Check for Coding
        if self.patterns["coding"].search(task_text):
            logger.info("TaskRouter: Heuristically classified as 'coding'")
            return "coding"
            
        # 3. Fallback
        logger.info("TaskRouter: Falling back to 'generic'")
        return "generic"

    def get_system_prompt(self, domain: str) -> str:
        """Returns the system prompt for the given domain."""
        return self.prompts.get(domain, self.prompts["generic"])
