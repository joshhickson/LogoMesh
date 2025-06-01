# Development Workflow Advice

## Introduction

This document offers advice to help ensure a smoother development workflow, reduce common errors, and improve code quality when working on this project. Adopting these practices can lead to a more efficient and less frustrating development experience.

## General Workflow Advice

- **Lint and Format Regularly**:
    - Run linters and formatters frequently to catch issues early and maintain consistent code style.
    - Use `npm run lint` to check for linting errors.
    - Use `npm run format` to automatically format the code according to Prettier rules.
    - Integrating these into pre-commit hooks can automate this process.

- **IDE Integration**:
    - Install and configure editor extensions for ESLint, Prettier, and TypeScript.
    - These extensions provide real-time feedback directly in your editor, helping you catch errors and style issues as you type.

- **Leverage TypeScript**:
    - Strive to use specific types instead of `any` whenever possible. This improves code safety and readability.
    - Define clear `interface` or `type` definitions for your data structures.
    - Consider enabling stricter TypeScript compiler options in `tsconfig.json` (e.g., `strict`, `noImplicitAny`, `strictNullChecks`) to catch more potential errors at compile time.

- **Incremental Commits**:
    - Make small, logical commits with clear and descriptive messages.
    - This makes it easier to track changes, understand the history of the project, and revert changes if necessary.

- **Write Unit Tests**:
    - Write unit tests for new features and bug fixes to ensure code behaves as expected and to prevent regressions.
    - Run tests using `npm test`.
    - Well-tested code is more reliable and easier to refactor.

- **Code Reviews**:
    - Whenever possible, have another person review your code. A fresh pair of eyes can often spot issues you might have missed.
    - If a human reviewer isn't available, consider using an LLM with specific instructions to review for potential bugs, style inconsistencies, or areas for improvement.

- **Understand Your Tools and Build Process**:
    - A basic understanding of how tools like ESLint (for linting), the TypeScript compiler (`tsc`), and module bundlers (like Webpack or Rollup, if used) work can be very helpful for troubleshooting and configuration.

## Working with LLM-Generated Code

Large Language Models (LLMs) can be powerful assistants, but their output requires careful handling:

- **Treat as a Starting Point**:
    - Always treat LLM-generated code as a suggestion or a starting point, not as production-ready code.
    - Carefully review, understand, and test any code provided by an LLM before integrating it.

- **Iterative Refinement**:
    - For complex tasks, break down the problem into smaller pieces for the LLM.
    - Work iteratively with the LLM, refining its output through multiple prompts and feedback cycles.

- **Clear Prompts**:
    - The quality of LLM output heavily depends on the quality of the input prompt.
    - Be as specific, detailed, and clear as possible in your instructions. Provide context, examples, and constraints.

- **Version Control**:
    - When incorporating significant amounts of LLM-generated code, commit the initial output to a separate feature branch.
    - Review, refactor, and test the code on this branch before merging it into your main development branch.

## Troubleshooting Common Issues

- **Read Error Messages Carefully**:
    - Compiler errors (from `tsc`), linter errors (from ESLint), and runtime errors often provide valuable clues about the problem.
    - Pay close attention to the file name, line number, and the specific error message.

- **Isolate Problems**:
    - If you're unsure where an error is coming from, try commenting out sections of your code or simplifying a complex function to narrow down the source of the issue.
    - Test small pieces of functionality independently.

- **Check Dependencies**:
    - Ensure all project dependencies are correctly installed by running `npm install`.
    - If you encounter issues related to a specific package, check its documentation and ensure its version is compatible with other packages in your project. Sometimes, removing `node_modules` and `package-lock.json` (or `yarn.lock`) and running `npm install` again can resolve stubborn dependency issues.
