.PHONY: setup test run-green run-purple run-red docker-build lint clean

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

# Run all agents via Docker Compose
docker-up:
	docker compose -f docker-compose.agents.yml up --build

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
