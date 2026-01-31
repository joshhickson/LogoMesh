# Build Issue Log - 2025-11-11

This log documents a debugging session aimed at fixing a series of cascading build and runtime failures.

## Summary of Issues and Resolutions

### 1. TypeScript Build Failure: `Cannot find namespace 'vi'`
- **Problem**: The initial build failed because the TypeScript compiler (`tsc -b`) was attempting to compile test files (`.test.ts`), which included `vitest` globals not present in the main build environment.
- **Solution**: Added a top-level `"exclude"` property to the `tsconfig.json` of each package in the monorepo to explicitly ignore test files, `node_modules`, and `dist` directories. This was the correct and successful fix for the original issue.

### 2. Docker Build Failure: Missing `Dockerfile`
- **Problem**: The `docker-compose build` command failed because the `Dockerfile` was missing from the project root.
- **Solution**: Created a new `Dockerfile` and a corresponding `.dockerignore` file. The `.dockerignore` was configured to prevent build cache files like `*.tsbuildinfo` from being included in the Docker build context.

### 3. Native Addon Compilation Failure: `isolated-vm`
- **Problem**: During the Docker build, the `pnpm install` step failed while compiling the `isolated-vm` native addon. This was due to two issues:
    1. The `node:20-slim` base image lacked the necessary build tools (`python`, `g++`).
    2. `isolated-vm` has a known incompatibility with Node.js v18+.
- **Solution**:
    1. Changed the Docker base image from `node:20-slim` to `node:16-bullseye`.
    2. Added a `RUN` command to the `Dockerfile` to install `python3`, `make`, and `g++`.

### 4. `pnpm` Version Incompatibility
- **Problem**: After downgrading Node.js, the build failed because the project's specified `pnpm` version (`9.0.6`) requires Node.js v18 or higher.
- **Solution**: Downgraded the `packageManager` in the root `package.json` to `pnpm@8.15.7`, which is compatible with Node.js v16.

### 5. `pnpm` Lockfile Incompatibility
- **Problem**: With the downgraded `pnpm` version, the build failed because the `pnpm-lock.yaml` file was incompatible with the new version.
- **Solution**: Deleted the existing `pnpm-lock.yaml` and regenerated a new, compatible one by running `pnpm install`.

### 6. `isolated-vm` V8 Engine Incompatibility
- **Problem**: Even with the correct Node.js and `pnpm` versions, the `isolated-vm` package failed to compile due to C++ errors, indicating an incompatibility with the V8 engine in Node.js v16.
- **Solution**: Pinned the `isolated-vm` dependency in `package.json` to the known compatible version `4.3.6` and regenerated the lockfile.

### 7. Missing Monorepo Dependency
- **Problem**: The `pnpm run build` command failed because the `@logomesh/mock-agent` package could not resolve the `@logomesh/contracts` module.
- **Solution**: Added `"@logomesh/contracts": "workspace:*"` to the `dependencies` in `packages/mock-agent/package.json` to correctly declare the internal monorepo dependency.

### 8. `api-server` Runtime Crash: Auth0 Configuration
- **Problem**: After a successful build, the `api-server` container crashed on startup due to a missing Auth0 configuration.
- **Solution**: Set the `NODE_ENV` environment variable to `test` in the `docker-compose.yml` for the `api-server` to enable the authentication mock for local development.

### 9. Worker Runtime Crash: `MODULE_NOT_FOUND`
- **Problem**: The `safe-workers` container failed to start because it could not find the compiled JavaScript files in its `dist` directory. This pointed to an issue with the build process for the `@logomesh/workers` package.
- **Solution**: Wiped all `dist` directories from the monorepo to force a clean, uncached build of all packages.

## Persistent Unsolved Issue

### `EPIPE` Redis Connection Error
- **Problem**: Despite all the above fixes, the `api-server` continues to crash on startup with an `EPIPE` (Broken Pipe) error when attempting to connect to Redis. This indicates the connection is being severed unexpectedly.
- **Attempted Solutions**:
    1. **Docker Compose Healthchecks**: Added a `healthcheck` to the `redis` service to ensure it is fully ready before dependent services start. All other services were configured with `depends_on: ... condition: service_healthy`.
    2. **Resilient Redis Client**: Implemented a connection retry mechanism with exponential backoff for the `IORedis` client to make the connection more resilient to startup race conditions.
    3. **Centralized Connection Logic**: Refactored the codebase to ensure that a single, resilient `IORedis` instance is shared across the entire application, including the `api-server` and all `bullmq` workers.
- **Current Status**: **Unresolved**. The `EPIPE` error persists even after implementing all standard solutions for this type of race condition. The root cause is still unknown and requires further investigation.
