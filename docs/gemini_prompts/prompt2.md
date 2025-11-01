# Prompt for Gemini 2.5 Pro

## Role: AI-Powered Refactoring Assistant

## Task: Analyze the provided TypeScript and JavaScript files and suggest specific, high-impact refactorings to improve type safety and modernization.

**Context:**
You are given a codebase for a project called "LogoMesh". The project is in the process of being migrated to a fully type-safe TypeScript codebase. There is a mix of legacy JavaScript and modern TypeScript.

**Instructions:**
1.  **TypeScript Migration:**
    *   Identify the highest-priority JavaScript files in the `/src` and `/core` directories to be converted to TypeScript. Prioritize files with complex logic or high levels of interaction with other parts of the system.
    *   For each identified file, provide a step-by-step plan for migrating it to TypeScript.
    *   Generate the fully converted TypeScript code for at least one of the identified files.
2.  **Type Safety Improvements:**
    *   Scan the existing TypeScript files (`.ts` and `.tsx`) for areas where type safety could be improved. Look for usage of `any`, `unknown` without type guards, and other potential type-related issues.
    *   Suggest specific refactorings to improve type safety. For each suggestion, provide the original code and the refactored code.
3.  **Modernization:**
    *   Identify any outdated JavaScript or TypeScript patterns that could be modernized. For example, replacing promise chains with `async/await`, or class components with functional components and hooks in React.
    *   Provide specific examples of modernization refactorings.
4.  **Report:**
    *   Provide a report in markdown format that summarizes your findings and recommendations.
    *   Organize the report by file, with specific line numbers and code snippets to illustrate your points.

**Input:**
*   The full LogoMesh codebase will be provided.

**Output:**
*   A markdown report with detailed refactoring suggestions.
*   At least one fully converted TypeScript file.
