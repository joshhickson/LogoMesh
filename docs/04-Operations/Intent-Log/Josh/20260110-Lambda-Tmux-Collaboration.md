---
status: ACTIVE
type: Guide
---
> **Context:**
> *   [2026-01-10]: Collaborative "Team Edition" of the Lambda Guide, replacing the solo workflow with a `tmux` shared session.

# Lambda Cloud "Team Edition" (Tmux Collaboration)

## Executive Summary
This guide explains how to set up a collaborative coding session on a **Lambda Cloud A100** instance. Unlike the "Noob Guide" (solo play), this workflow allows the Team Lead (Host) and Team Members to connect to the *exact same terminal session* simultaneously using `tmux`.

**The Goal:** One computer, multiple pilots. When Josh types, everyone sees it. When Alaa types, everyone sees it.

---

## Phase 1: Prerequisites (Everyone)
Before the session starts, every team member needs an SSH Keypair.

1.  **Generate Your Key (If you haven't already):**
    *   **Windows (PowerShell):** `ssh-keygen -t ed25519 -C "yourname@windows"`
    *   **Mac/Linux (Terminal):** `ssh-keygen -t ed25519 -C "yourname@mac"`
    *   *Press Enter to accept defaults and no passphrase.*

2.  **Get Your Public Key:**
    *   You must send your **Public Key** string to the Host (Josh).
    *   **Windows:** `type $env:USERPROFILE\.ssh\id_ed25519.pub`
    *   **Mac/Linux:** `cat ~/.ssh/id_ed25519.pub`

---

## Phase 2: The Host Setup (Josh)
The Host rents the machine and prepares the "Lobby".

1.  **Launch Instance:**
    *   Go to [lambdalabs.com](https://lambdalabs.com).
    *   Launch an **A100 (40GB)** instance using your primary SSH key.
    *   Copy the **IP Address**.

2.  **Connect:**
    *   Connect via VS Code (Remote-SSH) or Terminal: `ssh ubuntu@<IP_ADDRESS>`

3.  **Install Tmux (The Magic):**
    *   The instance might not have `tmux` installed by default. Run this immediately:
    ```bash
    sudo apt-get update && sudo apt-get install tmux -y
    ```

---

## Phase 3: The Team Access (The Handshake)
**Crucial Step:** By default, only the Host can enter. The Host must manually invite the team by adding their public keys.

1.  **Host Actions:**
    *   Open the "authorized keys" file on the server:
        ```bash
        nano ~/.ssh/authorized_keys
        ```
    *   **Paste** each team member's Public Key on a new line.
    *   Press `Ctrl+O` -> `Enter` to save.
    *   Press `Ctrl+X` to exit.

2.  **Verification:**
    *   Tell your team: *"The door is open. IP is `<IP_ADDRESS>`."*
    *   Team members should now be able to `ssh ubuntu@<IP_ADDRESS>` successfully.

---

## Phase 4: The Shared Brain (Tmux)

> **CRUCIAL CONSTRAINT:** All team members MUST be logged in as the same system user (`ubuntu`) for this to work easily. Do not create separate users.

### 1. The Host Starts the Session
The Host creates a named session (the "Arena"):

```bash
# Host runs this FIRST
tmux new -s agent_arena
```

*   You are now inside the multiplexer. It looks like a normal terminal with a green bar at the bottom.

### 2. The Team Joins the Session
Team members SSH in, then "attach" to the Host's session:

```bash
# Team members run this AFTER SSH-ing in
tmux attach -t agent_arena
```

*   **Magic:** You should now see exactly what the Host sees. If the Host types `ls`, you see `ls`.
*   **Etiquette:** Only one person should type at a time to avoid chaos.

---

## Phase 5: The Workflow (Execution)

Perform these actions **inside the `agent_arena` tmux session**.

### 1. Setup & Launch
We now use a unified script to handle building the Docker image and launching the arena (vLLM + Green Agent + Purple Agent).

> **CRITICAL:** Use the **AWQ** quantized model to avoid Out-of-Memory (OOM) errors on 40GB A100s. The script handles this if configured or modified, but be aware of the `Qwen/Qwen2.5-Coder-32B-Instruct-AWQ` requirement.

```bash
# 1. Run the Launch Script
# This builds the image (if missing), removes old containers, and starts vLLM, Green Agent, and Purple Agent.
sudo ./scripts/bash/launch_arena.sh

# 2. Wait for vLLM
# Watch the logs until you see "Application startup complete"
sudo docker logs -f vllm-server
```

The script sets up:
*   **vLLM (Brain):** Port 8000
*   **Green Agent (Judge):** Port 9000
*   **Purple Agent (Defender):** Port 9001

### 2. Monitoring (Split Panes)
This is where `tmux` shines. You can split your screen to see logs while running commands.

*   **Split Horizontally:** Press `Ctrl+B`, then `"` (Shift + ').
*   **Switch Panes:** Press `Ctrl+B`, then Arrow Keys.

**Suggested Layout:**
*   **Top Pane:** Interactive Terminal (for running `curl` tests).
*   **Bottom Pane:** Logs (`sudo docker logs -f green-agent`).

---

## Phase 6: Port Forwarding (Seeing the UI)

Each team member must set up **their own** Port Forwarding in VS Code if they want to see the web interfaces locally. This is unique to each person's computer!

1.  In VS Code, open the **PORTS** tab.
2.  Add **8000** (vLLM) - Optional.
3.  Add **9000** (Green Agent) - To see the API.

---

## Phase 7: Using Copilot (For the Host)

**Note:** While everyone can type in the terminal, **GitHub Copilot** integration in VS Code is specific to the person connected.
*   If **Josh** (Host) triggers a Copilot suggestion in the terminal, it pastes text into the `tmux` session.
*   **Everyone** will see that text appear!
*   It is recommended that the **Host** "drives" the Copilot interactions to avoid confusion, while the Team provides verbal prompts.
