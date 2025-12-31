# Use Node.js 20 as the base for the "Polyglot" environment
# We need Node for the Sidecars/Workers and Python for the Agents.
FROM node:20-bookworm

# 1. Install Python 3.12 and uv
# Using python:3.12-bookworm image pattern or installing manually.
# Since we are based on debian bookworm, we can install python3.
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install uv (The Python Package Manager)
# Force install to /usr/local/bin so it's in the PATH for everyone
RUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sh

# 2. Setup Workspace
WORKDIR /app

# 3. Node.js Dependencies (Sidecars)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ packages/
# We need pnpm
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 4. Python Dependencies (Agents)
# Copy config files first
COPY pyproject.toml uv.lock README.md ./
# Sync dependencies
RUN uv sync --frozen

# 5. Copy Source Code
COPY src/ src/
COPY scenarios/ scenarios/
COPY main.py .

# 6. Runtime Configuration
# The entrypoint is handled by the CMD or ENTRYPOINT at runtime.
# Example: python3 main.py --role GREEN
CMD ["python3", "main.py", "--help"]
