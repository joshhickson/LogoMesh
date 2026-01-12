---
status: DEPRECATED
type: Guide
superseded_by: docs/04-Operations/Intent-Log/Josh/20260110-Lambda-Tmux-Collaboration.md
---
> **Update Note (2026-01-10):**
> This guide lists manual `docker run` commands that are now **outdated**.
> Please refer to the **[Quick Start Scripts](../../Dual-Track-Arena/20260110-Quick-Start-Scripts.md)** for the latest one-command launch instructions.
>
> **Context:**
> *   [2026-01-01]: Step-by-step "Noob Guide" for connecting MacOS VS Code to Lambda Cloud (A100).

# Lambda Cloud "Noob Guide" (MacOS Edition)

## Executive Summary
This guide explains how to connect your local MacOS machine to a powerful **NVIDIA A100** server on Lambda Cloud using **VS Code Remote SSH**. This approach (The "Pro Way") makes the remote server feel exactly like your local computer, allowing you to use GitHub Copilot, edit files, and run terminals seamlessly.

---

## Phase 1: The Keys (MacOS)
You need an SSH Keypair (a digital "Passport") to enter the server.

1.  **Open Terminal:**
    *   Press `Cmd + Space` and search for **Terminal**.

2.  **Generate the Key:**
    *   Type the following command and press Enter:
        ```bash
        ssh-keygen -t ed25519 -C "josh@mac"
        ```
    *   Press **Enter** to accept the default file location.
    *   Press **Enter** twice to skip the passphrase (for convenience).

3.  **Copy Your Public Key:**
    *   Run this command to copy your "Public Key" (the part you give to Lambda) to your clipboard:
        ```bash
        pbcopy < ~/.ssh/id_ed25519.pub
        ```
    *   It is now in your clipboard, ready to paste.

---

## Phase 2: The Website (Rent the Machine)

1.  **Login:** Go to [lambdalabs.com](https://lambdalabs.com) and log in.
2.  **Add Your Key:**
    *   Go to **Settings** -> **SSH Keys**.
    *   Click **Add SSH Key**.
    *   Paste the key from your clipboard (`Cmd + V`). Name it "MacBook".
3.  **Launch Instance:**
    *   Go to **Instances** -> **Launch Instance**.
    *   Select **1x A100 (80GB)**. (Note: A100 is cheaper/more available than H100 and sufficient for our needs).
    *   **Region:** Choose the cheapest available (e.g., Texas or Utah).
    *   **Filesystem:** Don't attach a filesystem yet (keep it simple).
    *   Click **Launch**.
4.  **Wait & Copy IP:**
    *   Wait ~2-5 minutes until the status is **Running**.
    *   Copy the **IP Address** (e.g., `104.171.200.55`).

---

## Phase 3: The "Pro Way" (VS Code Remote)

This connects your VS Code directly to the server.

1.  **Install Extension:**
    *   In VS Code, go to the Extensions tab (Cube icon on the left).
    *   Search for **"Remote - SSH"** (by Microsoft).
    *   Install it.

2.  **Connect:**
    *   Click the **Green "><" Icon** in the very bottom-left corner of VS Code.
    *   Select **"Remote-SSH: Connect to Host..."** from the menu at the top.
    *   Select **"Add New SSH Host..."**.
    *   Type: `ssh ubuntu@<YOUR_LAMBDA_IP>` (Replace `<YOUR_LAMBDA_IP>` with the IP from the website).
    *   Press Enter. Select the configuration file (usually the first option).

3.  **Launch:**
    *   Click the Green "><" Icon again.
    *   Select **"Remote-SSH: Connect to Host..."**.
    *   Click the IP address you just added.
    *   **First Time Prompt:** A box will appear asking "Select OS". Choose **Linux**.
    *   **Fingerprint:** It may ask "Are you sure you want to continue?". Click **Continue**.

4.  **Success:**
    *   A new VS Code window will open.
    *   Look at the bottom left: It should say **"SSH: <YOUR_IP>"**.
    *   You are now coding *on the A100*.

---

## Phase 4: Using Copilot in the Terminal

Since you are using the "Pro Way," GitHub Copilot works directly on the remote machine.

1.  **Open the Remote Terminal:**
    *   Press `` Ctrl + ` `` (backtick) to open the terminal panel.
    *   Notice the prompt says `ubuntu@...` (You are on Linux!).

2.  **Ask Copilot for Help:**
    *   Click the **Copilot Chat** icon (Speech bubble) in the sidebar.
    *   You can now ask it to generate commands for the terminal.

    **Example Prompts:**
    *   *"@terminal How do I check if the NVIDIA drivers are working?"*
        *   (It will suggest `nvidia-smi`).
    *   *"@terminal How do I clone the repository https://github.com/agentbeats/agentbeats.git into a folder named 'arena'?"*
    *   *"@terminal How do I install Docker on this Ubuntu 22.04 machine?"*

3.  **Execute:**
    *   Copilot will give you a "Run in Terminal" button. Click it to execute the command on the A100.

---

## Phase 5: The Workflow (Operational Setup)

Now that you are connected, follow these exact steps to deploy the "Arena" stack (vLLM + Green Agent + Purple Agent).

> **Update:** The manual commands below are valid but cumbersome. It is recommended to use the **[Quick Start Scripts](../../Dual-Track-Arena/20260110-Quick-Start-Scripts.md)** instead.

### 1. Setup & Build
Run these commands in your VS Code terminal (connected to the A100):

```bash
# 1. Configure Docker to use the GPU (Critical Step!)
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# 2. Build the Unified Docker Image
# This builds 'polyglot-agent:latest' which contains all our code and dependencies.
docker build -t polyglot-agent:latest -f Dockerfile.gpu .
```

### 2. Launch the Infrastructure
We run 3 containers: One for the Brain (vLLM) and two for the Agents.

**Note:** The ports in the legacy commands below may be outdated. The new standard is Green Agent on **9000** and Purple on **9001**.

```bash
# 1. Launch vLLM (The Brain) - Port 8000
# Uses Qwen 2.5 Coder 32B. Takes ~2 mins to load.
sudo docker run --gpus all --network host --name vllm-server -d \
  polyglot-agent:latest \
  uv run vllm serve Qwen/Qwen2.5-Coder-32B-Instruct \
  --port 8000 --trust-remote-code --max-model-len 16384

# 2. Launch Green Agent (The Judge) - Port 9000
# Note: Ignores "NVIDIA Driver not detected" warning (it's CPU-only client).
sudo docker run -d --name green-agent --network host \
  -e OPENAI_BASE_URL=http://localhost:8000/v1 \
  -e OPENAI_API_KEY=EMPTY \
  -e MODEL_NAME=Qwen/Qwen2.5-Coder-32B-Instruct \
  polyglot-agent:latest \
  uv run python main.py --role GREEN --port 9000

# 3. Launch Rationale Worker (Contextual Debt Analysis)
# Analyzes reasoning traces using vLLM
sudo docker run -d --name rationale-worker --network host \
  -e LLM_API_BASE_URL=http://localhost:8000/v1 \
  -e LLM_API_KEY=EMPTY \
  -e LLM_MODEL_NAME=Qwen/Qwen2.5-Coder-32B-Instruct \
  polyglot-agent:latest \
  pnpm start:rationale

# 4. Launch Purple Agent (The Defender) - Port 9001
sudo docker run -d --name purple-agent --network host \
  -e OPENAI_BASE_URL=http://localhost:8000/v1 \
  -e OPENAI_API_KEY=EMPTY \
  -e OPENAI_MODEL=Qwen/Qwen2.5-Coder-32B-Instruct \
  polyglot-agent:latest \
  uv run python main.py --role PURPLE --host localhost --port 9001
```

### 3. Verify & Test
Check if everything is running:

```bash
# Check container status
sudo docker ps

# Check vLLM logs (Wait for "Application startup complete")
sudo docker logs vllm-server | tail -n 20
```

**Run a Battle (Iron Sharpens Iron):**
Trigger a test loop where Green challenges Purple.

```bash
curl -X POST http://localhost:9000/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{
    "battle_id": "test-001",
    "purple_agent_url": "http://localhost:9001"
  }'
```

### 4. Logs & Debugging
*   **Arena Logs:** Currently, battle results are printed to the Green Agent's console.
    *   View: `sudo docker logs green-agent`
*   **Purple Logic:** `sudo docker logs purple-agent`
*   **Model Errors:** `sudo docker logs vllm-server`

**Note:** When you are done, **Terminate the instance** on the Lambda website! You are charged by the hour ($1-$2/hr) as long as it is "Running," even if you close VS Code.
