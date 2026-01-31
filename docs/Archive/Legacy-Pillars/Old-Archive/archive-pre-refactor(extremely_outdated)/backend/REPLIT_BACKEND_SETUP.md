
# Backend Server Setup Guide for Replit

## Overview

This guide provides step-by-step instructions for setting up and running the LogoMesh backend server in Replit environment.

## Prerequisites

- Completed Phase 0 setup with decoupled React application
- Backend server structure in `/server` directory
- Required dependencies installed

## Backend Server Structure

```
server/
├── src/
│   ├── routes/
│   │   ├── thoughtRoutes.ts
│   │   ├── llmRoutes.ts
│   │   ├── orchestratorRoutes.ts
│   │   ├── portabilityRoutes.ts
│   │   ├── adminRoutes.ts
│   │   └── taskRoutes.ts
│   ├── db/
│   │   └── postgresAdapter.ts
│   ├── index.ts
│   └── server.ts
├── package.json
└── tsconfig.json
```

## Setting Up the Backend Workflow

### 1. Verify Backend Dependencies

The backend server requires these dependencies to be installed in the `/server` directory:

```bash
cd server && npm install
```

Required packages:
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `sqlite3` - Database adapter
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `nodemon` - Development server

### 2. Starting the Backend Server

To start the backend server, run the following command from the root of the project:

```bash
npm run dev
```

The backend server will:
- Start on port 3001 (accessible via `http://localhost:3001`)
- Initialize SQLite database connection
- Set up API routes under `/api/v1/`
- Enable CORS for frontend communication

### 3. Verifying Backend Operation

Once the backend is running, verify it's working:

**Health Check:**
```
GET http://localhost:3001/api/v1/health
```

Expected response:
```json
{
  "status": "operational",
  "timestamp": "2025-09-25T08:32:41.668Z",
  "system": {
    "uptime": 1,
    "memory": {
      "heapUsedMB": 30
    }
  },
  "services": {
    "dbConn": "ok",
    "pluginSandboxAlive": false
  },
  "metrics": {
    "queueLag": 0
  }
}
```

**API Endpoints:**
- `GET /api/v1/thoughts` - Retrieve all thoughts
- `POST /api/v1/thoughts` - Create new thought
- `PUT /api/v1/thoughts/:id` - Update thought
- `DELETE /api/v1/thoughts/:id` - Delete thought

### 4. Environment Configuration

The backend uses these environment variables:

- `PORT` - Server port (default: 3001)
- `DB_PATH` - SQLite database path (default: ./data/logomesh.sqlite3)
- `API_BASE_PATH` - API prefix (default: /api/v1)
- `LOG_LEVEL` - Logging level (default: info)

### 5. Database Initialization

The backend automatically:
- Creates SQLite database if it doesn't exist
- The schema is initialized in the `SQLiteStorageAdapter`
- Sets up required tables for thoughts, segments, and metadata

### 6. Running Both Frontend and Backend

**Recommended Workflow:**

1. Start Backend Server workflow first
2. Start the main "Run" workflow for the frontend
3. Frontend will connect to backend at `http://localhost:3001/api/v1`

**Port Configuration:**
- Frontend: Port 3000
- Backend: Port 3001

### 7. Troubleshooting

**Common Issues:**

1. **Port Already in Use:**
   - Stop existing workflows before restarting
   - Check for running processes on port 3001

2. **Database Connection Errors:**
   - The `SQLiteStorageAdapter` will automatically create the `data` directory if it doesn't exist.
   - Check file permissions for database creation

3. **CORS Errors:**
   - Backend includes CORS middleware for all origins
   - Verify frontend is making requests to correct port

4. **TypeScript Compilation Errors:**
   - Check `server/tsconfig.json` configuration
   - Ensure all dependencies are installed

**Debug Commands:**

Check server status:
```bash
npm run dev
```

View logs:
The server now logs to the console.

### 8. API Testing

Use the browser console or external tools to test API endpoints:

```javascript
// Test in browser console
fetch('http://localhost:3001/api/v1/health')
  .then(r => r.json())
  .then(console.log);
```

### 9. Production Considerations

For deployment:
- Backend runs on `0.0.0.0:3001` for Replit compatibility
- Database persists in Replit's file system
- Environment variables can be set via Replit Secrets

## Next Steps

1. Verify backend is running successfully
2. Start frontend application
3. Test API connectivity between frontend and backend
4. Set up deployment configuration

## Support

For additional help:
- Check `/docs/LOCAL_DEV_GUIDE_FOR_LLM.md` for development context
- Review `/server/src/index.ts` for server configuration
- Examine workflow logs in Replit console
