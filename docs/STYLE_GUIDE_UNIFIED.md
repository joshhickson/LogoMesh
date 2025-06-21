
# LogoMesh Unified Style Guide

## Project Naming
- **Official Project Name**: LogoMesh
- **Repository References**: Use "logomesh" (lowercase) in URLs, file names, and configurations
- **Code References**: Use "LogoMesh" (PascalCase) in documentation and UI text

## Code Standards
- **Language**: TypeScript preferred for all new development
- **Testing**: Vitest for all testing (Jest migration complete)
- **Linting**: ESLint with Prettier for consistent formatting
- **File Naming**: 
  - Components: PascalCase (e.g., `ThoughtDetailPanel.tsx`)
  - Utilities: camelCase (e.g., `apiService.ts`)
  - Constants: UPPER_SNAKE_CASE

## Architecture Principles
- **Local-First**: All core functionality works offline
- **Plugin-Ready**: Extensible architecture for Phase 2+ plugins
- **Type-Safe**: Comprehensive TypeScript coverage
- **Testable**: 90%+ test coverage target

## Development Process
- **Branch Naming**: `feature/`, `bugfix/`, `infrastructure/` prefixes
- **Commit Messages**: Conventional Commits format
- **Documentation**: Update docs/ with all architectural changes
- **Testing**: All PRs require passing tests and lint checks
