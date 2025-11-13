Build Failure Debug Log -
Date: 2025-11-08

****
Observation: First noticed the safe-workers target failing in CI. The error was `TS2503: Cannot find namespace 'vi'`.

Hypothesis: My initial thought was that the build environment was missing a dev dependency, specifically `vitest`, which provides the `vi` namespace.

Action: Began a collaborative debugging session.

****
Observation: The build consistently fails at the pnpm run build step with a TypeScript error (`TS2503: Cannot find namespace 'vi'`). The failure is in the `@logomesh/core` package.

Hypothesis: The problem is a configuration issue, not a code issue. The `tsconfig.json` is incorrectly including test files in the build, which is causing the compiler to look for `vitest` globals in an environment where they are not available.

Action: Started a collaborative debugging session to investigate the build environment and the `tsconfig.json` configuration.

****
Observation: The build container is a "black box." We don't know the state of the filesystem right before the build script runs.

Hypothesis: The build context is either "dirty" (e.g., from my local machine) or the `tsconfig.json` is pulling in files it shouldn't.

Action: Collaboratively modified the `Dockerfile` for the `testing-worker` (aka `safe-workers`) target. We inserted a new `RUN` layer just before the failing build step.

Action: The new `RUN` step included:
```
ls -laR packages/core
cat packages/core/package.json
cat packages/core/tsconfig.json
```

****
Observation: Received the new build log (`2025-11-08_build_context_debug.log`). The output from the new `RUN` step was the key.

Key Findings:
- Confirmed `packages/core/src` contains `.test.ts` files.
- Confirmed the `tsconfig.json` `include` path was `"src/**/*.ts"` and `types` included `"vitest/globals"`.

Conclusion: The root cause is `tsc` is compiling test files in a production environment where `vitest` isn't installed, because the `tsconfig.json` tells it to.

Next Steps:
1. Implement the `tsconfig.json` `exclude` fix.
2. Create a new `.dockerignore` file to prevent local build artifacts from leaking into the Docker build context.
3. Create a `Dockerfile` to standardize the build environment.
4. Resolve the cascading dependency issues that arose from these changes (`isolated-vm`, `pnpm`, `ioredis`).
5. Document the entire process in a log file.
