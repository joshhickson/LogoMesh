const fs = require('fs');
const path = require('path');
const { stripFencedCodeBlocks, parseExplicitLinks, findImplicitLinks } = require('./lib/link_parser');

const ROOT_DIR = process.cwd();
const TARGET_DIRS = ['docs'];
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs/04-Operations/Intent-Log/Technical/reference_manifest.csv');

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

// 1. Build a Census of ALL files in the repo (not just MD) to verify targets
const validFilePaths = new Set();

console.log('Building Census...');
// We want to index EVERYTHING so we can verify links to code, images, etc.
// But we primarily scan 'docs', 'scripts', 'packages' etc. for *targets*.
// Let's index the whole root, excluding node_modules and .git
function buildCensus(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.turbo') continue;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            buildCensus(filePath);
        } else {
            validFilePaths.add(getRelativePath(filePath));
        }
    }
}
buildCensus(ROOT_DIR);

console.log(`Indexed ${validFilePaths.size} valid targets.`);

const results = [];
results.push('SourceFile,Line,LinkText,RawTarget,ResolvedTarget,Status,Type');

console.log('Starting All-Intensive Link Audit (v3.0 - Reference Manifest)...');

TARGET_DIRS.forEach(targetDir => {
    const absTargetDir = path.join(ROOT_DIR, targetDir);
    walkDir(absTargetDir, (filePath) => {
        if (path.extname(filePath) !== '.md') return;

        const sourceRelPath = getRelativePath(filePath);
        let content = fs.readFileSync(filePath, 'utf8');

        // --- PRE-PROCESS: Strip Fenced Code Blocks ---
        // We do this ONCE per file to avoid false positives in code.
        // We keep line numbers intact.
        content = stripFencedCodeBlocks(content);

        const lines = content.split('\n');

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // --- Pass 1: Explicit Links (Markdown, Wiki, Reference, HTML) ---
            const explicitLinks = parseExplicitLinks(line, lineNum);

            explicitLinks.forEach(link => {
                let resolvedTarget = '';
                let status = 'UNKNOWN';
                let type = 'INTERNAL'; // Default, will refine

                const rawTarget = link.rawTarget;

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

                    // Logic for resolving relative paths
                    let absTarget;

                    // Wiki-Link Specific: Treat [[Filename]] as potential file match
                    if (link.type === 'WIKI') {
                        // 1. Try relative to current file (exact)
                        // 2. Try relative to current file (with .md)
                        // 3. Try finding by basename in Census (Global search) - simplified logic: relative first

                        // For now, standard resolution:
                        const currentDir = path.dirname(filePath);

                        // Check exact
                        let candidate = path.resolve(currentDir, targetWithoutAnchor);
                        if (fs.existsSync(candidate)) absTarget = candidate;
                        else {
                            // Check with .md
                            candidate = path.resolve(currentDir, targetWithoutAnchor + '.md');
                            if (fs.existsSync(candidate)) absTarget = candidate;
                            else {
                                // Fallback: Check if validFilePaths has it at root or elsewhere?
                                // Wiki-links often imply a flat namespace or search.
                                // Let's try root relative if not found relative.
                                candidate = path.join(ROOT_DIR, targetWithoutAnchor);
                                if (fs.existsSync(candidate)) absTarget = candidate;
                                else if (fs.existsSync(candidate + '.md')) absTarget = candidate + '.md';
                            }
                        }
                    } else {
                        // Standard Markdown / HTML / Reference
                        if (targetWithoutAnchor.startsWith('/')) {
                            // Root relative
                            absTarget = path.join(ROOT_DIR, targetWithoutAnchor.substring(1));
                        } else {
                            // Relative
                            const currentDir = path.dirname(filePath);
                            absTarget = path.resolve(currentDir, targetWithoutAnchor);
                        }
                    }

                    if (absTarget && fs.existsSync(absTarget)) {
                        status = 'OK';
                        resolvedTarget = getRelativePath(absTarget);
                    } else {
                        status = 'BROKEN';
                        // Keep the intended path for report
                        // If we constructed an absTarget, show its relative form or just the raw
                        resolvedTarget = absTarget ? getRelativePath(absTarget) : rawTarget;
                    }
                }

                // Escape quotes for CSV
                const textSafe = link.text.replace(/"/g, '""');
                const rawSafe = rawTarget.replace(/"/g, '""');
                const resolvedSafe = resolvedTarget.replace(/"/g, '""');

                results.push(`"${sourceRelPath}",${lineNum},"${textSafe}","${rawSafe}","${resolvedSafe}",${status},${link.type}`);
            });

            // --- Pass 2: Implicit Links (Strict Matching) ---
            // Only search for implicit links if no explicit links overlap?
            // Or just search anyway. Overlaps are rare with strict matching on stripped code.
            // But we should filter if the implicit link found IS the rawTarget of an explicit link on the same line.

            const implicitLinks = findImplicitLinks(line, lineNum, validFilePaths);

            implicitLinks.forEach(link => {
                // Filter: If this text was already part of an explicit link's target, ignore it.
                // Simple heuristic: check if rawTarget is substring of any explicit link rawTarget
                const isExplicit = explicitLinks.some(el => el.rawTarget.includes(link.text));

                if (!isExplicit) {
                    const textSafe = link.text.replace(/"/g, '""');
                    // Implicit links are their own target and resolved target (since we verified they exist)
                    // Wait, findImplicitLinks verifies existence, but does it return the full path?
                    // It returns the matched text. We need to resolve it to the full path if it was a basename match.

                    let resolvedImplicit = link.text;
                    // Re-resolve to get full path if it was a partial match
                    for (const validPath of validFilePaths) {
                        const basename = path.basename(validPath);
                        const nameNoExt = path.parse(validPath).name;
                        if (validPath === link.text || basename === link.text || nameNoExt === link.text) {
                            resolvedImplicit = validPath;
                            break;
                        }
                    }

                    results.push(`"${sourceRelPath}",${lineNum},"${textSafe}","${textSafe}","${resolvedImplicit}",OK,IMPLICIT`);
                }
            });
        });
    });
});

// Create directory if it doesn't exist
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Audit complete. Found ${results.length - 1} links.`);
fs.writeFileSync(OUTPUT_FILE, results.join('\n'));
console.log(`Reference Manifest written to: ${OUTPUT_FILE}`);
