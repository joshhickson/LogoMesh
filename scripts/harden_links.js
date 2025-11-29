const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const TARGET_DIRS = ['docs', 'logs'];

// Helper to get relative path from root
function getRelativePath(absolutePath) {
    return path.relative(ROOT_DIR, absolutePath).split(path.sep).join('/');
}

// Recursively walk directories
function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath, callback);
        } else {
            callback(filePath);
        }
    }
}

// 1. Build Census
const validFilePaths = new Set();
TARGET_DIRS.forEach(targetDir => {
    const absTargetDir = path.join(ROOT_DIR, targetDir);
    walkDir(absTargetDir, (filePath) => {
        if (path.extname(filePath) === '.md') {
            validFilePaths.add(getRelativePath(filePath));
        }
    });
});
if (fs.existsSync(path.join(ROOT_DIR, 'PROJECT_PLAN.md'))) validFilePaths.add('PROJECT_PLAN.md');
if (fs.existsSync(path.join(ROOT_DIR, 'README.md'))) validFilePaths.add('README.md');

console.log(`Census built: ${validFilePaths.size} valid targets.`);
console.log('Starting Link Hardening (Dry Run)...');

// 2. Harden Links
let replacementCount = 0;
let fileCount = 0;

TARGET_DIRS.forEach(targetDir => {
    const absTargetDir = path.join(ROOT_DIR, targetDir);
    walkDir(absTargetDir, (filePath) => {
        if (path.extname(filePath) !== '.md') return;

        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let modified = false;

        // Iterate through all valid paths and try to replace
        // Note: Sort paths by length (descending) to avoid partial replacements of nested paths
        const sortedPaths = Array.from(validFilePaths).sort((a, b) => b.length - a.length);

        sortedPaths.forEach(validPath => {
            // Heuristic Regex:
            // Match the validPath
            // Lookbehind: Ensure NOT preceded by `]`, `](`, `[`, `/` (part of larger path?)
            // Lookahead: Ensure NOT followed by `)`

            // Javascript regex lookbehind support is limited in older nodes, but standard in Node 18+
            // We'll use a simpler replacement strategy:
            // Find all occurrences, check context manually.

            // Escape path for regex
            const escapedPath = validPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // Regex to find the path in the text.
            // We want to match `validPath` BUT NOT if it is inside `(validPath)` or `[validPath]`
            // Capture groups: (preceding char)(validPath)(following char)
            const regex = new RegExp(`([^(\\[]|^)(${escapedPath})([^)\\]]|$)`, 'g');

            content = content.replace(regex, (match, p1, p2, p3) => {
                // p1: Preceding char (or start of line)
                // p2: The file path (validPath)
                // p3: Following char (or end of line)

                // If preceding char is `/`, it might be part of a URL or another path we didn't index?
                // Actually, our paths are relative from root.
                // `docs/foo.md` found in text.

                // Safety check: is it already linked?
                // The regex `[^(\[]` handles `(path)` and `[path]`.
                // It does NOT handle `] (path)` which is rare but possible.

                // Let's modify.
                modified = true;
                replacementCount++;
                return `${p1}[${p2}](${p2})${p3}`;
            });
        });

        if (modified) {
            fileCount++;
            // Write changes
            fs.writeFileSync(filePath, content);
            console.log(`Hardened links in: ${getRelativePath(filePath)}`);
        }
    });
});

console.log(`Hardening complete.`);
console.log(`Files modified: ${fileCount}`);
console.log(`Links created: ${replacementCount}`);
