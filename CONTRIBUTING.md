# Contributing to LogoMesh

Thank you for your interest in contributing to LogoMesh! This guide provides instructions for setting up your development environment and contributing to the project.

## Getting Started

### Prerequisites

*   **Node.js**: This project uses a specific version of Node.js. We recommend using [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm) to manage your Node.js versions.
    *   Once you have `nvm` installed, you can run the following command in the project root to automatically switch to the correct Node.js version:
        ```bash
        nvm use
        ```
        This command reads the version from the `.nvmrc` file in the project root.
*   **npm**: This project uses npm for package management. It is installed with Node.js.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd logomesh
    ```

2.  **Install dependencies:**
    This project uses npm workspaces. To install all dependencies for all workspaces, run the following command from the project root. We recommend using `npm ci` for clean, reproducible builds.
    ```bash
    npm ci
    ```
    This will install the exact versions of the dependencies specified in the `package-lock.json` file.

## Development

### Running the Application

To start the development server for both the frontend and backend, run the following command from the project root:

```bash
npm run dev
```

This command uses `concurrently` to start both the React development server (on port 5000) and the backend server (on port 3001).

### Running Individual Workspaces

You can also run scripts for individual workspaces:
*   **Frontend only:** `npm run start`
*   **Backend only:** `npm run dev -w logomesh-server`

## Testing and Validation

This project has a comprehensive validation suite that includes linting, type-checking, and running all tests. To run the full suite, use the following command:

```bash
npm run validate
```

It is highly recommended to run this command before submitting any changes to ensure your code meets the project's quality standards.

## Coding Style

This project uses [ESLint](https://eslint.org/) for linting and [Prettier](https://prettier.io/) for code formatting.

*   You can run the linter with `npm run lint`.
*   You can automatically fix some linting issues with `npm run lint:fix`.
*   You can format the code with `npm run format`.

There is a pre-commit hook set up with Husky that will automatically format your staged files, so you don't have to worry about it too much.
