"""
Red Agent V4 - AGI-Level Autonomous Vulnerability Hunter with MCTS.

UPGRADE: From greedy ReAct to Monte Carlo Tree Search (Tree of Thoughts)

A greedy ReAct loop takes the FIRST action that looks good.
An AGI agent SIMULATES multiple futures before committing to one.

Architecture:
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RedAgentV4 (MCTS / Tree of Thoughts)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         BRANCHING                                    │   │
│  │  Agent proposes 3 possible next steps:                              │   │
│  │  ├─ Branch A: "Scan for SQL injection patterns"                     │   │
│  │  ├─ Branch B: "Fuzz the auth() function inputs"                     │   │
│  │  └─ Branch C: "Check git history for hardcoded secrets"             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ↓                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        VALUATION                                     │   │
│  │  Scorer Model rates each branch's potential:                        │   │
│  │  ├─ Branch A: 35% success (common vuln, worth checking)             │   │
│  │  ├─ Branch B: 60% success (auth functions often vulnerable)         │   │
│  │  └─ Branch C: 15% success (useful but low immediate value)          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ↓                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        SELECTION                                     │   │
│  │  Agent picks high-value path: Branch B (fuzz auth)                  │   │
│  │  But REMEMBERS other branches for backtracking if needed            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ↓                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        EXECUTION                                     │   │
│  │  Tool: fuzz_function("auth")                                        │   │
│  │  Result: "Timing attack vulnerability found!"                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ↓                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       BACKPROPAGATION                                │   │
│  │  Update branch values based on actual results:                      │   │
│  │  Branch B score: 60% → 85% (confirmed valuable)                     │   │
│  │  Similar branches (auth-related) get boosted                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
"""

import asyncio
import json
import math
import os
import random
import re
import sys
import time
from dataclasses import dataclass, field
from typing import Optional, Any, Callable, Awaitable, List, Dict, Tuple
from enum import Enum

# Add parent path to allow imports from green_logic (for Docker compatibility)
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from green_logic.red_report_types import RedAgentReport, Vulnerability, Severity

from .workers.static_mirror import StaticMirrorWorker
from .workers.constraint_breaker import ConstraintBreakerWorker
from .dependency_analyzer import analyze_dependencies, findings_to_vulnerabilities
from .semantic_analyzer import analyze_with_semantics


# =============================================================================
# MCTS / TREE OF THOUGHTS: Strategic Planning for AGI-Level Reasoning
# =============================================================================

@dataclass
class ThoughtNode:
    """
    A node in the Tree of Thoughts.

    Each node represents a possible action the agent could take,
    along with statistics from MCTS exploration.
    """
    id: str
    action: dict  # {"tool": "...", "parameters": {...}, "reasoning": "..."}
    parent: Optional["ThoughtNode"] = None
    children: List["ThoughtNode"] = field(default_factory=list)

    # MCTS statistics
    visits: int = 0
    value: float = 0.0  # Accumulated value from simulations
    prior: float = 0.5  # Initial probability estimate from LLM

    # Execution results (filled after action is taken)
    executed: bool = False
    result: Optional[str] = None
    findings_count: int = 0

    def ucb1_score(self, exploration_weight: float = 1.414) -> float:
        """
        Upper Confidence Bound for Trees (UCB1) score.

        Balances exploitation (high value) vs exploration (low visits).
        """
        if self.visits == 0:
            return float('inf')  # Unexplored nodes have highest priority

        exploitation = self.value / self.visits
        exploration = exploration_weight * math.sqrt(math.log(self.parent.visits + 1) / self.visits)

        return exploitation + exploration + (self.prior * 0.5)  # Prior bonus

    def backpropagate(self, reward: float):
        """Update this node and all ancestors with the reward."""
        node = self
        while node is not None:
            node.visits += 1
            node.value += reward
            node = node.parent


class MCTSPlanner:
    """
    Monte Carlo Tree Search Planner for strategic action selection.

    Instead of greedily picking the first good action, MCTS:
    1. BRANCHES: Proposes multiple possible actions
    2. VALUATES: Scores each branch's potential
    3. SELECTS: Picks the highest-value path
    4. BACKPROPAGATES: Updates values based on actual results
    """

    def __init__(
        self,
        client,  # OpenAI client
        model: str,
        num_branches: int = 3,
        exploration_weight: float = 1.414
    ):
        self.client = client
        self.model = model
        self.num_branches = num_branches
        self.exploration_weight = exploration_weight
        self.root: Optional[ThoughtNode] = None
        self.current_node: Optional[ThoughtNode] = None
        self.node_counter = 0

    def _generate_node_id(self) -> str:
        self.node_counter += 1
        return f"node_{self.node_counter}"

    async def expand(
        self,
        memory: "AgentMemory",
        tools: "ToolRegistry",
        task_description: str,
        code: str
    ) -> List[ThoughtNode]:
        """
        BRANCHING: Generate multiple possible next actions.

        Instead of asking "what should I do next?", we ask
        "what are 3 different things I could try?"
        """
        system_prompt = """You are an AGI security researcher using Tree of Thoughts reasoning.

Instead of picking ONE action, you must propose EXACTLY 3 DIFFERENT strategic paths.
Each path should have a DIFFERENT approach to finding vulnerabilities.

For each path, estimate its success probability (0.0-1.0) based on:
- How likely this approach is to find vulnerabilities
- How much of the code it will cover
- Your prior knowledge about common vulnerability patterns

Return EXACTLY 3 options in JSON format:
{
  "branches": [
    {
      "tool": "tool_name",
      "parameters": {...},
      "reasoning": "Why this approach might work",
      "success_probability": 0.XX
    },
    {
      "tool": "tool_name", 
      "parameters": {...},
      "reasoning": "Why this different approach might work",
      "success_probability": 0.XX
    },
    {
      "tool": "tool_name",
      "parameters": {...},
      "reasoning": "Why this third approach might work", 
      "success_probability": 0.XX
    }
  ]
}

DIVERSIFY your suggestions:
- One could be broad (scan_file, check_dependencies)
- One could be targeted (analyze_function, grep_pattern)
- One could be creative (fuzz_function, create_tool)

Available tools: scan_file, fuzz_function, read_code, grep_pattern, analyze_function, 
check_dependencies, report_vulnerability, add_hypothesis, conclude_investigation, create_tool"""

        context = memory.get_context_summary()

        user_prompt = f"""## Task
{task_description or "Find security vulnerabilities in this code."}

## Code (first 80 lines)
```python
{chr(10).join(code.split(chr(10))[:80])}
```

## Current State
{context}

## Step {memory.current_step}

Propose 3 DIFFERENT strategic paths to investigate. Return JSON only."""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,  # Higher temp for diverse branches
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            data = json.loads(content)
            branches = data.get("branches", [])

            nodes = []
            for branch in branches[:self.num_branches]:
                node = ThoughtNode(
                    id=self._generate_node_id(),
                    action={
                        "tool": branch.get("tool", "scan_file"),
                        "parameters": branch.get("parameters", {}),
                        "reasoning": branch.get("reasoning", "")
                    },
                    parent=self.current_node,
                    prior=branch.get("success_probability", 0.5)
                )
                nodes.append(node)

            # If we got fewer than expected, add fallback nodes
            while len(nodes) < self.num_branches:
                fallback_tools = ["scan_file", "check_dependencies", "grep_pattern"]
                tool = fallback_tools[len(nodes) % len(fallback_tools)]
                nodes.append(ThoughtNode(
                    id=self._generate_node_id(),
                    action={"tool": tool, "parameters": {}, "reasoning": "Fallback exploration"},
                    parent=self.current_node,
                    prior=0.3
                ))

            return nodes

        except Exception as e:
            print(f"[MCTS] Expansion error: {e}")
            # Return fallback nodes
            return [
                ThoughtNode(
                    id=self._generate_node_id(),
                    action={"tool": "scan_file", "parameters": {}, "reasoning": "Fallback: initial scan"},
                    parent=self.current_node,
                    prior=0.5
                ),
                ThoughtNode(
                    id=self._generate_node_id(),
                    action={"tool": "check_dependencies", "parameters": {}, "reasoning": "Fallback: check imports"},
                    parent=self.current_node,
                    prior=0.4
                ),
                ThoughtNode(
                    id=self._generate_node_id(),
                    action={"tool": "grep_pattern", "parameters": {"pattern": r"(password|secret|key|token)"}, "reasoning": "Fallback: find secrets"},
                    parent=self.current_node,
                    prior=0.4
                )
            ]

    async def valuate(
        self,
        nodes: List[ThoughtNode],
        memory: "AgentMemory"
    ) -> List[Tuple[ThoughtNode, float]]:
        """
        VALUATION: Score each branch's potential value.

        Uses a combination of:
        - LLM prior probability (from expansion)
        - Heuristic bonuses (unexplored areas, common vulns)
        - MCTS statistics (UCB1 score)
        """
        scored_nodes = []

        for node in nodes:
            # Base score from LLM prior
            score = node.prior

            # Heuristic bonuses
            tool = node.action.get("tool", "")
            params = node.action.get("parameters", {})

            # Bonus for targeting unexplored functions
            if tool in ["analyze_function", "fuzz_function"]:
                func_name = params.get("function_name", "")
                if func_name and func_name not in memory.explored_functions:
                    score += 0.15  # Unexplored bonus

            # Bonus for high-value targets
            high_value_patterns = ["auth", "login", "password", "token", "admin", "secret", "key", "sql", "query"]
            reasoning_lower = node.action.get("reasoning", "").lower()
            for pattern in high_value_patterns:
                if pattern in reasoning_lower:
                    score += 0.1
                    break

            # Penalty if we've already done similar actions
            similar_observations = sum(1 for obs in memory.observations if tool in obs)
            if similar_observations > 2:
                score -= 0.2

            # UCB1 score if node has been visited before
            if node.visits > 0:
                score = node.ucb1_score(self.exploration_weight)

            scored_nodes.append((node, min(1.0, max(0.0, score))))

        # Sort by score descending
        scored_nodes.sort(key=lambda x: x[1], reverse=True)

        # Log the valuations for debugging
        print(f"[MCTS] Valuations:")
        for node, score in scored_nodes:
            tool = node.action.get("tool", "?")
            prior = node.prior
            print(f"  - {tool}: score={score:.2f} (prior={prior:.2f}, visits={node.visits})")

        return scored_nodes

    def select(self, scored_nodes: List[Tuple[ThoughtNode, float]]) -> ThoughtNode:
        """
        SELECTION: Pick the best branch to explore.

        Uses GREEDY selection with small epsilon for exploration.
        This ensures high-value paths are prioritized while occasionally
        exploring alternatives when scores are close.
        """
        if not scored_nodes:
            raise ValueError("No nodes to select from")

        # Greedy epsilon selection (much better than softmax for exploitation)
        epsilon = 0.1  # 10% chance to explore randomly

        best_node, best_score = scored_nodes[0]

        # Check if we should explore instead of exploit
        if random.random() < epsilon and len(scored_nodes) > 1:
            # Only explore if alternative scores are reasonably close (within 0.3)
            alternatives = [(n, s) for n, s in scored_nodes[1:] if s >= best_score - 0.3]
            if alternatives:
                selected = random.choice(alternatives)
                print(f"[MCTS] 🎲 Exploring: {selected[0].action.get('tool')} (score={selected[1]:.2f}) instead of {best_node.action.get('tool')} (score={best_score:.2f})")
                return selected[0]

        # Greedy: pick the highest-scored node
        print(f"[MCTS] ✓ Selected: {best_node.action.get('tool')} (score={best_score:.2f})")
        return best_node

    def backpropagate(self, node: ThoughtNode, reward: float):
        """
        BACKPROPAGATION: Update the tree with actual results.

        After executing an action, we update the value estimates
        for this node and all its ancestors.
        """
        node.backpropagate(reward)

        # Log for visibility
        print(f"[MCTS] 📊 Backprop: {node.action.get('tool')} | "
              f"Reward: {reward:.2f} | Visits: {node.visits} | Value: {node.value:.2f}")

    async def plan_next_action(
        self,
        memory: "AgentMemory",
        tools: "ToolRegistry",
        task_description: str,
        code: str
    ) -> dict:
        """
        Main MCTS planning loop: Branch → Valuate → Select

        Returns the selected action to execute.
        """
        # Initialize root if needed
        if self.root is None:
            self.root = ThoughtNode(
                id="root",
                action={"tool": "root", "parameters": {}, "reasoning": "Root node"}
            )
            self.current_node = self.root

        # BRANCH: Generate possible actions
        print(f"[MCTS] 🌳 Branching: Generating {self.num_branches} possible paths...")
        candidate_nodes = await self.expand(memory, tools, task_description, code)

        # Add candidates as children of current node
        self.current_node.children.extend(candidate_nodes)

        # VALUATE: Score each branch
        print(f"[MCTS] 📈 Valuating branches...")
        scored_nodes = await self.valuate(candidate_nodes, memory)

        # Log the branches
        for node, score in scored_nodes:
            print(f"[MCTS]   ├─ {node.action.get('tool')}: {score:.2f} "
                  f"(prior={node.prior:.2f}) - {node.action.get('reasoning', '')[:50]}...")

        # SELECT: Pick the best branch
        selected_node = self.select(scored_nodes)
        print(f"[MCTS] ✅ Selected: {selected_node.action.get('tool')} "
              f"({selected_node.action.get('reasoning', '')[:60]}...)")

        # Move to selected node
        self.current_node = selected_node

        return selected_node.action

    def record_result(self, success: bool, findings_count: int, result_text: str):
        """Record the result of executing the selected action."""
        if self.current_node:
            self.current_node.executed = True
            self.current_node.result = result_text
            self.current_node.findings_count = findings_count

            # Calculate reward based on results
            reward = 0.0
            if findings_count > 0:
                reward = min(1.0, 0.3 + (findings_count * 0.2))  # Up to 1.0 for many findings
            elif success:
                reward = 0.2  # Small reward for successful execution
            else:
                reward = -0.1  # Small penalty for failures

            # Backpropagate the reward
            self.backpropagate(self.current_node, reward)


try:
    from openai import AsyncOpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False


# =============================================================================
# META-AGENT: Dynamic Tool Creation (AGI-Level Capability)
# =============================================================================

class DynamicToolBuilder:
    """
    AGI Meta-Agent Capability: Build tools at runtime.

    A standard agent complains: "I don't have a tool for this."
    An AGI agent says: "I will CREATE a tool for this."

    Flow:
    1. Detection: Agent realizes it lacks a capability
    2. Fabrication: Agent writes a Python function
    3. Hot-Swapping: Tool is registered into ToolRegistry at runtime
    4. Execution: Agent uses the tool it just built
    """

    def __init__(self):
        self.created_tools: dict[str, dict] = {}  # name -> {code, function, description}
        self.execution_namespace: dict = {}  # Sandboxed namespace for tool execution

    def create_tool(
        self,
        tool_name: str,
        tool_code: str,
        description: str,
        parameters: dict
    ) -> tuple[bool, str]:
        """
        Dynamically create a new tool from Python code.

        Args:
            tool_name: Unique name for the tool (e.g., "parse_dat_file")
            tool_code: Python code defining an async function with signature:
                       async def tool_name(params: dict, memory: AgentMemory, source_code: str) -> ToolResult
            description: What the tool does (for LLM context)
            parameters: JSON schema for tool parameters

        Returns:
            (success, message) tuple
        """
        # Validate tool name
        if not tool_name.isidentifier():
            return False, f"Invalid tool name: {tool_name}"

        if tool_name in self.created_tools:
            return False, f"Tool already exists: {tool_name}"

        # Security: Basic validation of the code
        dangerous_patterns = [
            r'\bos\.system\b', r'\bsubprocess\b', r'\beval\b', r'\bexec\b',
            r'\b__import__\b', r'\bopen\s*\([^)]*["\']w', r'\brmtree\b',
            r'\bshutil\.rm', r'\brequest\b', r'\burllib\b'
        ]
        for pattern in dangerous_patterns:
            if re.search(pattern, tool_code):
                return False, f"Security violation: Dangerous pattern detected in tool code"

        # Prepare execution namespace with safe imports
        safe_namespace = {
            're': re,
            'json': json,
            'ToolResult': ToolResult,
            'AgentMemory': AgentMemory,
            'Optional': Optional,
            'Any': Any,
            'dict': dict,
            'list': list,
            'str': str,
            'int': int,
            'float': float,
            'bool': bool,
            'len': len,
            'range': range,
            'enumerate': enumerate,
            'zip': zip,
            'sorted': sorted,
            'min': min,
            'max': max,
            'sum': sum,
            'abs': abs,
            'isinstance': isinstance,
            'hasattr': hasattr,
            'getattr': getattr,
        }

        try:
            # Compile and execute the code in sandboxed namespace
            exec(tool_code, safe_namespace)

            # Extract the function
            if tool_name not in safe_namespace:
                return False, f"Tool code must define a function named '{tool_name}'"

            func = safe_namespace[tool_name]
            if not callable(func):
                return False, f"'{tool_name}' is not callable"

            # Register the tool
            self.created_tools[tool_name] = {
                'code': tool_code,
                'function': func,
                'description': description,
                'parameters': parameters
            }

            print(f"[MetaAgent] 🔧 Created new tool: {tool_name}")
            return True, f"Tool '{tool_name}' created successfully"

        except SyntaxError as e:
            return False, f"Syntax error in tool code: {e}"
        except Exception as e:
            return False, f"Failed to create tool: {e}"

    async def execute_tool(
        self,
        tool_name: str,
        params: dict,
        memory: 'AgentMemory',
        source_code: str
    ) -> 'ToolResult':
        """Execute a dynamically created tool."""
        if tool_name not in self.created_tools:
            return ToolResult(success=False, output=f"Dynamic tool not found: {tool_name}")

        tool = self.created_tools[tool_name]
        func = tool['function']

        try:
            # Execute the tool (may be sync or async)
            import asyncio
            if asyncio.iscoroutinefunction(func):
                result = await func(params, memory, source_code)
            else:
                result = func(params, memory, source_code)

            # Ensure result is ToolResult
            if isinstance(result, ToolResult):
                return result
            else:
                return ToolResult(success=True, output=str(result))

        except Exception as e:
            return ToolResult(success=False, output=f"Tool execution error: {e}")

    def get_tool_definitions(self) -> list[dict]:
        """Get tool definitions for all dynamically created tools."""
        return [
            {
                "name": name,
                "description": f"[DYNAMIC] {tool['description']}",
                "parameters": tool['parameters']
            }
            for name, tool in self.created_tools.items()
        ]

    def has_tool(self, tool_name: str) -> bool:
        """Check if a dynamic tool exists."""
        return tool_name in self.created_tools


# =============================================================================
# MEMORY: Persistent context across reasoning steps
# =============================================================================

@dataclass
class Finding:
    """A single finding discovered during investigation."""
    step: int
    tool_used: str
    category: str
    description: str
    severity: str
    evidence: str
    line_number: Optional[int] = None


@dataclass
class Hypothesis:
    """A hypothesis the agent is investigating."""
    id: str
    statement: str
    status: str = "investigating"  # investigating, confirmed, rejected
    evidence_for: list[str] = field(default_factory=list)
    evidence_against: list[str] = field(default_factory=list)


@dataclass
class AgentMemory:
    """
    Persistent memory that tracks the agent's investigation state.

    This is what makes the agent "intelligent" - it remembers what it's
    found and uses that to guide future actions.
    """
    # What we've discovered
    findings: list[Finding] = field(default_factory=list)

    # What we're investigating
    hypotheses: list[Hypothesis] = field(default_factory=list)

    # What we've already explored (to avoid loops)
    explored_functions: set[str] = field(default_factory=set)
    explored_patterns: set[str] = field(default_factory=set)
    explored_lines: set[int] = field(default_factory=set)

    # Suspicious areas to investigate
    investigation_queue: list[dict] = field(default_factory=list)

    # Raw observations from tools
    observations: list[str] = field(default_factory=list)

    # Source code being analyzed (needed for semantic filtering)
    source_code: str = ""

    # Step counter
    current_step: int = 0

    def add_finding(self, tool: str, category: str, description: str,
                    severity: str, evidence: str, line: Optional[int] = None):
        """Add a new finding to memory."""
        self.findings.append(Finding(
            step=self.current_step,
            tool_used=tool,
            category=category,
            description=description,
            severity=severity,
            evidence=evidence,
            line_number=line
        ))

    def add_hypothesis(self, statement: str) -> str:
        """Add a new hypothesis to investigate."""
        h_id = f"H{len(self.hypotheses) + 1}"
        self.hypotheses.append(Hypothesis(id=h_id, statement=statement))
        return h_id

    def update_hypothesis(self, h_id: str, status: str, evidence: str, supports: bool):
        """Update a hypothesis with new evidence."""
        for h in self.hypotheses:
            if h.id == h_id:
                if supports:
                    h.evidence_for.append(evidence)
                else:
                    h.evidence_against.append(evidence)
                h.status = status
                break

    def queue_investigation(self, target: str, reason: str, priority: int = 5):
        """Add something to the investigation queue."""
        self.investigation_queue.append({
            "target": target,
            "reason": reason,
            "priority": priority,
            "added_at_step": self.current_step
        })
        # Sort by priority (higher = more urgent)
        self.investigation_queue.sort(key=lambda x: x["priority"], reverse=True)

    def get_context_summary(self) -> str:
        """Generate a summary of current investigation state for the LLM."""
        summary_parts = []

        # Findings summary
        if self.findings:
            summary_parts.append("## Confirmed Findings")
            for f in self.findings[-5:]:  # Last 5 findings
                summary_parts.append(f"- [{f.severity}] {f.category}: {f.description}")

        # Active hypotheses
        active = [h for h in self.hypotheses if h.status == "investigating"]
        if active:
            summary_parts.append("\n## Active Hypotheses")
            for h in active:
                summary_parts.append(f"- {h.id}: {h.statement}")

        # Investigation queue
        if self.investigation_queue:
            summary_parts.append("\n## Investigation Queue")
            for item in self.investigation_queue[:3]:  # Top 3
                summary_parts.append(f"- {item['target']}: {item['reason']}")

        # What we've explored
        if self.explored_functions:
            summary_parts.append(f"\n## Already Explored")
            summary_parts.append(f"Functions: {', '.join(list(self.explored_functions)[:10])}")

        return "\n".join(summary_parts) if summary_parts else "No findings yet."

    def has_critical_finding(self) -> bool:
        """Check if we've found something critical."""
        return any(f.severity == "critical" for f in self.findings)


# =============================================================================
# TOOLS: Actions the agent can take
# =============================================================================

@dataclass
class ToolResult:
    """Result from executing a tool."""
    success: bool
    output: str
    findings: list[dict] = field(default_factory=list)
    suggested_next: list[str] = field(default_factory=list)


class ToolRegistry:
    """
    Registry of tools available to the Red Agent.

    Each tool is a capability the agent can invoke during its investigation.
    Tools are designed to be:
    1. Focused - Do one thing well
    2. Observable - Return clear results
    3. Composable - Can be chained together

    AGI Upgrade: Now supports DYNAMIC TOOL CREATION via Meta-Agent capability.
    The agent can create new tools at runtime when it lacks a capability.
    """

    def __init__(self, source_code: str, task_description: str = ""):
        self.source_code = source_code
        self.task_description = task_description
        self.source_lines = source_code.split('\n')

        # Initialize static analysis workers
        self.static_worker = StaticMirrorWorker()
        self.constraint_worker = ConstraintBreakerWorker()

        # Meta-Agent: Dynamic tool builder for runtime tool creation
        self.dynamic_builder = DynamicToolBuilder()

        # Tool definitions for the LLM
        self.tool_definitions = [
            {
                "name": "scan_file",
                "description": "Run comprehensive static security analysis on the code. Finds common vulnerabilities like SQL injection, XSS, command injection, etc.",
                "parameters": {"type": "object", "properties": {}, "required": []}
            },
            {
                "name": "fuzz_function",
                "description": "Attempt to break constraints and find edge cases in a specific function. Good for finding input validation issues.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "function_name": {"type": "string", "description": "Name of the function to fuzz"}
                    },
                    "required": ["function_name"]
                }
            },
            {
                "name": "read_code",
                "description": "Read specific lines of code to understand implementation details.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "start_line": {"type": "integer", "description": "Starting line number (1-indexed)"},
                        "end_line": {"type": "integer", "description": "Ending line number (1-indexed)"}
                    },
                    "required": ["start_line", "end_line"]
                }
            },
            {
                "name": "grep_pattern",
                "description": "Search for a regex pattern in the code. Useful for finding usages of dangerous functions or tracing data flow.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pattern": {"type": "string", "description": "Regex pattern to search for"}
                    },
                    "required": ["pattern"]
                }
            },
            {
                "name": "analyze_function",
                "description": "Deep analysis of a specific function for security issues, including data flow and taint analysis.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "function_name": {"type": "string", "description": "Name of the function to analyze"}
                    },
                    "required": ["function_name"]
                }
            },
            {
                "name": "check_dependencies",
                "description": "Analyze imports and dependencies for known vulnerabilities and dangerous patterns.",
                "parameters": {"type": "object", "properties": {}, "required": []}
            },
            {
                "name": "report_vulnerability",
                "description": "Report a confirmed vulnerability. Use this when you have evidence of a real security issue.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "severity": {"type": "string", "enum": ["critical", "high", "medium", "low", "info"]},
                        "category": {"type": "string", "description": "Type of vulnerability (sql_injection, xss, etc.)"},
                        "title": {"type": "string", "description": "Short title for the vulnerability"},
                        "description": {"type": "string", "description": "Detailed description with evidence"},
                        "line_number": {"type": "integer", "description": "Line number where the issue occurs"},
                        "exploit_code": {"type": "string", "description": "Example exploit or proof of concept"}
                    },
                    "required": ["severity", "category", "title", "description"]
                }
            },
            {
                "name": "add_hypothesis",
                "description": "Add a hypothesis to investigate. Use this to track your reasoning.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "hypothesis": {"type": "string", "description": "The hypothesis statement to investigate"}
                    },
                    "required": ["hypothesis"]
                }
            },
            {
                "name": "conclude_investigation",
                "description": "Mark the investigation as complete. Use when you've thoroughly analyzed the code.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "summary": {"type": "string", "description": "Summary of findings"}
                    },
                    "required": ["summary"]
                }
            },
            # META-AGENT: Dynamic Tool Creation
            {
                "name": "create_tool",
                "description": "AGI CAPABILITY: Create a new tool at runtime when you lack a needed capability. "
                              "Write Python code to define a custom analyzer, parser, or checker. "
                              "The tool will be immediately available for use. "
                              "Use this when: you need to parse a specific format, analyze a pattern not covered by existing tools, "
                              "or perform custom analysis logic.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "tool_name": {"type": "string", "description": "Unique name for the tool (snake_case, e.g., 'parse_jwt_token')"},
                        "description": {"type": "string", "description": "What the tool does"},
                        "tool_code": {
                            "type": "string",
                            "description": "Python code defining the tool. Must define a function with signature: "
                                          "def tool_name(params: dict, memory, source_code: str) -> ToolResult. "
                                          "Return ToolResult(success=True/False, output='...', findings=[...]). "
                                          "Available: re, json modules. Do NOT use os, subprocess, eval, exec."
                        },
                        "parameters_schema": {
                            "type": "object",
                            "description": "JSON schema for tool parameters (can be empty {})"
                        }
                    },
                    "required": ["tool_name", "description", "tool_code"]
                }
            }
        ]

    def get_all_tool_definitions(self) -> list[dict]:
        """Get all tool definitions including dynamically created tools."""
        return self.tool_definitions + self.dynamic_builder.get_tool_definitions()

    async def execute(self, tool_name: str, parameters: dict, memory: AgentMemory) -> ToolResult:
        """Execute a tool and return results."""
        # Built-in tools
        tool_map = {
            "scan_file": self._scan_file,
            "fuzz_function": self._fuzz_function,
            "read_code": self._read_code,
            "grep_pattern": self._grep_pattern,
            "analyze_function": self._analyze_function,
            "check_dependencies": self._check_dependencies,
            "report_vulnerability": self._report_vulnerability,
            "add_hypothesis": self._add_hypothesis,
            "conclude_investigation": self._conclude_investigation,
            "create_tool": self._create_tool,  # Meta-Agent capability
        }

        # Check if it's a built-in tool
        if tool_name in tool_map:
            try:
                return await tool_map[tool_name](parameters, memory)
            except Exception as e:
                return ToolResult(success=False, output=f"Tool error: {str(e)}")

        # Check if it's a dynamically created tool
        if self.dynamic_builder.has_tool(tool_name):
            return await self.dynamic_builder.execute_tool(
                tool_name, parameters, memory, self.source_code
            )

        return ToolResult(success=False, output=f"Unknown tool: {tool_name}")

    async def _create_tool(self, params: dict, memory: AgentMemory) -> ToolResult:
        """META-AGENT: Create a new tool at runtime."""
        tool_name = params.get("tool_name", "")
        description = params.get("description", "")
        tool_code = params.get("tool_code", "")
        parameters_schema = params.get("parameters_schema", {"type": "object", "properties": {}, "required": []})

        if not tool_name or not tool_code:
            return ToolResult(
                success=False,
                output="Missing required parameters: tool_name and tool_code are required"
            )

        # Create the tool via DynamicToolBuilder
        success, message = self.dynamic_builder.create_tool(
            tool_name=tool_name,
            tool_code=tool_code,
            description=description,
            parameters=parameters_schema
        )

        if success:
            # Log in memory
            memory.observations.append(f"[MetaAgent] Created new tool: {tool_name}")
            return ToolResult(
                success=True,
                output=f"🔧 Tool '{tool_name}' created successfully! You can now use it.\n"
                       f"Description: {description}\n"
                       f"Usage: Call '{tool_name}' with appropriate parameters.",
                suggested_next=[f"Use the new tool: {tool_name}"]
            )
        else:
            return ToolResult(
                success=False,
                output=f"Failed to create tool: {message}"
            )

    async def _scan_file(self, params: dict, memory: AgentMemory) -> ToolResult:
        """Run static security analysis."""
        findings = []
        suggested_next = []

        # Run static mirror analysis
        mirror_result = self.static_worker.analyze(self.source_code, "scan")
        for v in mirror_result.vulnerabilities:
            findings.append({
                "severity": v.severity.value,
                "category": v.category,
                "title": v.title,
                "description": v.description,
                "line": v.line_number
            })
            memory.add_finding(
                "scan_file", v.category, v.title,
                v.severity.value, v.description, v.line_number
            )
            if v.line_number:
                suggested_next.append(f"analyze_function at line {v.line_number}")

        # Run constraint breaker
        constraint_result = self.constraint_worker.analyze(self.source_code, "scan")
        for v in constraint_result.vulnerabilities:
            findings.append({
                "severity": v.severity.value,
                "category": v.category,
                "title": v.title,
                "description": v.description,
                "line": v.line_number
            })
            memory.add_finding(
                "scan_file", v.category, v.title,
                v.severity.value, v.description, v.line_number
            )

        output = f"Static analysis found {len(findings)} potential issues.\n"
        for f in findings[:5]:
            output += f"- [{f['severity']}] {f['title']}\n"
        if len(findings) > 5:
            output += f"... and {len(findings) - 5} more.\n"

        return ToolResult(
            success=True,
            output=output,
            findings=findings,
            suggested_next=suggested_next
        )

    async def _fuzz_function(self, params: dict, memory: AgentMemory) -> ToolResult:
        """Fuzz a specific function for edge cases."""
        func_name = params.get("function_name", "")
        memory.explored_functions.add(func_name)

        # Find the function in source
        func_pattern = rf"def\s+{re.escape(func_name)}\s*\("
        matches = list(re.finditer(func_pattern, self.source_code))

        if not matches:
            return ToolResult(
                success=False,
                output=f"Function '{func_name}' not found in source code."
            )

        findings = []
        output_parts = [f"Fuzzing function '{func_name}':"]

        for match in matches:
            line_num = self.source_code[:match.start()].count('\n') + 1

            # Get function body (simple extraction)
            func_start = match.start()
            func_body = self._extract_function_body(func_start)

            # Check for common issues in the function
            issues = self._analyze_function_security(func_name, func_body, line_num)

            for issue in issues:
                findings.append(issue)
                memory.add_finding(
                    "fuzz_function", issue['category'], issue['title'],
                    issue['severity'], issue['description'], issue.get('line')
                )
                output_parts.append(f"- [{issue['severity']}] {issue['title']}")

        if not findings:
            output_parts.append("No obvious vulnerabilities found, but manual review recommended.")

        return ToolResult(
            success=True,
            output="\n".join(output_parts),
            findings=findings
        )

    def _extract_function_body(self, start_pos: int) -> str:
        """Extract function body from start position."""
        # Find the end of the function (next def or class at same indentation)
        lines = self.source_code[start_pos:].split('\n')
        if not lines:
            return ""

        # Get the indentation of the def line
        first_line = lines[0]
        base_indent = len(first_line) - len(first_line.lstrip())

        body_lines = [first_line]
        for line in lines[1:]:
            if line.strip() == "":
                body_lines.append(line)
                continue
            current_indent = len(line) - len(line.lstrip())
            if current_indent <= base_indent and line.strip():
                break
            body_lines.append(line)

        return '\n'.join(body_lines[:50])  # Limit to 50 lines

    def _analyze_function_security(self, func_name: str, func_body: str, line_num: int) -> list[dict]:
        """Analyze a function for security issues."""
        issues = []

        # Check for dangerous patterns
        dangerous_patterns = [
            (r"eval\s*\(", "code_injection", "Dangerous eval() usage", "critical"),
            (r"exec\s*\(", "code_injection", "Dangerous exec() usage", "critical"),
            (r"subprocess\.\w+\([^)]*shell\s*=\s*True", "command_injection", "Shell injection risk", "high"),
            (r"os\.system\s*\(", "command_injection", "OS command execution", "high"),
            (r"pickle\.loads?\s*\(", "deserialization", "Unsafe deserialization", "high"),
            (r"yaml\.load\s*\([^)]*\)", "deserialization", "Unsafe YAML load (use safe_load)", "high"),
            (r"__import__\s*\(", "code_injection", "Dynamic import vulnerability", "medium"),
            (r"getattr\s*\([^)]*,\s*[^'\"][^)]*\)", "code_injection", "Dynamic attribute access", "medium"),
            (r"cursor\.execute\s*\([^)]*%", "sql_injection", "SQL string formatting", "high"),
            (r"f['\"].*SELECT.*\{", "sql_injection", "SQL f-string interpolation", "high"),
            (r"md5\s*\(|hashlib\.md5", "weak_crypto", "Weak MD5 hash", "medium"),
            (r"sha1\s*\(|hashlib\.sha1", "weak_crypto", "Weak SHA1 hash", "medium"),
            (r"random\.(random|randint|choice)", "weak_random", "Insecure random for crypto", "medium"),
            (r"password\s*=\s*['\"][^'\"]+['\"]", "hardcoded_secret", "Hardcoded password", "high"),
            (r"api_key\s*=\s*['\"][^'\"]+['\"]", "hardcoded_secret", "Hardcoded API key", "high"),
        ]

        for pattern, category, title, severity in dangerous_patterns:
            if re.search(pattern, func_body, re.IGNORECASE):
                # Find exact line
                for i, line in enumerate(func_body.split('\n')):
                    if re.search(pattern, line, re.IGNORECASE):
                        issues.append({
                            "severity": severity,
                            "category": category,
                            "title": f"{title} in {func_name}()",
                            "description": f"Found dangerous pattern in function {func_name}: {title}",
                            "line": line_num + i
                        })
                        break

        return issues

    async def _read_code(self, params: dict, memory: AgentMemory) -> ToolResult:
        """Read specific lines of code."""
        start = max(1, params.get("start_line", 1)) - 1
        end = min(len(self.source_lines), params.get("end_line", start + 20))

        lines = self.source_lines[start:end]
        output = f"Lines {start + 1}-{end}:\n"
        output += "\n".join(f"{i + start + 1}: {line}" for i, line in enumerate(lines))

        # Mark these lines as explored
        for i in range(start, end):
            memory.explored_lines.add(i + 1)

        return ToolResult(success=True, output=output)

    async def _grep_pattern(self, params: dict, memory: AgentMemory) -> ToolResult:
        """Search for a pattern in code."""
        pattern = params.get("pattern", "")
        memory.explored_patterns.add(pattern)

        try:
            regex = re.compile(pattern, re.IGNORECASE)
        except re.error as e:
            return ToolResult(success=False, output=f"Invalid regex: {e}")

        matches = []
        for i, line in enumerate(self.source_lines):
            if regex.search(line):
                matches.append(f"{i + 1}: {line.strip()}")

        if matches:
            output = f"Found {len(matches)} matches for '{pattern}':\n"
            output += "\n".join(matches[:10])
            if len(matches) > 10:
                output += f"\n... and {len(matches) - 10} more."
        else:
            output = f"No matches found for '{pattern}'."

        return ToolResult(success=True, output=output)

    async def _analyze_function(self, params: dict, memory: AgentMemory) -> ToolResult:
        """Deep analysis of a specific function."""
        func_name = params.get("function_name", "")
        memory.explored_functions.add(func_name)

        # Find function definition
        func_pattern = rf"def\s+{re.escape(func_name)}\s*\(([^)]*)\)"
        match = re.search(func_pattern, self.source_code)

        if not match:
            return ToolResult(
                success=False,
                output=f"Function '{func_name}' not found."
            )

        line_num = self.source_code[:match.start()].count('\n') + 1
        params_str = match.group(1)
        func_body = self._extract_function_body(match.start())

        analysis = [f"Analysis of {func_name}():"]
        analysis.append(f"  Location: line {line_num}")
        analysis.append(f"  Parameters: {params_str or 'none'}")

        # Analyze parameter usage
        param_names = [p.strip().split(':')[0].split('=')[0].strip()
                      for p in params_str.split(',') if p.strip()]

        dangerous_sinks = {
            'eval': 'code execution',
            'exec': 'code execution',
            'subprocess': 'command execution',
            'os.system': 'command execution',
            'cursor.execute': 'SQL query',
            '.execute': 'database query',
            'open': 'file access',
            'render': 'template rendering'
        }

        findings = []
        for param in param_names:
            if param in ('self', 'cls'):
                continue
            # Check if parameter flows to dangerous sink
            for sink, risk in dangerous_sinks.items():
                if re.search(rf"{sink}\s*\([^)]*{re.escape(param)}", func_body):
                    finding = {
                        "severity": "high",
                        "category": "taint_flow",
                        "title": f"Parameter '{param}' flows to {risk}",
                        "description": f"User-controlled parameter '{param}' may reach dangerous sink '{sink}'",
                        "line": line_num
                    }
                    findings.append(finding)
                    memory.add_finding("analyze_function", "taint_flow",
                                      finding["title"], "high", finding["description"], line_num)
                    analysis.append(f"  ⚠️ TAINT: {param} -> {sink} ({risk})")

        if not findings:
            analysis.append("  No obvious taint flows detected.")

        return ToolResult(
            success=True,
            output="\n".join(analysis),
            findings=findings
        )

    async def _check_dependencies(self, params: dict, memory: AgentMemory) -> ToolResult:
        """Analyze imports and dependencies."""
        dep_findings = analyze_dependencies(self.source_code)
        dep_vulns = findings_to_vulnerabilities(dep_findings)

        findings = []
        output_parts = ["Dependency analysis:"]

        for v in dep_vulns:
            findings.append(v)
            memory.add_finding("check_dependencies", v["category"], v["title"],
                             v["severity"], v["description"], v.get("line_number"))
            output_parts.append(f"- [{v['severity']}] {v['title']}")

        if not findings:
            output_parts.append("No dangerous dependencies detected.")

        return ToolResult(
            success=True,
            output="\n".join(output_parts),
            findings=findings
        )

    async def _report_vulnerability(self, params: dict, memory: AgentMemory) -> ToolResult:
        """Report a confirmed vulnerability."""
        memory.add_finding(
            tool="report_vulnerability",
            category=params.get("category", "unknown"),
            description=params.get("title", "Unknown vulnerability"),
            severity=params.get("severity", "medium"),
            evidence=params.get("description", ""),
            line=params.get("line_number")
        )

        return ToolResult(
            success=True,
            output=f"Vulnerability reported: {params.get('title')}",
            findings=[params]
        )

    async def _add_hypothesis(self, params: dict, memory: AgentMemory) -> ToolResult:
        """Add a hypothesis to investigate."""
        h_id = memory.add_hypothesis(params.get("hypothesis", ""))
        return ToolResult(
            success=True,
            output=f"Hypothesis {h_id} added: {params.get('hypothesis')}"
        )

    async def _conclude_investigation(self, params: dict, memory: AgentMemory) -> ToolResult:
        """Mark investigation as complete."""
        return ToolResult(
            success=True,
            output=f"Investigation concluded: {params.get('summary', 'Complete')}"
        )


# =============================================================================
# MCTS-BASED AGENT: Tree of Thoughts reasoning engine
# =============================================================================

class RedAgentV3:
    """
    AGI-Level Red Agent using MCTS (Monte Carlo Tree Search) / Tree of Thoughts.

    UPGRADE from ReAct: Instead of greedily picking the first good action,
    this agent SIMULATES multiple futures before committing:

    1. BRANCHES: Proposes 3 different strategic paths
    2. VALUATES: Scores each branch's potential (success probability)
    3. SELECTS: Picks the highest-value path using UCB1
    4. EXECUTES: Runs the selected action
    5. BACKPROPAGATES: Updates tree values based on actual results

    The agent maintains a search tree, allowing it to:
    - Remember unexplored branches for later
    - Learn which types of actions are most effective
    - Balance exploration vs exploitation
    """

    def __init__(
        self,
        config: "AttackConfig | None" = None,
        max_steps: int = 10,
        max_time_seconds: float = 60.0,
        model: str = None,
        use_mcts: bool = True,  # Enable MCTS by default
        mcts_branches: int = 2  # Number of branches to explore (2-3 recommended)
    ):
        # Support both old style (AttackConfig as first arg) and new style (kwargs)
        if config is not None:
            self.max_steps = max_steps  # Use provided or default
            self.max_time_seconds = config.max_total_time
            self.config = config
        else:
            self.max_steps = max_steps
            self.max_time_seconds = max_time_seconds
            self.config = None

        self.use_mcts = use_mcts
        self.mcts_branches = max(1, min(mcts_branches, 5))  # Clamp to reasonable range

        # Initialize LLM client
        if HAS_OPENAI:
            base_url = os.getenv("LLM_BASE_URL", os.getenv("OPENAI_BASE_URL"))
            self.client = AsyncOpenAI(
                api_key=os.getenv("LLM_API_KEY", os.getenv("OPENAI_API_KEY", "dummy")),
                base_url=base_url,
            )
            if model:
                self.model = model
            elif base_url is None or "openai.com" in (base_url or ""):
                self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            else:
                self.model = os.getenv("LLM_MODEL_NAME", "Qwen/Qwen2.5-Coder-32B-Instruct-AWQ")
        else:
            self.client = None
            self.model = None

        # Initialize MCTS planner (created per attack)
        self.mcts_planner: Optional[MCTSPlanner] = None

    async def attack(
        self,
        code: str,
        task_id: Optional[str] = None,
        task_description: str = ""
    ) -> RedAgentReport:
        """
        Main entry point - launch autonomous investigation with MCTS.

        The agent uses Tree of Thoughts to:
        1. Generate multiple possible paths
        2. Evaluate their potential
        3. Select and execute the best one
        4. Learn from results
        """
        start_time = time.time()

        # Initialize memory and tools
        memory = AgentMemory()
        memory.source_code = code  # Store for semantic analysis
        tools = ToolRegistry(code, task_description)

        # If no LLM available, fall back to static analysis only
        if not self.client:
            return await self._static_fallback(tools, memory, start_time)

        # Initialize MCTS planner for this attack
        if self.use_mcts:
            self.mcts_planner = MCTSPlanner(
                client=self.client,
                model=self.model,
                num_branches=self.mcts_branches,
                exploration_weight=1.414
            )
            print(f"[RedAgent] 🌳 Using MCTS/Tree of Thoughts with {self.mcts_planner.num_branches} branches")
        else:
            self.mcts_planner = None

        # Run the main loop
        concluded = False
        while memory.current_step < self.max_steps:
            elapsed = time.time() - start_time
            if elapsed >= self.max_time_seconds:
                break

            memory.current_step += 1

            try:
                # Choose action using MCTS or fallback to simple reasoning
                if self.use_mcts and self.mcts_planner:
                    action = await self.mcts_planner.plan_next_action(
                        memory, tools, task_description, code
                    )
                else:
                    action = await self._reason(memory, tools, task_description, code)

                if action is None:
                    break

                tool_name = action.get("tool")
                tool_params = action.get("parameters", {})

                # Check for conclusion
                if tool_name == "conclude_investigation":
                    concluded = True
                    break

                # ACT: Execute the chosen tool
                result = await tools.execute(tool_name, tool_params, memory)

                # OBSERVE: Record what happened
                memory.observations.append(f"Step {memory.current_step}: {tool_name} -> {result.output[:200]}")

                # BACKPROPAGATE: Update MCTS tree with actual results
                if self.use_mcts and self.mcts_planner:
                    findings_count = len(result.findings) if result.findings else 0
                    self.mcts_planner.record_result(
                        success=result.success,
                        findings_count=findings_count,
                        result_text=result.output[:200]
                    )

                # Check if we found something critical
                if memory.has_critical_finding() and memory.current_step >= 3:
                    break

            except Exception as e:
                memory.observations.append(f"Step {memory.current_step}: Error - {str(e)}")
                # Record failure in MCTS
                if self.use_mcts and self.mcts_planner:
                    self.mcts_planner.record_result(
                        success=False,
                        findings_count=0,
                        result_text=f"Error: {str(e)}"
                    )

        # Build final report
        return self._build_report(memory, time.time() - start_time)

    async def _reason(
        self,
        memory: AgentMemory,
        tools: ToolRegistry,
        task_description: str,
        code: str
    ) -> Optional[dict]:
        """
        REASONING phase: Decide what action to take next.

        The LLM analyzes the current state and chooses a tool to run.
        """
        # Build the prompt
        system_prompt = """You are an AGI-level security researcher conducting a penetration test.
Your goal is to find ALL security vulnerabilities in the provided code.

You have access to tools. In each step:
1. Review what you've found so far
2. Reason about what to investigate next
3. Choose ONE tool to run

Be thorough but efficient:
- Start with scan_file to get an overview
- Follow up on suspicious findings with targeted analysis
- Use grep_pattern to trace data flow
- Report vulnerabilities when you have evidence
- Conclude when you've thoroughly analyzed the code

## AGI CAPABILITY: Dynamic Tool Creation
If you need a capability that doesn't exist, you can CREATE A NEW TOOL using 'create_tool'.
Example scenarios:
- "I need to parse this custom binary format" → create a parser tool
- "I need to analyze this specific crypto pattern" → create a crypto analyzer
- "I need to check for a specific vulnerability type" → create a custom checker

When using create_tool, write Python code that:
- Defines a function: def tool_name(params, memory, source_code) -> ToolResult
- Returns ToolResult(success=True/False, output='...', findings=[...])
- Uses only: re, json modules (no os, subprocess, eval, exec)

IMPORTANT: Think like an attacker. Look for:
- Input validation issues
- Authentication/authorization flaws
- Injection vulnerabilities (SQL, command, code)
- Cryptographic weaknesses
- Business logic flaws
- Data exposure risks"""

        context = memory.get_context_summary()

        user_prompt = f"""## Task
{task_description or "Analyze this code for security vulnerabilities."}

## Code to Analyze (first 100 lines)
```python
{chr(10).join(code.split(chr(10))[:100])}
```

## Current Investigation State
{context}

## Step {memory.current_step} of {self.max_steps}

What should we investigate next? Choose a tool and explain your reasoning briefly."""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                # Include both built-in and dynamically created tools
                tools=[{"type": "function", "function": t} for t in tools.get_all_tool_definitions()],
                tool_choice="required",
                temperature=0.3,
            )

            message = response.choices[0].message

            if message.tool_calls:
                tool_call = message.tool_calls[0]
                return {
                    "tool": tool_call.function.name,
                    "parameters": json.loads(tool_call.function.arguments) if tool_call.function.arguments else {},
                    "reasoning": message.content or ""
                }

            return None

        except Exception as e:
            print(f"[RedAgentV3] LLM error: {e}")
            # Fall back to systematic analysis
            return self._fallback_action(memory)

    def _fallback_action(self, memory: AgentMemory) -> dict:
        """Fallback logic when LLM is unavailable."""
        if memory.current_step == 1:
            return {"tool": "scan_file", "parameters": {}, "reasoning": "Initial scan"}
        elif memory.current_step == 2:
            return {"tool": "check_dependencies", "parameters": {}, "reasoning": "Check imports"}
        else:
            return {"tool": "conclude_investigation", "parameters": {"summary": "Static analysis complete"}, "reasoning": "Done"}

    async def _static_fallback(
        self,
        tools: ToolRegistry,
        memory: AgentMemory,
        start_time: float
    ) -> RedAgentReport:
        """Fallback to static analysis when no LLM available."""
        # Run basic scans
        await tools.execute("scan_file", {}, memory)
        await tools.execute("check_dependencies", {}, memory)

        return self._build_report(memory, time.time() - start_time)

    def _build_report(self, memory: AgentMemory, elapsed_time: float) -> RedAgentReport:
        """Build the final attack report from memory."""
        vulnerabilities = []

        for finding in memory.findings:
            vulnerabilities.append(Vulnerability(
                severity=Severity(finding.severity),
                category=finding.category,
                title=finding.description,
                description=finding.evidence,
                line_number=finding.line_number,
                confidence="high" if finding.severity in ("critical", "high") else "medium"
            ))

        # Apply semantic filtering to remove false positives
        if vulnerabilities:
            vuln_dicts = [
                {
                    "severity": v.severity.value,
                    "category": v.category,
                    "title": v.title,
                    "description": v.description,
                    "line_number": v.line_number,
                    "confidence": v.confidence
                }
                for v in vulnerabilities
            ]

            # Use the actual source code for semantic analysis
            filtered_dicts, reasoning = analyze_with_semantics(
                memory.source_code,
                vuln_dicts
            )

            # Rebuild vulnerabilities from filtered list
            vulnerabilities = [
                Vulnerability(
                    severity=Severity(d["severity"]),
                    category=d["category"],
                    title=d["title"],
                    description=d["description"],
                    line_number=d.get("line_number"),
                    confidence=d.get("confidence", "medium")
                )
                for d in filtered_dicts
            ]

        # Sort by severity
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
        vulnerabilities.sort(key=lambda v: severity_order.get(v.severity.value, 5))

        # Build summary
        if vulnerabilities:
            counts = {}
            for v in vulnerabilities:
                counts[v.severity.value] = counts.get(v.severity.value, 0) + 1
            count_str = ", ".join(f"{c} {s.upper()}" for s, c in counts.items())
            summary = f"Found {len(vulnerabilities)} vulnerabilities ({count_str}) in {memory.current_step} steps ({elapsed_time:.1f}s)."
        else:
            summary = f"No vulnerabilities found after {memory.current_step} steps ({elapsed_time:.1f}s)."

        return RedAgentReport(
            attack_successful=len(vulnerabilities) > 0,
            vulnerabilities=vulnerabilities,
            attack_summary=summary
        )


# =============================================================================
# BACKWARDS COMPATIBILITY
# =============================================================================

# Keep old class name as alias
RedAgentV2 = RedAgentV3


@dataclass
class AttackConfig:
    """Configuration for attack (backwards compatibility)."""
    enable_smart_layer: bool = True
    enable_reflection: bool = True
    max_total_time: float = 60.0
    smart_layer_timeout: float = 30.0
    reflection_timeout: float = 20.0
    min_findings_for_skip_smart: int = 3


@dataclass
class AttackMetrics:
    """Metrics from attack (backwards compatibility)."""
    total_time_ms: float = 0.0
    static_time_ms: float = 0.0
    smart_time_ms: float = 0.0
    reflection_time_ms: float = 0.0
    static_findings: int = 0
    smart_findings: int = 0
    reflection_findings: int = 0
    layers_executed: list[str] = field(default_factory=list)


# Convenience function
async def attack_code(
    code: str,
    task_id: Optional[str] = None,
    task_description: str = ""
) -> RedAgentReport:
    """Convenience function for attacking code."""
    agent = RedAgentV3()
    return await agent.attack(code, task_id, task_description)
