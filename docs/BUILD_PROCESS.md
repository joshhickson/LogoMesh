
# Build Process Documentation

## Current State (Phase 0)

The build process currently focuses on the core React application logic:

1. **Development Build**
   ```bash
   npm run start
   ```
   - Starts development server
   - Enables hot module reloading
   - Runs on port 3000

2. **Production Build**
   ```bash
   npm run build
   ```
   - Creates optimized production build in `/build`
   - Minifies and bundles all assets
   - Generates source maps

## Testing
```bash
npm test
```
- Runs Jest tests for React components
- Includes core module tests in `/core/__tests__`
- Generates coverage reports

## Planned Enhancements (Phase 1)

1. **Core Package Evolution**
   - If `/core` grows significantly, may split into separate package
   - Will introduce dedicated build/test pipeline for core logic

2. **Testing Improvements**
   - Enhanced integration testing
   - End-to-end test automation
   - Performance benchmarking

## Continuous Integration

Currently using GitHub Actions for:
- Automated testing
- Linting
- Build verification

## Deployment

Using Replit's built-in deployment features:
- Automatic builds on changes
- Production serving via `serve -s build`
