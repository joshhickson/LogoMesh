
# Error Tracking & Exports

This directory contains organized error logs and exports for debugging and resolution tracking.

## Directory Structure

- `build_errors/` - Module build failures, syntax errors, compilation issues
- `runtime_errors/` - Runtime JavaScript/React errors
- `api_errors/` - Backend API connection and response errors
- `test_errors/` - Jest/testing framework errors
- `resolved/` - Archive of resolved errors for reference

## Error Export Format

When exporting errors, please include:
- Timestamp
- Error type/category
- Full error message
- File path and line number (if available)
- Steps to reproduce
- Resolution status

## Current Known Issues

### Build Errors
- [ ] Sidebar.tsx syntax error at line 323 (JSX formatting)

### API Errors  
- [ ] Backend server not running on port 3001
- [ ] NetworkError when fetching /thoughts endpoint

### Style Warnings
- [ ] Invalid box-shadow CSS properties (multiple instances)
