# Monorepo Build Orchestration Failure - Detailed Log

## 1. High-Level Summary

This document details a persistent and perplexing build failure within the `pnpm` monorepo. The core issue is a race condition: packages are being compiled before their internal workspace dependencies have been successfully built. This results in TypeScript compiler errors because it cannot find the necessary modules or type declarations.

This is a classic monorepo build-order problem. However, every standard, industry-accepted solution has failed to resolve it, suggesting a subtle, environment-specific issue.

## 2. The Core Error

The consistent error message is:
**`error TS2307: Cannot find module '@logomesh/contracts' or its corresponding type declarations.`**

This error is thrown when the TypeScript compiler (`tsc`) attempts to build the `@logomesh/core` and `@logomesh/server` packages, both of which import code from `@logomesh/contracts`.

## 3. Required Build Order

The dependency graph is straightforward:
1.  `@logomesh/contracts` (No internal dependencies)
2.  `@logomesh/core` (Depends on `@logomesh/contracts`)
3.  `@logomesh/server` (Depends on `@logomesh/core` and `@logomesh/contracts`)

## 4. Summary of Attempted Solutions

The following is a chronological summary of the solutions that have been attempted.

### Attempt 1: Explicit Workspace Dependencies

*   **Hypothesis:** `pnpm` was not aware of the dependency graph.
*   **Action:** Added explicit dependencies to the `package.json` files of the consumer packages using the `workspace:*` protocol.
    *   `packages/core/package.json`: `"dependencies": { "@logomesh/contracts": "workspace:*" }`
    *   `packages/server/package.json`: `"dependencies": { "@logomesh/contracts": "workspace:*" }`
*   **Result:** **Failure.** The `pnpm --recursive run build` command still attempted to build all packages in parallel, and the race condition persisted.

### Attempt 2: Forcing a Sequential Build

*   **Hypothesis:** `pnpm`'s parallel execution was the problem. Forcing a sequential build should respect the (now explicit) dependency graph.
*   **Action:** Modified the root `package.json` build script to `pnpm --recursive --workspace-concurrency=1 run build`.
*   **Result:** **Failure.** Inexplicably, the build logs showed that `pnpm` was still not executing the package builds in the correct topological order, even with concurrency set to 1.

### Attempt 3: Implementing Turborepo

*   **Hypothesis:** `pnpm`'s native script runner is unreliable for this environment. A dedicated build orchestrator is needed.
*   **Action:**
    1.  Added `turbo` as a root-level dev dependency.
    2.  Created a `turbo.json` file with a build pipeline: `"build": { "dependsOn": ["^build"] }`.
    3.  Updated the root `package.json` build script to `turbo run build`.
*   **Result:** **Failure.** Turborepo also failed, but its error message was more insightful: `WARNING no output files found for task @logomesh/contracts#build`. This confirmed that while the build for `contracts` was running, it wasn't producing the `dist` folder that Turborepo expected to cache and make available to downstream packages.

### Attempt 4: Implementing TypeScript Project References

*   **Hypothesis:** The underlying issue is that the TypeScript compiler itself is not aware of the monorepo structure. For Turborepo to function correctly, `tsc` must also understand the dependency graph.
*   **Action:**
    1.  Ensured `"composite": true` was set in the base `tsconfig.json`.
    2.  Added `references` to the `tsconfig.json` of each dependent package (e.g., `core`'s tsconfig references `contracts`).
    3.  Changed all package-level `build` scripts from `tsc -p tsconfig.json` to `tsc -b`.
*   **Result:** **Failure.** This combination, which represents the definitive three-layer solution (pnpm + tsc references + Turborepo), still failed with the exact same error. Turborepo's log continued to show that the `contracts` package produced no output files, even though the `tsc -b` command should have built it correctly.

### Attempt 5: Diagnosing the "No Output" Issue

*   **Hypothesis:** Something is preventing the `contracts` package from compiling at all.
*   **Action:**
    1.  Verified that `packages/contracts/src` contained `.ts` files. (It does).
    2.  Verified that `packages/contracts/package.json` had a `build` script. (It does).
    3.  Deleted the `packages/contracts/tsconfig.tsbuildinfo` file in case it was corrupted.
*   **Result:** **Failure.** The build still failed with the same error.

## 5. Current State and Conclusion

The repository is currently configured with the full three-layer solution:
*   `pnpm` workspaces with `workspace:*` dependencies.
*   `Turborepo` with a `turbo.json` pipeline.
*   `TypeScript Project References` with `tsc -b` build scripts.

Despite this "by-the-book" configuration, the build continues to fail due to a race condition where dependent packages cannot find their dependencies. This strongly suggests an issue with the underlying development environment that is preventing `pnpm`, `tsc`, or `Turborepo` from functioning as documented.
