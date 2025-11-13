# Docker Build Failure Analysis Log - 2025-11-08

## 1. Executive Summary

This document details a persistent and critical Docker build failure encountered on November 8, 2025. Despite multiple corrective actions, including ensuring correct configuration files and running cache-busting build commands, the build consistently fails with a TypeScript error: `error TS2503: Cannot find namespace 'vi'`.

The root cause appears to be a discrepancy between the local filesystem and the build context being used by the Docker daemon. The corrected configuration files, which would resolve the TypeScript error, are not being included in the build, even when a `--no-cache` build is initiated.

## 2. Timeline of Events

1.  **Initial Failure:** The Docker build process, triggered via `sudo docker compose up --build e2e-tester`, first failed with the `TS2503` error.
2.  **First Correction Attempt:** I identified the cause as a missing `vitest/globals` type definition in `packages/core/tsconfig.json` and a missing `vitest` dev dependency in `packages/core/package.json`. I applied these fixes.
3.  **Persistent Failures:** Subsequent builds, including those using `sudo docker-compose build --no-cache` and `sudo docker compose build --no-cache`, continued to fail with the exact same error.
4.  **File Verification:** I repeatedly verified the contents of `packages/core/package.json` and `packages/core/tsconfig.json` on the local filesystem. The files were confirmed to be correct.
5.  **`.dockerignore` Investigation:** I hypothesized that a `.dockerignore` file might be incorrectly excluding the configuration files from the build context. A check revealed that no `.dockerignore` file exists in the repository root.
6.  **Conclusion:** The failure is not due to incorrect source files or the Docker cache in the conventional sense. The problem lies in the build context not receiving the updated files.

## 3. Root Cause Analysis

The core issue is that the Docker build process is not using the corrected versions of `package.json` and `tsconfig.json` from the `packages/core` directory.

-   **Evidence:** The build fails with a TypeScript error that is directly resolved by the changes made to `tsconfig.json`. The local files are verified to be correct.
-   **Hypothesis:** The `COPY . .` command in the `Dockerfile` is not correctly copying the project files. This could be due to a subtle issue with the filesystem, file permissions, or an obscure Docker daemon behavior. The lack of a `.dockerignore` file makes the build context very large, which might contribute to the problem, but does not explain why specific updated files are ignored.

## 4. Final Verified State of Configuration Files

For the record, here are the contents of the relevant files, which have been confirmed to be correct on the local disk.

**`packages/core/package.json`**
```json
{
  "name": "@logomesh/core",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "clean": "rm -rf dist",
    "build": "tsc -b",
    "test": "vitest"
  },
  "dependencies": {
    "@logomesh/contracts": "workspace:*",
    "escomplex": "2.0.0-alpha",
    "sqlite": "^5.1.1",
    "sqlite3": "^5.1.7",
    "ulid": "^3.0.1"
  },
  "devDependencies": {
    "@types/sqlite3": "^5.1.0",
    "vitest": "^1.6.0"
  }
}
```

**`packages/core/tsconfig.json`**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*.ts"],
  "references": [
    { "path": "../contracts" }
  ]
}
```

This log provides a complete record of the issue. Further investigation should focus on the Docker build context and the file copying process.
