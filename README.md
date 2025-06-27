
# LogoMesh

**Discord:** https://discord.gg/6ydDxzMjvD

**Tagline:**
> A recursive thought engine for humans and AI — designed to evolve meaning, resolve contradictions, and externalize self-reflection.

LogoMesh is a powerful cognitive framework that allows you to create, organize, and navigate complex ideas through interconnected nodes (thought bubbles), nested segments, and flexible metadata filtering. Built as a **local-first, AI-augmented system** with a React frontend and Node.js backend.

---

## Current Status

**Phase:** Infrastructure Stabilization (Pre-Phase 2)  
**Version:** 0.2.0  
**Architecture:** React Frontend + Node.js/Express Backend + SQLite Database

⚠️ **Development Notice:** This project is in pre-alpha with active infrastructure improvements. Some features may be unstable.

---

## Features

### Core Functionality (Operational)
* **Thought Bubbles** with customizable titles, descriptions, tags, and colors
* **Nested Segments** within each thought with detailed content and attributes
* **Multi-attribute Classification** for powerful data structuring
* **Advanced Filtering** by field name, type, and value with canvas highlighting
* **JSON Export/Import** for data portability and AI integration
* **SQLite Backend** with normalized schema for reliable data persistence
* **Plugin System Foundation** with runtime interface scaffolding

### Infrastructure (In Development)
* **Multi-Language Plugin Runtime** - Support for Node.js and Python plugins
* **DevShell Interface** - Secure command environment for development
* **Task Engine** - Workflow orchestration and automation
* **LLM Integration Layer** - Local model support with audit logging
* **Vector Storage Foundations** - Semantic search preparation

---

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone and Install**:
   ```bash
   git clone https://github.com/joshhickson/LogoMesh.git
   cd LogoMesh
   npm install
   cd server && npm install && cd ..
   ```

2. **Start Development Servers**:
   ```bash
   # Terminal 1: Backend (Port 3001)
   cd server && npm run dev
   
   # Terminal 2: Frontend (Port 3000) 
   npm start
   ```

3. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api/v1

### Database Configuration

**Default (SQLite):** No configuration needed - database file created automatically.

**Custom Database:** Copy `.env.example` to `.env` and configure:
```env
DATABASE_URL=sqlite:./data/custom.db
# Or PostgreSQL: postgresql://user:pass@host:5432/db
```

---

## Architecture Overview

```
Frontend (React/Cytoscape.js) ←→ Backend API (Express) ←→ SQLite Database
        ↓                              ↓
   UI Components                  Core Services
   - Canvas                       - IdeaManager
   - Sidebar                      - EventBus  
   - Modals                       - PluginHost
                                  - TaskEngine (planned)
```

### Current Components

**Frontend Layer:**
- React 18 with modern hooks
- Cytoscape.js for graph visualization
- Responsive design with Tailwind CSS

**Backend Layer:**
- Express.js API server with TypeScript
- SQLite with normalized schema
- Plugin system architecture
- Comprehensive audit logging

**Core Services:**
- `IdeaManager`: Business logic and thought operations
- `EventBus`: Pub/sub system for component coordination
- `PluginHost`: Plugin runtime management (foundation)
- `StorageAdapter`: Database abstraction layer

---

## Development

### Project Structure
```
├── src/                    # React frontend
├── server/src/            # Node.js backend
├── core/                  # Shared business logic
├── contracts/             # TypeScript interfaces
├── plugins/               # Plugin ecosystem
└── docs/                  # Documentation
```

### Testing
```bash
# Frontend tests
npm test

# Backend tests  
cd server && npm test

# Linting
npm run lint
```

### Known Issues
- Some TypeScript compilation errors in backend routes
- Frontend test suite needs stability improvements
- Plugin runtime execution not fully implemented

---

## Roadmap

### Phase 1: Foundation ✅ (Complete)
- Core thought management and visualization
- Client-server architecture with SQLite
- Basic plugin system scaffolding
- JSON import/export functionality

### Phase 2: Infrastructure 🔄 (In Progress)
**Current Focus:** Stabilizing foundation before feature expansion

**Priority Tasks:**
- Fix TypeScript compilation errors
- Complete multi-language plugin runtime
- Implement DevShell command interface
- Build task engine workflow system
- Add local LLM integration (Ollama)

**Infrastructure Goals:**
- Plugin system supporting Node.js, Python execution
- Secure development environment (DevShell)
- Vector storage for semantic search
- Enhanced audit and monitoring systems

### Phase 3: AI Activation 📋 (Planned)
- Real-time AI decision making
- Advanced semantic analysis and search
- Multi-agent coordination systems
- Recursive AI querying capabilities

---

## API Documentation

### Core Endpoints
```
GET    /api/v1/thoughts              # List all thoughts
POST   /api/v1/thoughts              # Create thought
GET    /api/v1/thoughts/:id          # Get specific thought
PUT    /api/v1/thoughts/:id          # Update thought
DELETE /api/v1/thoughts/:id          # Delete thought

POST   /api/v1/portability/export    # Export data
POST   /api/v1/portability/import    # Import data
```

### Plugin API (Development)
```
GET    /api/v1/plugins               # List plugins
POST   /api/v1/plugins/:id/execute   # Execute plugin command
```

---

## Contributing

### Development Setup
1. Follow installation instructions above
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes and test thoroughly
4. Submit pull request with detailed description

### Code Standards
- TypeScript for new backend code
- ESLint + Prettier for formatting
- Comprehensive test coverage for new features
- Interface-first design using `/contracts/`

---

## Deployment

### Local Production Build
```bash
npm run build
cd server && npm run build
```

### Replit Deployment
LogoMesh is designed to deploy seamlessly on Replit:
1. Import repository to Replit
2. Configure environment variables if needed
3. Use Deployments tab for production hosting

---

## Data Format

Thoughts export as structured JSON for transparency and AI integration:

```json
{
  "id": "thought-001",
  "title": "Example Thought", 
  "description": "High-level concept",
  "tags": [{"name": "philosophy", "color": "#f97316"}],
  "segments": [
    {
      "id": "segment-001",
      "title": "Key Point",
      "content": "Detailed information...",
      "attributes": [
        {
          "fieldName": "Category",
          "fieldValue": "Quote", 
          "fieldType": "text"
        }
      ]
    }
  ]
}
```

---

## License

MIT — Free to fork, remix, and evolve.

---

## Support

- **Documentation:** See `/docs/` for technical details
- **Issues:** GitHub Issues for bug reports and feature requests
- **Discord:** https://discord.gg/6ydDxzMjvD for community discussion

---

**Created by [Josh Hickson](https://github.com/joshhickson)**

*This is not just productivity software. This is a cognitive framework for the evolution of intelligence.*

**Welcome to LogoMesh.**
