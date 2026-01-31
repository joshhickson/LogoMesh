---
status: ACTIVE
type: Guide
---
> **Context:**
> *   [2026-01-03]: Instructions for recovering the environment after terminating the ephemeral H100 instance.

# H100 Instance Restart & Recovery Guide

**CRITICAL WARNING:**
You are using an ephemeral Lambda instance without a persistent filesystem.
**When you "Shut Down" or "Terminate" this instance, EVERYTHING on it is deleted.**
(Docker images, code changes, logs, etc.)

To resume work next time, you must treat it as a fresh start.

## Step 0: SAVE YOUR WORK (Do this NOW)
Before you shut down today, you **MUST** push your changes to GitHub, or they will be lost forever.

```bash
git add .
git commit -m "feat: operational H100 environment with green/purple agents"
git push
```

---

## Step 1: The Re-Launch (Next Session)
1.  Go to Lambda Labs dashboard.
2.  Launch a new **H100** instance.
3.  Copy the new IP address.
4.  Update your VS Code "Remote SSH" config with the new IP.
5.  Connect via VS Code.

## Step 2: The One-Shot Restore
Once connected to the new instance, paste this entire block into the terminal. It will:
1.  Clone your repo.
2.  Setup Nvidia Drivers & Docker.
3.  Build the Agent Image.
4.  Launch the entire Arena stack.

```bash
# 1. Clone (You may need to sign in to GitHub if it's private)
git clone https://github.com/joshhickson/LogoMesh.git
cd LogoMesh

# 2. Configure Drivers
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# 3. Build Image (Takes ~3-5 mins)
docker build -t polyglot-agent:latest -f Dockerfile.gpu .

# 4. Launch vLLM (Takes ~2 mins to load model)
sudo docker run --gpus all --network host --name vllm-server -d \
  polyglot-agent:latest \
  uv run vllm serve Qwen/Qwen2.5-Coder-32B-Instruct \
  --port 8000 --trust-remote-code --max-model-len 16384

# 5. Launch Agents
sudo docker run -d --name green-agent --network host \
  -e OPENAI_BASE_URL=http://localhost:8000/v1 \
  -e OPENAI_API_KEY=EMPTY \
  -e MODEL_NAME=Qwen/Qwen2.5-Coder-32B-Instruct \
  polyglot-agent:latest \
  uv run python main.py --role GREEN --port 9000

sudo docker run -d --name purple-agent --network host \
  -e OPENAI_BASE_URL=http://localhost:8000/v1 \
  -e OPENAI_API_KEY=EMPTY \
  -e OPENAI_MODEL=Qwen/Qwen2.5-Coder-32B-Instruct \
  polyglot-agent:latest \
  uv run python main.py --role PURPLE --host localhost --port 9001
```

## Step 3: Verify
Wait about 2 minutes for the model to load, then run:
```bash
sudo docker logs vllm-server | tail -n 20
```
When you see "Application startup complete", you are back in business!
