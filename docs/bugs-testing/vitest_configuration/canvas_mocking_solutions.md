
# Canvas Component Testing Solutions

## Problem Overview
Canvas-based components (using Cytoscape.js) fail in Vitest/jsdom environment because browser APIs like `HTMLCanvasElement.prototype.getContext` are not available.

## Error Symptoms
```
HTMLCanvasElement.prototype.getContext is not a function
TypeError: Cannot read properties of undefined (reading 'getContext')
```

## Solution Approaches

### 1. Component-Level Mocking (Recommended)
Mock the entire Canvas component to avoid browser API calls:

```javascript
import { vi } from 'vitest';

vi.mock('../Canvas', () => {
  return {
    default: function MockCanvas() {
      return <div data-testid="cytoscape-mock">Canvas Component</div>;
    }
  };
});
```

**Pros:**
- Complete isolation from browser dependencies
- Fast test execution
- No need for complex polyfills

**Cons:**
- Doesn't test actual Canvas functionality
- May miss integration issues

### 2. Library-Level Mocking (Alternative)
Mock specific libraries while keeping component structure:

```javascript
vi.mock('react-cytoscapejs', () => ({
  default: vi.fn(() => <div data-testid="cytoscape-mock" />)
}));

vi.mock('cytoscape-cose-bilkent', () => vi.fn());
```

### 3. Canvas Polyfill (Complex)
Add canvas polyfill for more realistic testing:

```javascript
// In vitest.setup.ts
import 'canvas';
global.HTMLCanvasElement.prototype.getContext = vi.fn();
```

## Recommended Pattern
For LogoMesh project, use Component-Level Mocking for:
- Fast test execution
- Reliable CI/CD pipeline
- Focus on component logic rather than rendering

## Testing Coverage
With mocking, focus tests on:
- Component props handling
- State management
- Event handling
- Data flow
- Component lifecycle
