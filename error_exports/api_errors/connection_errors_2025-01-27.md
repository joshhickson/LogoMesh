
# API Connection Errors Export
**Date:** January 27, 2025  
**Session:** Current Active Session

## Backend Connection Failures

### 1. Primary API Endpoint Unavailable
**Endpoint:** `http://localhost:3001/api/v1/thoughts`  
**Error Type:** NetworkError  
**Severity:** Critical (blocks core functionality)  
**Pattern:** Fetch resource failures  

**Error Details:**
```
NetworkError when attempting to fetch resource
TypeError: Failed to fetch
```

**Root Cause Analysis:**
- Backend server not running on port 3001
- No process listening on target port
- Frontend attempting API calls to non-existent service

### 2. Port Availability Issues  
**Issue:** Port 3000 already in use  
**Impact:** Prevents parallel frontend/backend workflow  
**Workflow Affected:** "Run Frontend & Backend"  

**Error Context:**
```
? Something is already running on port 3000.
Would you like to run the app on another port instead? › (Y/n)
```

## API Service Configuration
**Base URL:** `http://localhost:3001/api/v1`  
**Status:** ❌ Unreachable  
**Expected Endpoints:**
- GET /thoughts
- POST /thoughts  
- GET /thoughts/:id
- PUT /thoughts/:id
- DELETE /thoughts/:id

## Resolution Requirements
1. Start backend server on port 3001
2. Verify server routes are properly mounted
3. Confirm CORS configuration for frontend access
4. Test API connectivity end-to-end
