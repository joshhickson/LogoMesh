const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_ID = process.argv.find(arg => arg.startsWith('--batch='))?.split('=')[1];

// --- Configuration: The Target Architecture ---
const ALL_MAPPINGS = [
    // BATCH 1: Strategy (Pillar 1)
    { batch: '1', pattern: /^docs\/strategy_and_ip\/.*/, targetDir: 'docs/00-Strategy/IP' },
    { batch: '1', pattern: /^logs\/ip_and_business\/.*/, targetDir: 'docs/00-Strategy/Business' },
    { batch: '1', pattern: /^logs\/competition\/.*/, targetDir: 'docs/00-Strategy/Competition' },

    // BATCH 2: Architecture & Engineering (Pillars 2 & 3)
    { batch: '2', source: 'docs/EVAL_OUTPUT_SCHEMA.md', target: 'docs/01-Architecture/Specs/Evaluation-Output-Schema.md' },
    { batch: '2', source: 'docs/CONTEXTUAL_DEBT_SPEC.md', target: 'docs/01-Architecture/Specs/Contextual-Debt-Spec.md' },
    { batch: '2', source: 'docs/CI_COMPOSE_E2E_WORKFLOW.md', target: 'docs/01-Architecture/Diagrams/CI-Workflow.md' },
    { batch: '2', source: 'docs/GAP_ANALYSIS_FOR_DATASCIENTIST.md', target: 'docs/02-Engineering/Setup/Data-Scientist-Gap-Analysis.md' },
    { batch: '2', source: 'docs/onboarding/README.md', target: 'docs/02-Engineering/Setup/Onboarding_Guide.md' },
    { batch: '2', source: 'docs/PROJECT_STATUS.md', target: 'docs/02-Engineering/Setup/Project_Status.md' },
    {
        batch: '2',
        pattern: /^logs\/technical\/.*(REPORT|Report|Verification|Validation).*\.md$/,
        targetDir: 'docs/02-Engineering/Verification'
    },

    // BATCH 3: Research & Operations (Pillars 4 & 5)
    { batch: '3', pattern: /^logs\/research\/.*/, targetDir: 'docs/03-Research/Theory' },
    { batch: '3', pattern: /^logs\/technical\/.*/, targetDir: 'docs/04-Operations/Intent-Log/Technical' },
    { batch: '3', pattern: /^logs\/onboarding-logs\/.*/, targetDir: 'docs/04-Operations/Team' },
    { batch: '3', pattern: /^docs\/intent_log\/.*/, targetDir: 'docs/04-Operations/Intent-Log' },

    // BATCH 4: Archives & Safety
    { batch: '4', source: 'logs/README.md', target: 'docs/Archive/Legacy-Logs/LOGS_README.md' },
    { batch: '4', pattern: /^logs\/archive\/.*/, targetDir: 'docs/Archive/Legacy-Logs' },
];

const MAPPINGS = BATCH_ID ? ALL_MAPPINGS.filter(m => m.batch === BATCH_ID) : ALL_MAPPINGS;

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
        const fileName = path.basename(sourcePath);
        return path.join(patternMatch.targetDir, fileName);
    }

    return null; // No match = Leave it (or handle as orphan)
}

function getRelativeLink(fromFile, toFile) {
    const fromDir = path.dirname(fromFile);
    let rel = path.relative(fromDir, toFile);
    if (!rel.startsWith('.')) rel = './' + rel;
    return rel;
}

// --- Main Logic ---

console.log(`Starting Restructure (Dry Run: ${DRY_RUN})...`);

// 1. Scan & Plan
const allDocs = [
    ...getAllFiles('docs'),
    ...getAllFiles('logs')
].filter(f => !f.includes('node_modules') && !f.includes('.DS_Store'));

const movePlan = []; // { source, target }
const redirectMap = new Map(); // OldPath -> NewPath

allDocs.forEach(source => {
    let target = resolveTarget(source);

    // Safety: If no target, and it's in logs/, move to Archive/Unsorted
    // ONLY do this if we are not in a specific batch, OR if we are in the final batch (4)
    if (!target && source.startsWith('logs/') && (!BATCH_ID || BATCH_ID === '4')) {
        target = path.join('docs/Archive/Unsorted', path.relative('logs', source));
    }

    if (target && target !== source) {
        // Collision Check
        if (movePlan.find(p => p.target === target)) {
            const ext = path.extname(target);
            const base = path.basename(target, ext);
            target = path.join(path.dirname(target), `${base}_dup${ext}`);
        }
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

    // Safety check for case-insensitive file systems (renaming file to itself with different case)
    if (absSource.toLowerCase() === absTarget.toLowerCase() && absSource !== absTarget) {
         fs.renameSync(absSource, absSource + '.temp');
         fs.renameSync(absSource + '.temp', absTarget);
    } else {
         fs.renameSync(absSource, absTarget);
    }
});

if (DRY_RUN) return;

// 3. Update Links
// We need to re-scan the NEW structure to find the files we just moved/left
const newDocs = Array.from(redirectMap.values());

newDocs.forEach(currentPath => {
    if (!currentPath.endsWith('.md')) return; // Only process Markdown links
    const absPath = path.join(ROOT_DIR, currentPath);
    if (!fs.existsSync(absPath)) return;

    let content = fs.readFileSync(absPath, 'utf8');
    let modified = false;

    // Regex for [Label](Path)
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, linkTarget) => {
        if (linkTarget.startsWith('http') || linkTarget.startsWith('#') || linkTarget.startsWith('mailto:')) return match;

        // Resolve the OLD absolute path of the link target
        // We have to work backwards:
        // 1. Who is this file? 'currentPath' (New Location)
        // 2. But the CONTENT is still from the 'oldSource' (Old Location).
        //    Wait, relative links in the content are relative to the OLD location.

        // FIND THE OLD SOURCE of this file
        let oldSource = null;
        for (const [key, val] of redirectMap.entries()) {
            if (val === currentPath) { oldSource = key; break; }
        }
        if (!oldSource) oldSource = currentPath; // Was never moved

        const oldSourceDir = path.dirname(path.join(ROOT_DIR, oldSource));

        // Resolve target based on OLD structure
        let oldAbsTarget;
        try {
            oldAbsTarget = path.resolve(oldSourceDir, linkTarget.split('#')[0]);
        } catch (e) { return match; }

        const oldRelTarget = path.relative(ROOT_DIR, oldAbsTarget); // e.g. "docs/foo.md"

        // Look up where that target went
        const newTarget = redirectMap.get(oldRelTarget);

        if (newTarget) {
            // Calculate new relative link from Current File (New Loc) to Target (New Loc)
            const newLink = getRelativeLink(path.join(ROOT_DIR, currentPath), path.join(ROOT_DIR, newTarget));
            modified = true;
            return `[${label}](${newLink})`;
        } else {
            console.warn(`[WARN] Could not resolve link in ${currentPath}: ${linkTarget} (Old Target: ${oldRelTarget})`);
            return match; // Leave it broken? Or flag it?
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

removeEmptyDirs(path.join(ROOT_DIR, 'logs'));
removeEmptyDirs(path.join(ROOT_DIR, 'docs')); // Clean up old empty doc folders

console.log('Restructure Complete.');
