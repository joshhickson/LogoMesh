
# LogoMesh Framework Documentation

## Overview
LogoMesh is a modular framework for building applications that structure, visualize, and enhance interconnected thoughts and information.

## Directory Structure
```
/
├── src/                    # Source code
│   ├── components/         # React UI components
│   ├── contracts/         # TypeScript interfaces
│   ├── core/             # Core framework logic
│   ├── services/         # Service layer
│   └── utils/            # Utility functions
├── docs/                 # Documentation
├── scripts/             # Build/deployment scripts
└── state_snapshots/    # Graph state checkpoints
```

## Core Modules

### 1. Data Layer (`/src/contracts`)
- Type definitions and interfaces
- Data transfer objects (DTOs)
- Schema contracts

### 2. Core Logic (`/src/core`)
- Idea management
- Graph operations
- Event handling
- Logging system

### 3. Services (`/src/services`)
- Graph service
- Data persistence
- State management

### 4. UI Components (`/src/components`)
- Canvas visualization
- Thought management
- Navigation controls

## Getting Started
See [README-dev.md](./README-dev.md) for development setup.

## Development Workflow
See [BUILD_PROCESS.md](./BUILD_PROCESS.md) for build and deployment details.

## Data Migration
See [DATA_MIGRATION.md](./DATA_MIGRATION.md) for schema updates.

## Style Guidelines
See [STYLE_GUIDE.md](./STYLE_GUIDE.md) for UI/UX standards.
