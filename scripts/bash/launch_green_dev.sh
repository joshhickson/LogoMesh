#!/bin/bash
MODEL="Qwen/Qwen2.5-Coder-32B-Instruct-AWQ"
sudo docker run -d --name green-agent --network host \
  -v /home/ubuntu/.cache/huggingface:/root/.cache/huggingface \
  -v $(pwd)/src:/app/src \
  -e OPENAI_BASE_URL=http://localhost:8000/v1 \
  -e OPENAI_API_KEY=EMPTY \
  -e MODEL_NAME=$MODEL \
  -v $(pwd)/data:/app/data \
  -v /var/run/docker.sock:/var/run/docker.sock \
  polyglot-agent:latest \
  uv run python main.py --role GREEN --port 9000
