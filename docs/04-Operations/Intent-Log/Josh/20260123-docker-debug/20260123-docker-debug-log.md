---
status: ACTIVE
type: Log
---
> **Context:**
> *   2026-01-23: Debugging and patching Docker Compose workflow for green-agent local development and agentbeats-client integration. This log records all changes and findings up to this pause point.

# Docker Compose & Green-Agent Debug Log (2026-01-23)

## Key Changes Made

1. **Patched green_executor.py**
   - Added debug prints for request_text and parsing.
   - Added sys.exit(0) to stop after first request for easier log review.
   - Confirmed correct parsing of participants/config from message text.

2. **Dockerfile & Compose Fixes**
   - Switched green-agent in docker-compose.yml from remote image to local build using Dockerfile and local src/.
   - Added --role GREEN to green-agent command in docker-compose.yml.
   - Verified Dockerfile copies src/ to image.

3. **Rebuild & Run Process**
   - Used `docker compose build --no-cache green-agent` to force local build.
   - Used `docker compose up` to run containers and confirm local code is used.

4. **Validation**
   - Confirmed debug output from local code in green-agent logs.
   - Confirmed correct participants/config parsing.
   - Identified new issues: OpenAI API key error, agentbeats-client response validation errors.

## Next Steps (Paused)
- Fix OpenAI API key.
- Debug agentbeats-client response format.

---

## API Key, Leaderboard, and CI/CD Context (2026-01-23)

### Why does AgentBeats require an API key?
- **Bring-Your-Own-Key (BYOK) Model:** AgentBeats is designed for public, reproducible agent security competitions. It does not provide a shared API key for LLMs (like OpenAI, Gemini, etc.) for cost and security reasons.
- **Responsibility:** Each participant is responsible for providing their own API key (via environment variable or `.env` file) to run agents that require LLM access.
- **Security:** Keys should never be committed to public repos. They are injected at runtime via environment variables.

### Purpose of the Leaderboard and GitHub Action/Test/TOML
- **Leaderboard:** Used to rank agents based on their performance in security scenarios (e.g., how well the Green Agent scores Purple Agents).
- **GitHub Action/Test:** Automatically runs tests on submissions, ensuring that agents can be evaluated in a reproducible, automated way. This is critical for fair competition and for verifying that agents work as expected in a CI/CD environment.
- **TOML Scenario Files:** Define the configuration for each evaluation scenario (which agents, what endpoints, what tasks, etc.). Used by the test runner and the evaluation harness to orchestrate matches and collect results.

### How to Handle the API Key for Public Competitions
- **For CI/CD:**
  - Use GitHub Actions secrets to inject the API key at runtime (never hardcode).
  - Example:
    ```yaml
    env:
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    ```
- **For Local/Public Runs:**
  - Use a `.env` file or set the environment variable before running Docker Compose or scripts.
  - Example:
    ```
    export OPENAI_API_KEY=sk-...
    docker compose up
    ```
- **For True Public Demos:**
  - Consider using a free-tier or capped API key, or a local LLM (like Ollama) for demo purposes to avoid exposing a paid key.

### Summary
The API key is required because the competition framework is designed for reproducibility and fairness, not for subsidizing LLM costs. The leaderboard and GitHub Action/test/TOML setup ensure that all agents are evaluated in a consistent, automated, and secure way.

---

This log is datemarked 2026-01-23 and stored for reproducibility and future reference.
## Review of `docs\05-Competition\AgentBeats-SDK-Reference.md`

Based on the `AgentBeats-SDK-Reference.md` you provided and the official rules for the **AgentX-AgentBeats Competition (Fall 2025 - Winter 2026)**, here is an evaluation of the claims and a guide to the submission mechanics you discovered.

### **1. Evaluation of Document Claims vs. Competition Rules**

The provided SDK Reference is accurate but incomplete regarding the **deployment and submission** logistics required for the 2026 competition.

| Claim in Document | Status | Evaluation & Missing Context |
| --- | --- | --- |
| **"Green Agent is Orchestrator/Judge"** | **Accurate** | Confirmed. In the competition, Green Agents are not just code; they are **benchmarks**. Your Green Agent effectively becomes a "service" that evaluates other people's agents (Red/Blue/Purple). |
| **"Deployment: `OPENAI_API_KEY` env var"** | **Partial** | The document lists this as a requirement but misses the **security implementation**. You must not just set this locally; you must configure it as a **GitHub Secret** for the automated runners. |
| **"Agent Registration" (JSON snippet)** | **Outdated** | The document shows a raw JSON registration. The actual competition requires registration via the **AgentBeats Web UI** (`agentbeats.dev`) to generate the IDs and webhooks needed to link your repositories. |

---

### **2. Discovery: Submission & Infrastructure Mechanics**

To compete in the Custom Green Agent track (Deadline: Jan 31, 2026), you must manage three specific integration points that are not fully detailed in your SDK reference file.

#### **A. Handling LLM API Keys (The "Zero-Exposure" Rule)**

You must **never** commit `OPENAI_API_KEY` or other credentials to your `agent_card.toml` or source code.

* **Mechanism:** The competition infrastructure uses **GitHub Actions** to inject keys at runtime.
* **Action Required:**
1. Go to your GitHub Repository Settings → **Secrets and variables** → **Actions**.
2. Create a secret named `OPENAI_API_KEY`.
3. The platform's runner (or your custom GitHub Action) will inject this into the Docker container as an environment variable during the evaluation phase.


#### **B. Docker Builds & GitHub Hosting**

Your Green Agent is not submitted as raw Python code, but as a **built Docker image**.

* **Build Pipeline:** You should not build the image manually on your laptop and upload it. Instead, use a **GitHub Actions workflow** in your repository.
* **The Workflow:**
* Connect your GitHub repository to a registry (like Docker Hub or GitHub Container Registry).
* Configure a workflow (e.g., `.github/workflows/publish.yml`) that triggers on push to `main`.
* This workflow builds your image and pushes it to your registry.


* **Submission:** You submit the **Docker Image Reference** (e.g., `docker.io/username/my-green-agent:latest`) to the AgentBeats platform, not the code itself.

#### **C. Connecting Leaderboard Repo to Green Agent Repo**

This is the most critical step for "Custom Green Agent" participants. You essentially have two components: the **Agent** (logic) and the **Leaderboard** (orchestration config).

To ensure they cooperate:

1. **Register on Platform:** Register your Green Agent on `agentbeats.dev` to get a unique **Agent ID**.
2. **The Webhook Link:**
* The AgentBeats platform will provide a **Webhook URL** (looks like `https://agentbeats.dev/api/hook/v2/...`).
* You must add this Webhook URL to your **Leaderboard Repository's** GitHub settings (Settings → Webhooks).
* **Why?** When a new user (Purple Agent) submits to *your* benchmark, the platform triggers this webhook in your Leaderboard repo to start the evaluation job.


3. **Configuration:** In your Leaderboard repository's `scenario.toml` or env config, you must paste the **Green Agent ID** you generated in step 1. This tells the leaderboard *which* Docker image to spin up as the judge.

### **Summary of Workflow**

> **Build Agent** (Repo A)  **Docker Hub**  **AgentBeats Platform**  **Leaderboard Config** (Repo B)


[AgentBeats Developer Platform Tutorial](docs\05-Competition\AgentX-AgentBeats Developer Platform Tutorial.txt)
This video transcript is relevant because it provides a visual walkthrough of the AgentBeats platform, explicitly demonstrating the registration process and how the "assessment runs as an agent" concept works in practice. (See <attachments> above for file contents. You may not need to search or read the file again.)
