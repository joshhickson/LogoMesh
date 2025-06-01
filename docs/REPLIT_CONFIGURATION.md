# Replit Configuration

## Overview

This document details the Replit-specific configurations for this project, primarily managed through the `.replit` and `replit.nix` files. These files define the environment, run commands, deployment settings, and custom workflows used within the Replit platform.

## `.replit` file

The `.replit` file is Replit's primary configuration file, dictating various aspects of the Repl's behavior.

Key configurations include:

- **Default Run Command**:
    - The `run` field is set to `"npm run start"`. This is the command executed when the "Run" button is pressed, though this can be overridden by the `[workflows]` configuration (see below).
- **Language and Modules**:
    - `language = "nodejs"`: Specifies Node.js as the primary language.
    - `modules = ["nodejs-20", "web", "nix"]`: Indicates the use of Node.js version 20, web server capabilities, and Nix for environment management.
- **Nix Configuration**:
    - `[nix]` section:
        - `packages = ["nodejs", "npm"]`: Specifies that `nodejs` and `npm` should be available from the Nix environment.
        - `channel = "stable-24_05"`: Defines the Nix channel to be used. This works in conjunction with `replit.nix` for package management.
- **Deployment Settings**:
    - `[deployment]` section:
        - `run = ["sh", "-c", "serve -s build -l 3000"]`: Command used to run the application upon deployment.
        - `deploymentTarget = "cloudrun"`: Specifies Google Cloud Run as the deployment target.
        - `build = ["sh", "-c", "npm run build"]`: Command used to build the application before deployment.
- **Port Forwarding**:
    - `[[ports]]` sections define how local ports are mapped to external ports:
        - Local port `3000` is mapped to external port `80`.
        - Local port `3001` is mapped to external port `3001`.
- **Custom Workflows**:
    - `[workflows]` section allows defining custom run behaviors.
    - `runButton = "Run Frontend & Backend"`: Sets the default action for the main "Run" button to the "Run Frontend & Backend" workflow.
    - **Available Workflows**:
        - **`Run`**:
            - Author: 42214058
            - Mode: `sequential`
            - Tasks:
                - `npm run start`
                - `cd server && npm run dev`
        - **`Lint`**:
            - Author: 42214058
            - Mode: `sequential`
            - Tasks:
                - `npm run lint`
                - `npm run format`
        - **`Run Frontend & Backend`**: (Default for Run button)
            - Author: 42214058
            - Mode: `parallel`
            - Tasks:
                - `npm run start`
                - `cd server && npm run dev`
        - **`Run Node-RED`**:
            - Author: 42214058
            - Mode: `sequential`
            - Tasks:
                - `node-red --userDir ./ --settings node-red-settings.js`

## `replit.nix` file

The `replit.nix` file configures the Nix environment for the Repl, specifying system-level dependencies.

- **Purpose**: It ensures that the necessary packages and versions are available in the Replit environment.
- **Dependencies**:
    - `pkgs.nodejs_18`: Specifies Node.js version 18.
    - `pkgs.yarn`: Specifies Yarn package manager.
- **Version Discrepancy**:
    - The `.replit` file specifies `modules = ["nodejs-20", ...]` and `[nix].packages = ["nodejs", ...]`, while `replit.nix` specifies `pkgs.nodejs_18`.
    - Typically, the Nix environment configured in `replit.nix` takes precedence for setting up the underlying system environment. The `modules` in `.replit` might be used by Replit's tooling or specific language servers, but the Nix setup dictates the actual Node.js version available in the shell.

## `package.json` scripts

Several scripts defined in `package.json` are utilized by the Replit configurations in the `.replit` file, particularly within the `run` command and workflow tasks. These include:

- `npm run start` (Often used for starting the frontend)
- `npm run build` (Used for building the application for deployment)
- `npm run lint` (Used in the "Lint" workflow)
- `npm run format` (Used in the "Lint" workflow)
- `cd server && npm run dev` (Used for starting the backend server in various workflows)
- `node-red --userDir ./ --settings node-red-settings.js` (Used in the "Run Node-RED" workflow)
