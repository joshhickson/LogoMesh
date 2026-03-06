.PHONY: setup start stop test run-green run-purple run-red docker-build docker-up docker-down lint clean

# One-command setup + launch (handles Docker, deps, and agents)
start:
	@bash scripts/bash/start.sh

# Stop all running LogoMesh agents
stop:
	@echo "[LogoMesh] Stopping agents..."
	@lsof -ti :9009 | xargs kill 2>/dev/null || true
	@lsof -ti :9010 | xargs kill 2>/dev/null || true
	@echo "[LogoMesh] Stopped ✓"

# Install dependencies
setup:
	pip install uv && uv sync
	cp -n .env.example .env 2>/dev/null || true

# Run agents
run-green:
	uv run main.py --role GREEN --host 0.0.0.0 --port 9009

run-purple:
	uv run main.py --role PURPLE --host 0.0.0.0 --port 9010

run-red:
	uv run main.py --role RED --host 0.0.0.0 --port 9021

# Build sandbox Docker image (required for test execution)
docker-build:
	docker build -f Dockerfile.sandbox -t logomesh-sandbox:latest .

# Run all agents via Docker Compose (no Python needed — just Docker)
docker-up:
	docker compose -f docker-compose.agents.yml build sandbox 2>/dev/null || true
	docker compose -f docker-compose.agents.yml up --build green purple

docker-down:
	docker compose -f docker-compose.agents.yml down

# Run tests
test:
	uv run pytest tests/ -v

# Lint
lint:
	uv run mypy src/ --ignore-missing-imports

# Clean build artifacts
clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .mypy_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
