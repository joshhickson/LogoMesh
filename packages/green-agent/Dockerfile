# LogoMesh Green Agent Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install agentbeats from GitHub (or PyPI when available)
RUN pip install --no-cache-dir \
    git+https://github.com/agentbeats/agentbeats.git \
    httpx>=0.27.0 \
    pydantic>=2.0.0

# Copy source code
COPY src/ src/
COPY agent_card.toml .
COPY scenario.toml .
COPY pyproject.toml .
COPY README.md .

# Install the package
RUN pip install --no-cache-dir -e .

# Default environment variables
ENV LOGOMESH_SERVER_URL=http://api-server:3001
ENV AGENTBEATS_BACKEND_URL=http://localhost:9000
ENV AGENT_PORT=9040

# Expose agent port
EXPOSE 9040

# Run the green agent
CMD ["python", "-m", "logomesh_green.main"]
