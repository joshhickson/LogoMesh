# LogoMesh: An Open Platform for Agent-on-Agent Evaluation

Welcome to the LogoMesh project! This repository contains the source code for a next-generation platform designed to evaluate the reasoning capabilities of advanced AI agents.

Our mission is to create a new benchmark for AI safety and reliability, framed through the lens of our core concept: **Contextual Debt**.

---

## Getting Started

As a new team member, your first step is to get a complete picture of our project's vision, current status, and strategic goals. We've prepared a detailed document that will bring you up to speed.

**➡️ [Start Here: Read the Project Status & Strategic Overview](./docs/PROJECT_STATUS.md)**

This document provides a comprehensive overview of:
*   Our strategic vision for the "Cyber-Sentinel Agent".
*   The core concept of "Contextual Debt".
*   The current technical state of the platform.
*   A gap analysis outlining the key areas where you can make an impact.

### Development Environment

**1. Install Dependencies:**
```bash
pnpm install
```

**2. Current Status & Verification:**
Our end-to-end verification test can be run with the following command:
```bash
pnpm --filter @logomesh/server test:e2e
```
**Important:** Please be aware that this script is **expected to fail** at this time. The project's build is currently blocked by a known Redis connection issue, which prevents the test from running successfully. We believe in full transparency and want you to have a clear picture of the project's state from day one. Resolving this is our top priority after you are fully onboarded.
