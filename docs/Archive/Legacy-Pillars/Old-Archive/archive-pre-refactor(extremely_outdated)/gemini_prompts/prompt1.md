# Prompt for Gemini 2.5 Pro

## Role: Software Engineering Analyst

## Task: Analyze the provided codebase and identify key architectural patterns and anti-patterns.

**Context:**
You are given a codebase for a project called "LogoMesh". It is a local-first cognitive framework for organizing and navigating complex ideas. The frontend is built with React, and the backend is Node.js/Express with a SQLite database.

**Instructions:**
1.  **Architectural Patterns:**
    *   Identify and describe the main architectural patterns used in the backend (e.g., layered architecture, microservices, event-driven architecture).
    *   Identify and describe the main architectural patterns used in the frontend (e.g., component-based, MVC, MVVM).
    *   Analyze the use of the `core` directory for shared business logic. Is this an effective pattern for this project?
2.  **Anti-Patterns:**
    *   Identify any architectural anti-patterns present in the codebase. For each anti-pattern, explain why it is problematic and suggest a potential solution.
    *   Look for signs of tight coupling, god objects, or other common anti-patterns.
3.  **Code Quality:**
    *   Assess the overall code quality, including consistency, readability, and maintainability.
    *   Identify any "code smells" that could indicate deeper problems.
4.  **Report:**
    *   Provide a concise report summarizing your findings. Use diagrams (e.g., Mermaid.js) to illustrate the architecture where appropriate.
    *   For each identified pattern or anti-pattern, provide specific file and line number examples from the codebase.
    *   Provide actionable recommendations for improving the architecture and code quality.

**Input:**
*   The full LogoMesh codebase will be provided.

**Output:**
*   A markdown report detailing your analysis and recommendations.
