> **Status:** ACTIVE
> **Type:** Guide
> **Context:**
> *   [2026-01-01]: Step-by-step "Noob Guide" for connecting Windows 10 VS Code to Lambda Cloud (A100).

# Lambda Cloud "Noob Guide" (Windows 10 Edition)

## Executive Summary
This guide explains how to connect your local Windows 10 machine to a powerful **NVIDIA A100** server on Lambda Cloud using **VS Code Remote SSH**. This approach (The "Pro Way") makes the remote server feel exactly like your local computer, allowing you to use GitHub Copilot, edit files, and run terminals seamlessly.

---

## Phase 1: The Keys (Windows 10)
You need an SSH Keypair (a digital "Passport") to enter the server.

1.  **Open PowerShell:**
    *   Press `Win + X` and select **Windows PowerShell**.

2.  **Generate the Key:**
    *   Type the following command and press Enter:
        ```powershell
        ssh-keygen -t ed25519 -C "josh@windows"
        ```
    *   Press **Enter** to accept the default file location.
    *   Press **Enter** twice to skip the passphrase (for convenience).

3.  **Copy Your Public Key:**
    *   Run this command to display your "Public Key" (the part you give to Lambda):
        ```powershell
        type $env:USERPROFILE\.ssh\id_ed25519.pub
        ```
    *   **Copy** the entire output string (starts with `ssh-ed25519` and ends with `josh@windows`).

---

## Phase 2: The Website (Rent the Machine)

1.  **Login:** Go to [lambdalabs.com](https://lambdalabs.com) and log in.
2.  **Add Your Key:**
    *   Go to **Settings** -> **SSH Keys**.
    *   Click **Add SSH Key**.
    *   Paste the key you copied from PowerShell. Name it "Windows Laptop".
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
    *   Press `Ctrl + ~` (tilde) to open the terminal panel.
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

## Phase 5: The Workflow (What to do next)

Now that you are connected, follow the [Lambda Test Protocol](20260101-Lambda-Test-Protocol.md):

1.  **Clone the Repo:** (Ask Copilot if you forget the command).
2.  **Install Docker:** (The A100 usually comes with it, but verify with `docker --version`).
3.  **Build the Image:** `docker build -f Dockerfile.gpu ...`
4.  **Run the Agent:** `docker run --gpus all ...`

**Note:** When you are done, **Terminate the instance** on the Lambda website! You are charged by the hour ($1-$2/hr) as long as it is "Running," even if you close VS Code.
