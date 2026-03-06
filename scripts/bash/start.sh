#!/usr/bin/env bash
# LogoMesh — One-command startup script
# Usage: ./scripts/start.sh
#        or: make start

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

info()  { echo -e "${GREEN}[LogoMesh]${NC} $1"; }
warn()  { echo -e "${YELLOW}[LogoMesh]${NC} $1"; }
error() { echo -e "${RED}[LogoMesh]${NC} $1"; }

# ── 1. Check Python & uv ──────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
  error "Python 3 not found. Install it: https://www.python.org/downloads/"
  exit 1
fi

if ! command -v uv &>/dev/null; then
  info "Installing uv..."
  pip install uv
fi

# ── 2. Install dependencies ───────────────────────────────────────────
info "Syncing dependencies..."
uv sync --quiet

# ── 3. Check .env ─────────────────────────────────────────────────────
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    warn ".env created from .env.example — edit it to add your OPENAI_API_KEY"
  else
    warn "No .env file found. Create one with OPENAI_API_KEY=sk-..."
  fi
fi

if ! grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
  warn "OPENAI_API_KEY not set in .env — LLM calls will fail"
  warn "Edit .env and add your key, then re-run this script"
fi

# ── 4. Docker setup (automatic, best-effort) ─────────────────────────
DOCKER_OK=false

if command -v docker &>/dev/null; then
  # Check if Docker daemon is running
  if docker info &>/dev/null; then
    DOCKER_OK=true
  else
    info "Docker is installed but not running. Attempting to start..."

    # macOS: try to launch Docker Desktop
    if [[ "$OSTYPE" == "darwin"* ]]; then
      open -a Docker 2>/dev/null || true
      # Wait up to 30s for Docker to start
      for i in $(seq 1 30); do
        if docker info &>/dev/null; then
          DOCKER_OK=true
          break
        fi
        printf "."
        sleep 1
      done
      echo ""
    fi

    # Linux: try systemctl
    if [[ "$OSTYPE" == "linux-gnu"* ]] && ! $DOCKER_OK; then
      sudo systemctl start docker 2>/dev/null || true
      sleep 2
      if docker info &>/dev/null; then
        DOCKER_OK=true
      fi
    fi
  fi
else
  warn "Docker not installed. Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
fi

if $DOCKER_OK; then
  info "Docker is running ✓"

  # Build sandbox image if it doesn't exist
  if ! docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "logomesh-sandbox:latest"; then
    info "Building sandbox image (first time only, ~15s)..."
    docker build -t logomesh-sandbox:latest -f Dockerfile.sandbox . --quiet
    info "Sandbox image built ✓"
  else
    info "Sandbox image exists ✓"
  fi
else
  warn "Docker unavailable — tests will run in subprocess fallback mode (less isolated, still works)"
fi

# ── 5. Kill any existing agents on our ports ──────────────────────────
for port in 9009 9010; do
  pid=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pid" ]; then
    warn "Port $port in use (PID $pid) — stopping it"
    kill $pid 2>/dev/null || true
    sleep 1
  fi
done

# ── 6. Start agents ──────────────────────────────────────────────────
info "Starting Purple Agent on :9010..."
uv run main.py --role PURPLE --host 0.0.0.0 --port 9010 &
PURPLE_PID=$!

info "Starting Green Agent on :9009..."
uv run main.py --role GREEN --host 0.0.0.0 --port 9009 &
GREEN_PID=$!

# Wait for agents to be ready
info "Waiting for agents to start..."
for i in $(seq 1 30); do
  if curl -s http://localhost:9009/ &>/dev/null && curl -s http://localhost:9010/ &>/dev/null; then
    break
  fi
  sleep 1
done

echo ""
info "════════════════════════════════════════════════════"
info "  LogoMesh is ready! 🚀"
info "════════════════════════════════════════════════════"
info ""
info "  Green Agent (Judge):   http://localhost:9009"
info "  Purple Agent (AI):     http://localhost:9010"
if $DOCKER_OK; then
  info "  Sandbox:               Docker (isolated) ✓"
else
  info "  Sandbox:               subprocess (fallback)"
fi
info ""
info "  Send a task:"
info "    curl -X POST http://localhost:9009/actions/send_coding_task \\"
info "      -H 'Content-Type: application/json' \\"
info "      -d '{\"battle_id\": \"demo-001\", \"purple_agent_url\": \"http://localhost:9010/\", \"task_id\": \"task-004\"}'"
info ""
info "  Stop: make stop  (or kill $GREEN_PID $PURPLE_PID)"
info "════════════════════════════════════════════════════"

# Keep script alive so agents stay running
wait

