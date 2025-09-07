# LogoMesh Framework

## Overview

LogoMesh is a local-first cognitive framework designed as a "recursive thought engine for humans and AI." The system enables users to create, organize, and navigate complex ideas through interconnected "thought bubbles," nested segments, and flexible metadata filtering. Built with React on the frontend and Node.js/Express on the backend, LogoMesh features a plugin architecture with secure sandboxing, LLM integration capabilities, and multiple database adapter support (SQLite, PostgreSQL). The project is currently in Phase 2 development, focusing on hardening the core architecture with type-safe code, secure plugin execution, and comprehensive observability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React-based UI**: Single-page application using React 18 with TypeScript migration in progress
- **Graph Visualization**: Cytoscape.js integration for interactive thought mapping and relationship visualization
- **Component Structure**: Modular design with Canvas, Sidebar, Modal components for thought management
- **State Management**: Local state with API service integration for backend communication
- **Styling**: Tailwind CSS with dark mode support for responsive design

### Backend Architecture
- **Express Server**: RESTful API server running on port 3001 with comprehensive routing structure
- **Layered Design**: Clear separation between API routes, core services, and data persistence layers
- **Storage Abstraction**: Pluggable storage adapters supporting SQLite (local development) and PostgreSQL (production)
- **Plugin System**: VM2-based sandboxed execution environment for secure plugin hosting
- **Event-Driven Core**: EventBus architecture for cross-service communication and workflow orchestration

### Data Storage Solutions
- **Multi-Database Support**: Abstracted storage layer with SQLite for local development and PostgreSQL for production deployment
- **Schema Design**: Normalized database structure for thoughts, segments, tags, and relationships with proper indexing
- **JSON Import/Export**: Portable data format for AI integration and backup/restore functionality
- **Vector Storage Planning**: Future integration with vector databases for semantic search capabilities

### Authentication and Authorization
- **JWT-based Authentication**: Token-based session management with secure secret handling
- **Multi-user Support**: User isolation and permission-based access control
- **Environment-based Configuration**: Secure credential management through environment variables
- **Rate Limiting**: API protection with per-IP request throttling (100 requests/minute default)

### Plugin Architecture
- **Secure Sandbox**: VM2-based isolation for plugin execution with filesystem and network restrictions
- **Manifest System**: Declarative plugin capabilities and permission management
- **Multi-language Support**: Node.js plugins operational with Python runtime in development
- **Hot Reload**: Development-time plugin reloading without system restart

### LLM Integration Layer
- **Gateway Pattern**: Centralized LLM access with rate limiting, authentication, and audit logging
- **Model Abstraction**: Pluggable executor pattern supporting multiple LLM providers
- **Conversation Management**: Stateful orchestration for multi-turn interactions
- **Runner Pool**: Per-model execution isolation for concurrent request handling

### Development and Observability
- **TypeScript Migration**: Gradual migration from JavaScript with strict type checking in core components
- **Comprehensive Testing**: Vitest-based test suite with frontend component and API endpoint coverage
- **ESLint Integration**: Automated code quality enforcement with custom rules for type safety
- **Health Monitoring**: System health endpoints and performance metrics collection
- **Development Tooling**: Hot reload, automated builds, and comprehensive error reporting

## External Dependencies

### Core Runtime Dependencies
- **React Ecosystem**: React 18, React DOM, React Scripts for frontend development and build tooling
- **Express Framework**: Backend API server with CORS support and middleware ecosystem
- **Database Drivers**: SQLite3 for local storage, PostgreSQL (pg) for production database connectivity
- **Graph Visualization**: Cytoscape.js with layout algorithms (cose-bilkent, fcose) for network visualization
- **Authentication**: jsonwebtoken for JWT token management and user session handling

### Development and Build Tools
- **TypeScript**: Type-safe development with gradual migration from JavaScript codebase
- **Testing Framework**: Vitest for unit testing with jsdom environment for component testing
- **Code Quality**: ESLint with TypeScript plugins, Prettier for code formatting
- **Build System**: React App Rewired for custom webpack configuration and module resolution
- **Styling**: Tailwind CSS for utility-first styling with dark mode capabilities

### Plugin and Security Infrastructure
- **Sandbox Execution**: VM2 for secure plugin isolation and execution environment
- **File Processing**: Multer for file upload handling, Canvas for image processing capabilities
- **UUID Generation**: UUID library for unique identifier generation across system components
- **Process Management**: Nodemon for development server monitoring and automatic restarts

### Optional Integrations
- **Node-RED**: Workflow automation system for complex data processing pipelines
- **Neo4j Driver**: Graph database connectivity for advanced relationship modeling
- **Vector Search**: Planned integration with vector databases for semantic search capabilities
- **LLM Providers**: Extensible integration points for OpenAI, Anthropic, and local model providers