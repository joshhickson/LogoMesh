#!/bin/bash
MODEL="Qwen/Qwen2.5-Coder-32B-Instruct-AWQ"
sudo docker run -d --name purple-agent --network host \
  -v $(pwd)/main.py:/app/main.py \
  -e OPENAI_BASE_URL=http://localhost:8000/v1 \
  -e OPENAI_API_KEY=EMPTY \
  -e OPENAI_MODEL=$MODEL \
  polyglot-agent:latest \
  uv run python main.py --role PURPLE --host localhost --port 9001
