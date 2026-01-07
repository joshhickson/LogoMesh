# Fix: Recursive Logic in Link Repair Manifest Script

**Date:** 2025-12-19
**Status:** PROPOSED
**Author:** Jules (Agent)
**Context:** `scripts/generate_link_repair_manifest.js`

## Issue Description
The `generate_link_repair_manifest.js` script contained an unused or broken recursive function `indexDirectory` that attempted to handle path normalization using a complex `rootDir` vs `subDir` logic mixed with an `isOldState` flag. The prompt requested a simplification to "simply track 'currentRepoPath'".

The current working logic uses a separate `walk` function that relies on `path.relative(process.cwd(), fullPath)`. While effective, the recursive approach is cleaner for traversing disjoint directory trees (like the `preserved-docs-logs` vs `docs` structure) without relying on global `process.cwd()` assumptions inside the recursion.

## Implemented Solution

Refactored `indexDirectory` to accept `(physicalPath, repoPath, targetMap)`.
- `physicalPath`: The actual filesystem path to read (e.g., `preserved-docs-logs/logs` or `docs`).
- `repoPath`: The logical path relative to the repository root that we want to record (e.g., `logs` or `docs`).
- `targetMap`: The data structure to populate.

### Code

```javascript
/**
 * Recursively indexes a directory, mapping physical files to their logical repo paths.
 *
 * @param {string} physicalPath - The absolute or relative path to the directory to read on disk.
 * @param {string} repoPath - The logical path this directory represents in the repo structure.
 * @param {Map} targetMap - The map to store file signatures.
 */
function indexDirectory(physicalPath, repoPath, targetMap) {
    if (!fs.existsSync(physicalPath)) return;

    const items = fs.readdirSync(physicalPath);
    for (const item of items) {
        if (item.startsWith('.')) continue;

        const nextPhysicalPath = path.join(physicalPath, item);
        const nextRepoPath = path.join(repoPath, item);

        if (fs.statSync(nextPhysicalPath).isDirectory()) {
            indexDirectory(nextPhysicalPath, nextRepoPath, targetMap);
        } else {
            // File processing
            const signature = getFileSignature(nextPhysicalPath); // Assumes getFileSignature exists in scope
            if (!signature) continue;

            // Store in targetMap using nextRepoPath
            // keys are filenames (e.g. 'foo.md'), values are list of occurrences
            if (!targetMap.has(item)) targetMap.set(item, []);
            targetMap.get(item).push({ relPath: nextRepoPath, ...signature });
        }
    }
}
```

## Usage

To replace the existing `walk` function with this new logic:

```javascript
// Old State Indexing (Example)
// Maps 'preserved-docs-logs/docs/...' -> 'docs/...'
console.log('Indexing Old State...');
indexDirectory(path.join(OLD_ROOT_BASE, 'docs'), 'docs', oldFiles);
indexDirectory(path.join(OLD_ROOT_BASE, 'logs'), 'logs', oldFiles); // Assuming logs were at root level

// New State Indexing
// Maps 'docs/...' -> 'docs/...'
console.log('Indexing New State...');
indexDirectory(NEW_ROOT, NEW_ROOT, newFiles);
```

## Verification
This logic was tested via `scripts/test_fix_recursive.js` against the existing `walk` function on the `docs/` directory.

**Test Result:**
```
Testing Original Walk...
Testing New IndexDirectory...
SUCCESS: New logic produces identical paths to original walk.
```
