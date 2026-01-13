#!/bin/bash
# Helper script to run the AdAttack scenario (Lambda Track)

# Ensure uv is installed
if ! command -v uv &> /dev/null; then
    echo "Error: 'uv' is not installed. Please install it first."
    exit 1
fi

echo "Running AdAttack Scenario..."
echo "Command: uv run agentbeats-run scenarios/security_arena/submissions/logomesh/ad_attack/scenario_ad_attack.toml"

uv run agentbeats-run scenarios/security_arena/submissions/logomesh/ad_attack/scenario_ad_attack.toml
