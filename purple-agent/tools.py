"""
Purple Agent Tools

The purple agent (coding assessee) primarily uses its LLM capabilities
to solve coding tasks. No custom tools are required - the agent responds
directly with JSON containing sourceCode, testCode, and rationale.
"""

import agentbeats as ab

# No custom tools needed - the agent responds directly to coding challenges
# The LLM will generate the JSON response based on the prompt in agent_card.toml
