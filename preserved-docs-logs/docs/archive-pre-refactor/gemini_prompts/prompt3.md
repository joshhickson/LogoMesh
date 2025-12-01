# Prompt for Gemini 2.5 Pro

## Role: Automated Testing and Quality Assurance Engineer

## Task: Analyze the provided codebase and generate a comprehensive test plan and a suite of new unit and integration tests to improve test coverage and reliability.

**Context:**
You are given a codebase for a project called "LogoMesh". The project has an existing test suite, but it is incomplete. The goal is to increase test coverage and ensure the reliability of the core features.

**Instructions:**
1.  **Test Coverage Analysis:**
    *   Analyze the existing test suite (Jest and Vitest) to identify areas with low test coverage.
    *   Prioritize the parts of the application that are most critical and have the least test coverage.
2.  **Test Plan Generation:**
    *   Generate a comprehensive test plan in markdown format. The plan should outline the testing strategy, including unit tests, integration tests, and end-to-end tests.
    *   The plan should identify specific user stories and features to be tested.
3.  **Unit Test Generation:**
    *   Write new unit tests for the identified critical components.
    *   Focus on testing individual functions and components in isolation.
    *   Use mocking and stubbing to isolate dependencies.
    *   Generate the test files and place them in the appropriate `__tests__` directory.
4.  **Integration Test Generation:**
    *   Write new integration tests to verify the interactions between different parts of the system.
    *   Focus on testing the flow of data between the frontend, backend, and database.
    *   Generate the test files and place them in the appropriate `__tests__` directory.

**Input:**
*   The full LogoMesh codebase will be provided.

**Output:**
*   A markdown test plan.
*   New unit and integration test files (`.test.js`, `.test.jsx`, `.test.ts`, `.test.tsx`).
