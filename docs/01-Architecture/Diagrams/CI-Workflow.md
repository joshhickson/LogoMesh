# CI: Docker Compose End-to-End Workflow

This document explains the purpose and implementation of a CI job that runs the project's full Docker Compose end-to-end (E2E) flow. It is written for readers who are new to CI and Docker Compose.

## Goal
Run the full application stack (API, workers, Redis, and the `e2e-tester`) in CI and fail the job if the E2E test fails. This gives fast feedback on pull requests and prevents regressions that only surface when multiple services interact.

## What the workflow does (plain language)
- Checks out the repo.
- Builds required Docker images for the services defined in `docker-compose.yml`.
- Starts the stack with Docker Compose in a mode that will stop when the `e2e-tester` container exits and return its exit code as the job result.
- Collects logs and uploads them as artifacts for debugging if the job fails.

## Why this is useful
- Runs the same integration scenario that you run locally with `docker compose up --build`.
- Detects start-up and integration issues (like the Redis EPIPE race) on CI before merging changes.
- Makes it simpler to track regressions across the whole system instead of only unit-level checks.

## Recommended Runner and prerequisites
- Use a Linux runner (e.g., GitHub Actions `ubuntu-latest`) which includes Docker and the Docker Compose plugin.
- Ensure job timeout is large enough to allow building images (20–30 minutes recommended for first runs).
- If your build requires secrets (API keys, tokens), add them via encrypted CI secrets (do not check them into source).

## Important flags and behavior
- `--abort-on-container-exit` combined with `--exit-code-from <service>`: starts all services but returns the exit code from the named service when it exits. This is perfect when you have a test runner service (like `e2e-tester`) that runs, asserts, and exits.
- Use `docker compose logs` and `actions/upload-artifact` to preserve logs for post-failure analysis.

## Example GitHub Actions workflow
Put this in `.github/workflows/e2e-compose.yml` (adapt to your repository needs):

```yaml
name: CI — Compose E2E

on:
  push:
  pull_request:

jobs:
  compose-e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx (optional)
        uses: docker/setup-buildx-action@v2

      - name: Build and run Compose e2e
        run: |
          # Build images with verbose output to help debugging
          docker compose build --progress=plain

          # Run compose and return the exit code from the e2e-tester service
          docker compose up --build --abort-on-container-exit --exit-code-from e2e-tester

      - name: Collect compose logs
        if: always()
        run: |
          docker compose logs --no-color --tail 1000 > compose-logs.txt || true

      - name: Upload logs artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: compose-logs
          path: compose-logs.txt
```

### How this maps to the repository
- `docker compose build` builds images described by `Dockerfile` and local context (e.g., `Dockerfile` in repo root and `docker-redis/Dockerfile`).
- `docker compose up --abort-on-container-exit --exit-code-from e2e-tester` starts the network of containers and returns the `e2e-tester` exit code as the job result. If `e2e-tester` exits `0`, the job passes.

## Artifacts and debugging
- Always upload logs on failure. The `compose-logs.txt` will show the recent output of all services.
- If images are large or build is slow, consider caching dependencies (for Node: pnpm cache/artifact caches) or hosting pre-built images in a registry.

## Security and secrets
- Do not embed secrets in the workflow YAML. Use repository or organization secrets.
- If your tests need Auth0 or other tokens, add them as encrypted secrets and reference them in `env:` or `with:` blocks.

## Performance tips
- Use `docker/setup-buildx-action` + buildx cache for faster repeated builds between CI runs.
- Consider splitting heavy builder steps into separate jobs to reuse artifacts.
- If builds are still too slow, you can build and push images to a private registry and have CI pull them (tradeoffs apply).

## Troubleshooting common issues
- Docker not found on runner: use `ubuntu-latest` or add a Docker setup step.
- `EPIPE` or connection errors: ensure services are healthy before tests run. Your compose file can include `depends_on` health checks (but note: `depends_on` health condition works differently across Compose versions). The exit-code-from approach is robust because the test runner itself will fail the job if it cannot reach required services.
- Windows-specific line endings: if your repo contains scripts that run inside Linux containers (entrypoints), ensure they have LF line endings. You can add `RUN sed -i 's/\r$//' /path/to/script` in Dockerfiles.

## Extending the workflow
- Add `actions/cache` or pnpm-specific caching to speed up `pnpm install` inside images.
- Add a `matrix` to run on multiple Node versions if needed.
- Add an `on: schedule:` trigger if you want nightly regression tests.

## Next steps
- Create `.github/workflows/e2e-compose.yml` and open a PR for your review.
- Add caching for `pnpm` in the Docker build to speed CI.
- Add a status badge to the README to show CI health.
