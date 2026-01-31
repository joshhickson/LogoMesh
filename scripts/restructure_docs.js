const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const DRY_RUN = process.argv.includes('--dry-run');

// --- Configuration: The Target Architecture ---
const MAPPINGS = [
    // 1. Consolidate Archives
    { pattern: /^docs\/Archive\/02-Engineering\/.*/, targetDir: 'docs/Archive/Legacy-Pillars/Engineering' },
    { pattern: /^docs\/Archive\/03-Research\/.*/, targetDir: 'docs/Archive/Legacy-Pillars/Research' },
    { pattern: /^docs\/Archive\/Business\/.*/, targetDir: 'docs/Archive/Legacy-Pillars/Business' },
    { pattern: /^docs\/Archive\/Competition\/.*/, targetDir: 'docs/Archive/Legacy-Pillars/Competition' },
    { pattern: /^docs\/Archive\/Team\/.*/, targetDir: 'docs/Archive/Legacy-Pillars/Team' },
    { pattern: /^docs\/Archive\/Architecture\/.*/, targetDir: 'docs/Archive/Legacy-Pillars/Architecture' },

    // 2. Logs Consolidation
    { pattern: /^docs\/Archive\/Intent-Log\/.*/, targetDir: 'docs/Archive/Logs/Intent-Log' },
    { pattern: /^docs\/Archive\/Legacy-Logs\/.*/, targetDir: 'docs/Archive/Logs/Legacy-Logs' },
    { pattern: /^docs\/Archive\/agentbeats-lambda\/.*/, targetDir: 'docs/Archive/Logs/Legacy-Components/agentbeats-lambda' },

    // 3. Lowercase 'archive' merge (Handle casing issues)
    { pattern: /^docs\/archive\/([^/]+)\/.*/, targetDir: 'docs/Archive/Legacy-Pillars/Old-Archive/$1' },
    { source: 'docs/archive/index.rst', target: 'docs/Archive/Legacy-Pillars/Old-Archive/index.rst' }
];

// --- Helpers ---

function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            fileList.push(path.relative(ROOT_DIR, filePath));
        }
    });
    return fileList;
}

function resolveTarget(sourcePath) {
    // Check exact matches first
    const exactMatch = MAPPINGS.find(m => m.source === sourcePath);
    if (exactMatch) return exactMatch.target;

    // Check regex patterns
    const patternMatch = MAPPINGS.find(m => m.pattern && m.pattern.test(sourcePath));
    if (patternMatch) {
        // We need to preserve the filename AND the relative path structure *after* the matched folder
        // E.g. docs/Archive/02-Engineering/Setup/foo.md -> docs/Archive/Legacy-Pillars/Engineering/Setup/foo.md

        // Find the part of the path that matched the regex
        // This is tricky with varying regexes.
        // Simplification: We assume the regex matches the *root* of the move.
        // We can split the source path and try to re-assemble.

        // Strategy: Remove the prefix that matched the 'pattern' broadly?
        // No, let's just use path.basename for flat moves, or use string replacement.

        // Actually, for the Archive restructure, we want to KEEP the sub-structure.
        // e.g. 02-Engineering/Setup/ -> Legacy-Pillars/Engineering/Setup/

        // Let's implement a heuristic: replace the matched folder prefix.
        if (sourcePath.startsWith('docs/Archive/02-Engineering/')) {
            return sourcePath.replace('docs/Archive/02-Engineering/', 'docs/Archive/Legacy-Pillars/Engineering/');
        }
        if (sourcePath.startsWith('docs/Archive/03-Research/')) {
            return sourcePath.replace('docs/Archive/03-Research/', 'docs/Archive/Legacy-Pillars/Research/');
        }
        if (sourcePath.startsWith('docs/Archive/Business/')) {
            return sourcePath.replace('docs/Archive/Business/', 'docs/Archive/Legacy-Pillars/Business/');
        }
        if (sourcePath.startsWith('docs/Archive/Competition/')) {
            return sourcePath.replace('docs/Archive/Competition/', 'docs/Archive/Legacy-Pillars/Competition/');
        }
        if (sourcePath.startsWith('docs/Archive/Team/')) {
            return sourcePath.replace('docs/Archive/Team/', 'docs/Archive/Legacy-Pillars/Team/');
        }
        if (sourcePath.startsWith('docs/Archive/Architecture/')) {
            return sourcePath.replace('docs/Archive/Architecture/', 'docs/Archive/Legacy-Pillars/Architecture/');
        }
        if (sourcePath.startsWith('docs/Archive/Intent-Log/')) {
            return sourcePath.replace('docs/Archive/Intent-Log/', 'docs/Archive/Logs/Intent-Log/');
        }
        if (sourcePath.startsWith('docs/Archive/Legacy-Logs/')) {
            return sourcePath.replace('docs/Archive/Legacy-Logs/', 'docs/Archive/Logs/Legacy-Logs/');
        }
        if (sourcePath.startsWith('docs/Archive/agentbeats-lambda/')) {
            return sourcePath.replace('docs/Archive/agentbeats-lambda/', 'docs/Archive/Logs/Legacy-Components/agentbeats-lambda/');
        }

        if (sourcePath.startsWith('docs/archive/')) {
             return sourcePath.replace('docs/archive/', 'docs/Archive/Legacy-Pillars/Old-Archive/');
        }

        const fileName = path.basename(sourcePath);
        return path.join(patternMatch.targetDir, fileName);
    }

    return null; // No match = Leave it
}

function getRelativeLink(fromFile, toFile) {
    const fromDir = path.dirname(fromFile);
    let rel = path.relative(fromDir, toFile);
    if (!rel.startsWith('.')) rel = './' + rel;
    return rel;
}

// --- Main Logic ---

console.log(`Starting Archive Restructure (Dry Run: ${DRY_RUN})...`);

// 1. Scan & Plan
// Only scan docs/Archive and docs/archive
const allDocs = [
    ...getAllFiles('docs/Archive'),
    ...getAllFiles('docs/archive')
].filter(f => !f.includes('node_modules') && !f.includes('.DS_Store'));

const movePlan = []; // { source, target }
const redirectMap = new Map(); // OldPath -> NewPath

allDocs.forEach(source => {
    let target = resolveTarget(source);

    if (target && target !== source) {
        movePlan.push({ source, target });
        redirectMap.set(source, target);
    } else {
        // File stays put
        redirectMap.set(source, source);
    }
});

console.log(`Planned ${movePlan.length} moves.`);

// 2. Execute Moves
movePlan.forEach(({ source, target }) => {
    const absSource = path.join(ROOT_DIR, source);
    const absTarget = path.join(ROOT_DIR, target);
    const targetDir = path.dirname(absTarget);

    if (DRY_RUN) {
        console.log(`[MOVE] ${source} -> ${target}`);
        return;
    }

    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Safety check for case-insensitive file systems
    if (absSource.toLowerCase() === absTarget.toLowerCase() && absSource !== absTarget) {
         fs.renameSync(absSource, absSource + '.temp');
         fs.renameSync(absSource + '.temp', absTarget);
    } else {
         fs.renameSync(absSource, absTarget);
    }
});

if (DRY_RUN) return;

// 3. Update Links (Heavier scan needed to update links pointing TO the archive)
// We need to scan ALL docs to fix links pointing into the archive
const allProjectDocs = getAllFiles('docs').filter(f => f.endsWith('.md'));

allProjectDocs.forEach(currentPath => {
    const absPath = path.join(ROOT_DIR, currentPath);
    if (!fs.existsSync(absPath)) return;

    let content = fs.readFileSync(absPath, 'utf8');
    let modified = false;

    // Regex for [Label](Path)
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, linkTarget) => {
        if (linkTarget.startsWith('http') || linkTarget.startsWith('#') || linkTarget.startsWith('mailto:')) return match;

        // Resolve absolute path of link target from the current file's perspective
        let oldAbsTarget;
        try {
            oldAbsTarget = path.resolve(path.dirname(absPath), linkTarget.split('#')[0]);
        } catch (e) { return match; }

        const oldRelTarget = path.relative(ROOT_DIR, oldAbsTarget); // e.g. "docs/Archive/02-Engineering/foo.md"

        // Check if this target was moved
        const newTarget = redirectMap.get(oldRelTarget);

        if (newTarget && newTarget !== oldRelTarget) {
            // Calculate new relative link
            const newLink = getRelativeLink(absPath, path.join(ROOT_DIR, newTarget));
            modified = true;
            // Preserve hash if present
            const hash = linkTarget.includes('#') ? '#' + linkTarget.split('#')[1] : '';
            return `[${label}](${newLink}${hash})`;
        } else {
            return match;
        }
    });

    if (modified) {
        fs.writeFileSync(absPath, content);
        console.log(`[UPDATE] Fixed links in ${currentPath}`);
    }
});

// 4. Cleanup Empty Dirs
function removeEmptyDirs(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    if (files.length > 0) {
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) removeEmptyDirs(fullPath);
        });
    }
    // Re-check
    if (fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
        console.log(`[CLEAN] Removed empty dir: ${path.relative(ROOT_DIR, dir)}`);
    }
}

removeEmptyDirs(path.join(ROOT_DIR, 'docs/Archive'));
removeEmptyDirs(path.join(ROOT_DIR, 'docs/archive'));

console.log('Restructure Complete.');
