#!/bin/bash

curl -X POST http://localhost:9000/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{
    "battle_id": "test-battle-001",
    "purple_agent_url": "http://localhost:9001",
    "red_agent_url": "http://localhost:9021"
  }'