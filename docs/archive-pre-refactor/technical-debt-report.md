# Technical Debt Report

**Date:** 2025-08-30

This document outlines several sources of technical debt discovered during the implementation of the "Secrets Management Stub" and "Rate Limiting and Health Checks" tasks. Addressing these issues will significantly improve the stability, testability, and maintainability of the codebase.

---

## 1. Duplicated and Conflicting Contracts

**Problem:**

There are two sources of truth for core data structures in the repository:
1.  **Canonical:** The root `contracts/` directory.
2.  **Outdated Duplicate:** A second `src/contracts/` directory.

These two directories contain conflicting definitions for the same interfaces, which causes persistent and confusing type errors, especially when writing code that bridges the frontend (`src/`) and the core logic (`core/`).

**Example: `NewThoughtData` Conflict**

- In `contracts/storageAdapter.ts`, the definition is:
  ```typescript
  export interface NewThoughtData {
    id?: string;
    title: string;
    content?: string; // Optional
    description?: string;
    // ...
  }
  ```

- In `src/contracts/entities.ts`, the definition was:
  ```typescript
  export interface NewThoughtData {
    title: string;
    description: string;
    content: string; // Required
    tags?: Tag[];
  }
  ```

This discrepancy was the root cause of many `tsc` failures during the development of new integration tests.

**Recommendation:**

The `src/contracts` directory should be **deleted**. All frontend components and services (like `apiService.ts`) should be refactored to import their types from the canonical `contracts/` directory at the project root. This will create a single source of truth and eliminate these type conflicts.

---

## 2. API Signature Mismatch

**Problem:**

There is a signature mismatch between methods defined in the `PluginAPI` interface (`contracts/plugins/pluginApi.ts`) and the methods they are intended to wrap from the `StorageAdapter` interface (`contracts/storageAdapter.ts`).

This caused a persistent `TS2554: Expected 0-1 arguments, but got 2` error that was difficult to debug.

**Example: `getSegments` vs. `getSegmentsForThought`**

- The `PluginAPI` defines a simple `getSegments` method:
  ```typescript
  export interface PluginAPI {
    // ...
    getSegments(thoughtId: string): Promise<Segment[]>;
  }
  ```

- The `StorageAdapter` defines a more flexible `getSegmentsForThought` method that also accepts a `userId`:
  ```typescript
  export interface StorageAdapter {
    // ...
    getSegmentsForThought(thoughtId: string, userId?: string): Promise<Segment[]>;
  }
  ```

When trying to implement the `PluginAPI` using a `StorageAdapter` instance (as is done in `server/src/routes/pluginRoutes.ts`), it's impossible to satisfy the `PluginAPI` interface without losing the `userId` functionality or creating a confusing mismatch.

**Recommendation:**

The `PluginAPI` should be a true and consistent facade over the services it exposes. The method signatures in `PluginAPI` should be aligned with the signatures of the underlying services (`StorageAdapter`, etc.) to avoid these conflicts.

For example, `PluginAPI.getSegments` should be changed to:
```typescript
getSegments(thoughtId: string, userId?: string): Promise<Segment[]>;
```
This would make the API consistent and easier to implement correctly.

---

## 3. Architectural and Testing Challenges

Several other issues were discovered that make development and testing more difficult than they need to be.

### A. Brittle Test Setup

- **Global Mocks:** The test setup file (`vitest.setup.ts`) globally mocks fundamental browser APIs like `fetch`. This makes it very difficult to write true integration tests that need to make real network requests, as they are intercepted by the global mock.
- **Recommendation:** Remove global mocks, especially for `fetch`. Tests that require mocks should define them locally using `vi.mock` or by passing mocked dependencies directly to the components or functions they are testing. This makes tests more explicit and less prone to side effects.

### B. Inconsistent Dependency Injection

- **Service Instantiation:** Some services, like `PluginHost`, had constructors that were difficult to satisfy, leading to complex or incomplete instantiation in different parts of the app (e.g., in `pluginRoutes.ts` vs. `server/src/index.ts`).
- **Configuration:** The application relied on a global singleton for configuration, which made it difficult to provide a different configuration for the test environment.
- **Recommendation:** Consistently use dependency injection for all services and configuration. Services should receive their dependencies (like other services, adapters, or config objects) via their constructor. This makes the code more modular, easier to understand, and vastly more testable, as demonstrated by the refactoring of `server/src/index.ts` to accept a `config` object and a `storageAdapter`.
