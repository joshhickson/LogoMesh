# Polyglot Dockerfile for AgentBeats Platform
# Base: Node.js 20 on Debian Bookworm
FROM node:20-bookworm

# Avoid interactive prompts during apt installs
ENV DEBIAN_FRONTEND=noninteractive

# 1. Install System Dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv (The Python Package Manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sh

# Install pnpm
RUN npm install -g pnpm

# 2. Setup Workspace
WORKDIR /app

# 3. Node.js Dependencies (Sidecars)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ packages/
RUN pnpm install --frozen-lockfile

# 4. Python Dependencies (Agents)
COPY pyproject.toml uv.lock README.md ./
# Sync dependencies
RUN uv sync --frozen

# 5. Copy Source Code
COPY src/ src/
COPY scenarios/ scenarios/
COPY main.py .

# 6. Runtime Configuration
# Ensure we use the virtual environment created by uv
ENV PATH="/app/.venv/bin:$PATH"

# Default Command
CMD ["python3", "main.py", "--help"]
