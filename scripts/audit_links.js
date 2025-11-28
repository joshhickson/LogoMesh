const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const TARGET_DIRS = ['docs', 'logs'];
const OUTPUT_FILE = path.join(ROOT_DIR, 'logs/technical/josh-temp/20251128-link-audit.csv');

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

const results = [];
// Header
results.push('SourceFile,Line,LinkText,RawTarget,ResolvedTarget,Status,Type');

console.log('Starting All-Intensive Link Audit...');

TARGET_DIRS.forEach(targetDir => {
    const absTargetDir = path.join(ROOT_DIR, targetDir);
    walkDir(absTargetDir, (filePath) => {
        if (path.extname(filePath) !== '.md') return;

        const sourceRelPath = getRelativePath(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Regex for [text](url) - Improved to be less greedy and handle some edge cases
            // Note: This is still a heuristic regex and might fail on nested brackets
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            let match;

            while ((match = linkRegex.exec(line)) !== null) {
                const text = match[1].replace(/"/g, '""'); // Escape quotes for CSV
                const rawTarget = match[2].trim();

                let resolvedTarget = '';
                let status = 'UNKNOWN';
                let type = 'INTERNAL';

                // 1. Check External
                if (rawTarget.startsWith('http') || rawTarget.startsWith('mailto:')) {
                    type = 'EXTERNAL';
                    status = 'IGNORED';
                    resolvedTarget = rawTarget;
                }
                // 2. Check Anchors
                else if (rawTarget.startsWith('#')) {
                    type = 'ANCHOR';
                    status = 'SKIPPED';
                    resolvedTarget = rawTarget;
                }
                // 3. Internal Links
                else {
                    // Strip anchor from target for file check
                    const targetWithoutAnchor = rawTarget.split('#')[0];

                    if (targetWithoutAnchor.startsWith('/')) {
                        // Root relative (rare in MD, but possible)
                        resolvedTarget = targetWithoutAnchor.substring(1); // Remove leading slash
                        // Assuming relative to project root
                        const absTarget = path.join(ROOT_DIR, resolvedTarget);
                         if (fs.existsSync(absTarget)) {
                            status = 'OK';
                        } else {
                            status = 'BROKEN';
                        }
                    } else {
                        // Relative to current file
                        const currentDir = path.dirname(filePath);
                        const absTarget = path.resolve(currentDir, targetWithoutAnchor);
                        resolvedTarget = getRelativePath(absTarget);

                        if (fs.existsSync(absTarget)) {
                            status = 'OK';
                        } else {
                            status = 'BROKEN';
                        }
                    }
                }

                // CSV Row
                results.push(`"${sourceRelPath}",${lineNum},"${text}","${rawTarget}","${resolvedTarget}",${status},${type}`);
            }
        });
    });
});

console.log(`Audit complete. Found ${results.length - 1} links.`);
fs.writeFileSync(OUTPUT_FILE, results.join('\n'));
console.log(`Results written to: ${OUTPUT_FILE}`);
