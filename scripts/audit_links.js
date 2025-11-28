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

// 1. Build a Census of ALL Markdown files in the repo
const validFilePaths = new Set();

console.log('Building Census...');
TARGET_DIRS.forEach(targetDir => {
    const absTargetDir = path.join(ROOT_DIR, targetDir);
    walkDir(absTargetDir, (filePath) => {
        if (path.extname(filePath) === '.md') {
            const relPath = getRelativePath(filePath);
            validFilePaths.add(relPath);
        }
    });
});

// Add root files manually
if (fs.existsSync(path.join(ROOT_DIR, 'PROJECT_PLAN.md'))) validFilePaths.add('PROJECT_PLAN.md');
if (fs.existsSync(path.join(ROOT_DIR, 'README.md'))) validFilePaths.add('README.md');

console.log(`Indexed ${validFilePaths.size} valid targets.`);

const results = [];
results.push('SourceFile,Line,LinkText,RawTarget,ResolvedTarget,Status,Type');

console.log('Starting All-Intensive Link Audit (v2.1 - Implicit Support)...');

TARGET_DIRS.forEach(targetDir => {
    const absTargetDir = path.join(ROOT_DIR, targetDir);
    walkDir(absTargetDir, (filePath) => {
        if (path.extname(filePath) !== '.md') return;

        const sourceRelPath = getRelativePath(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // --- Pass 1: Explicit Markdown Links ---
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            let match;
            while ((match = linkRegex.exec(line)) !== null) {
                const text = match[1].replace(/"/g, '""');
                const rawTarget = match[2].trim();

                let resolvedTarget = '';
                let status = 'UNKNOWN';
                let type = 'INTERNAL';

                if (rawTarget.startsWith('http') || rawTarget.startsWith('mailto:')) {
                    type = 'EXTERNAL';
                    status = 'IGNORED';
                    resolvedTarget = rawTarget;
                } else if (rawTarget.startsWith('#')) {
                    type = 'ANCHOR';
                    status = 'SKIPPED';
                    resolvedTarget = rawTarget;
                } else {
                    const targetWithoutAnchor = rawTarget.split('#')[0];
                    if (targetWithoutAnchor.startsWith('/')) {
                        resolvedTarget = targetWithoutAnchor.substring(1);
                        if (fs.existsSync(path.join(ROOT_DIR, resolvedTarget))) status = 'OK';
                        else status = 'BROKEN';
                    } else {
                        const currentDir = path.dirname(filePath);
                        const absTarget = path.resolve(currentDir, targetWithoutAnchor);
                        resolvedTarget = getRelativePath(absTarget);
                        if (fs.existsSync(absTarget)) status = 'OK';
                        else status = 'BROKEN';
                    }
                }
                results.push(`"${sourceRelPath}",${lineNum},"${text}","${rawTarget}","${resolvedTarget}",${status},${type}`);
            }

            // --- Pass 2: Implicit Links (Plaintext Paths) ---
            validFilePaths.forEach(validPath => {
                if (line.includes(validPath)) {
                    // Filter explicit links (heuristic)
                    if (line.includes(`](${validPath}`)) return;
                    if (line.includes(`] (/${validPath}`)) return;

                    results.push(`"${sourceRelPath}",${lineNum},"${validPath}","${validPath}","${validPath}",OK,IMPLICIT`);
                }
            });
        });
    });
});

console.log(`Audit complete. Found ${results.length - 1} links.`);
fs.writeFileSync(OUTPUT_FILE, results.join('\n'));
