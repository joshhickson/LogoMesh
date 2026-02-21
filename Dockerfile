# LogoMesh Agent Dockerfile
FROM python:3.11-bookworm

# Avoid interactive prompts during apt installs
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sh

# Setup workspace
WORKDIR /app

# Python dependencies
COPY pyproject.toml uv.lock README.md ./
RUN uv sync --frozen

# Copy source code
COPY src/ src/
COPY scenarios/ scenarios/
COPY main.py .

# Runtime configuration
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH="/app:/app/src"

# Default entrypoint
ENTRYPOINT ["python3", "main.py"]
CMD ["--help"]
