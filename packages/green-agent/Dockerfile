# LogoMesh Green Agent Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY pyproject.toml .
COPY README.md .

# Install the package in editable mode
RUN pip install --no-cache-dir -e .

# Copy source code
COPY src/ src/
COPY agent_card.toml .
COPY scenario.toml .

# Copy vendor agentbeats (for local development without PyPI)
# In production, agentbeats would be installed from PyPI
COPY --from=vendor /agentbeats/src /vendor/agentbeats/src

# Set Python path to include vendor
ENV PYTHONPATH="/vendor/agentbeats/src:${PYTHONPATH}"

# Default environment variables
ENV LOGOMESH_SERVER_URL=http://api-server:3001
ENV MCP_SERVER_URL=http://mcp-server:9001/sse
ENV AGENT_PORT=9040

# Expose agent port
EXPOSE 9040

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9040/health || exit 1

# Run the green agent
CMD ["python", "-m", "logomesh_green.main"]
