
# ESLint Configuration & TypeScript Migration Guide

**Version**: 1.0  
**Status**: Week 1, Task 1 Implementation  
**Goal**: Zero ESLint warnings in core/ and server/ per Implementation Plan

## Current Status (2025-07-01)

- ❌ **525 ESLint violations** (483 errors, 42 warnings)
- ❌ **Week 1, Task 1 FAILING** - CI gate not met
- 🔴 **Major blockers**: Extensive `any` usage in core/context/cognitiveContextEngine.ts

## ESLint Configuration Strategy

### Phase 1: Fix Parser Configuration

The current `.eslintrc.json` has TypeScript parser conflicts with declaration files. Required fixes:

```json
{
  "parserOptions": {
    "project": ["./tsconfig.json", "./server/tsconfig.json"],
    "tsconfigRootDir": "."
  },
  "ignorePatterns": [
    "**/*.d.ts",
    "**/*.js.map", 
    "build/", 
    "dist/", 
    "node_modules/",
    "core/**/*.js",
    "contracts/**/*.js"
  ]
}
```

### Phase 2: Strict TypeScript Rules for core/ and server/

Per Implementation Plan: "CI fails immediately on any `any` type or JS file in core/server"

```json
{
  "overrides": [
    {
      "files": ["core/**/*", "server/src/**/*"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-unsafe-assignment": "error",
        "@typescript-eslint/no-unsafe-call": "error",
        "@typescript-eslint/no-unsafe-member-access": "error",
        "@typescript-eslint/no-unsafe-return": "error",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/ban-ts-comment": "error"
      }
    }
  ]
}
```

## Systematic Error Resolution Strategy

### Critical Errors (Must Fix First)

#### 1. TypeScript Parser Service Errors
- **Root Cause**: Missing `tsconfigRootDir` in parser options
- **Fix**: Add proper project references

#### 2. `any` Type Violations (483 instances)
**Priority Files:**
- `core/context/cognitiveContextEngine.ts` - 15+ violations
- `core/llm/LLMOrchestrator.ts` - Multiple violations
- `server/src/routes/*.ts` - Route handler violations

**Strategy**: Replace `any` with proper types:
```typescript
// ❌ Before
function processData(data: any): any {
  return data.someProperty;
}

// ✅ After  
interface ProcessedData {
  someProperty: string;
}
function processData(data: ProcessedData): string {
  return data.someProperty;
}
```

#### 3. Import Statement Violations
**Files**: `server/src/routes/pluginRoutes.ts`
- Replace `require()` with ES6 imports
- Add proper type imports

### Automated Fixing Approach

#### Step 1: Auto-fixable Rules
```bash
# Run auto-fix for safe transformations
npx eslint core/ server/src/ --ext .ts,.tsx --fix --rule @typescript-eslint/no-inferrable-types:error

# Fix import statements
npx eslint core/ server/src/ --ext .ts,.tsx --fix --rule @typescript-eslint/no-var-requires:error
```

#### Step 2: Manual `any` Type Replacement
Create type definitions for the most common violations:

```typescript
// Add to contracts/types.ts
export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ThoughtData {
  id: string;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface PluginManifest {
  name: string;
  version: string;
  capabilities: string[];
  permissions: string[];
}
```

## CI Integration Requirements

### Lint Gate Configuration
```bash
# Add to package.json scripts
"lint:strict": "eslint core/ server/src/ --ext .ts,.tsx --max-warnings 0",
"ci:lint": "npm run lint:strict",
"ci:typecheck": "tsc --noEmit && cd server && tsc --noEmit"
```

### Pre-commit Hooks
```bash
# .husky/pre-commit
npm run ci:lint
npm run ci:typecheck
```

## TypeScript Migration Priorities

### Week 1 Focus: core/ and server/ only
Per Implementation Plan: "Convert only `core/` and `server/` to TS strict - leave `src/` JS until Week 2"

**Already TypeScript:**
- ✅ `core/` directory - 100% TypeScript
- ✅ `server/src/` directory - 100% TypeScript

**Remaining Issues:**
- Type safety violations (483 errors)
- Import statement modernization
- Interface compliance

### Week 2 Stretch: src/ Migration
**Deferred to Week 2:**
- `src/services/graphService.js` → `.ts`
- `src/utils/*.js` files → `.ts`
- React component prop typing

## Performance Considerations

### ESLint Parser Optimization
```json
{
  "parserOptions": {
    "warnOnUnsupportedTypeScriptVersion": false,
    "EXPERIMENTAL_useSourceOfProjectReferenceRedirect": true
  }
}
```

### Incremental Checking Strategy
1. **Fix parser configuration first** - Eliminates 50% of errors
2. **Auto-fix safe rules** - Reduces remaining by 30%
3. **Manual `any` type fixes** - Target biggest violators first
4. **Import modernization** - Final cleanup

## Success Metrics

### Week 1, Task 1 Gates
- [ ] `npx eslint core/ server/src/ --ext .ts,.tsx` returns 0 errors
- [ ] `npx eslint core/ server/src/ --ext .ts,.tsx --max-warnings 0` passes
- [ ] No `any` types in core/ or server/ directories
- [ ] All imports use ES6 syntax
- [ ] TypeScript compilation passes with strict mode

### Test Commands
```bash
# Verify ESLint configuration
npx eslint core/ server/src/ --ext .ts,.tsx > test-results/lint-check-$(date +%Y-%m-%d).txt 2>&1

# Verify TypeScript compilation
npx tsc --noEmit > test-results/typescript-check-$(date +%Y-%m-%d).txt 2>&1
cd server && npx tsc --noEmit >> ../test-results/typescript-check-$(date +%Y-%m-%d).txt 2>&1
```

## Next Steps

1. **Fix ESLint parser configuration** - Resolve project reference issues
2. **Run auto-fix for safe rules** - Eliminate inferrable types and imports
3. **Create type definition contracts** - Replace `any` systematically  
4. **Validate CI gates** - Ensure zero warnings requirement met
5. **Document patterns** - Establish standards for future development

This guide provides the systematic approach needed to pass Week 1, Task 1 verification gates and establish the foundation for the TypeScript migration strategy.
