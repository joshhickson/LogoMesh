const fs = require('fs');
const path = require('path');

const OLD_ROOT = 'preserved-docs-logs';
const MANIFEST_PATH = 'docs/04-Operations/Intent-Log/Technical/Link_Repair_Manifest_20251201.md';
const OUTPUT_PATH = 'docs/04-Operations/Intent-Log/Technical/Link_Repair_Manifest_Phase2_README.md';

// --- 1. Index Old State ---
// We need to know where README.md files existed in the old structure.
// Map: DirectoryPath -> Boolean (hasReadme)
const oldDirHasReadme = new Set();
const oldFileToNewFile = new Map(); // OldPath -> NewPath (Loaded from previous logic ideally, but we can approximate or re-scan)

// Re-implement basic indexing from previous script to build the "Knowledge Base"
function walk(dir, isOld) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);

    // check for README.md in this dir
    if (isOld && items.includes('README.md')) {
        // Store relative path of this dir from preserved-docs-logs
        // dir is like 'preserved-docs-logs/logs/technical'
        const relDir = path.relative(OLD_ROOT, dir);
        oldDirHasReadme.add(relDir);
    }

    for (const item of items) {
        if (item.startsWith('.')) continue;
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, isOld);
        } else {
             // We need to know Old Path -> New Path mapping to know "Old Source Path" of a broken link.
             // This is the hard part without the state from the previous script.
             // But we can rely on the "Migration Map" logic:
             // If we find a file in 'docs/' (New), we need to find its match in 'preserved-docs-logs/' (Old).
        }
    }
}
walk(OLD_ROOT, true);

// We need a helper to find the "Old Path" for a given "New Path" (Source File)
// We can assume filenames are mostly unique or use the same heuristic.
const newPathToOldPath = new Map();

function mapFiles() {
    // Index Old Files
    const oldFiles = new Map(); // filename -> [relPaths]
    function indexOld(dir) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            if (item.startsWith('.')) continue;
            const fp = path.join(dir, item);
            if (fs.statSync(fp).isDirectory()) indexOld(fp);
            else {
                if (!oldFiles.has(item)) oldFiles.set(item, []);
                oldFiles.get(item).push(path.relative(OLD_ROOT, fp));
            }
        }
    }
    if (fs.existsSync(path.join(OLD_ROOT, 'docs'))) indexOld(path.join(OLD_ROOT, 'docs'));
    if (fs.existsSync(path.join(OLD_ROOT, 'logs'))) indexOld(path.join(OLD_ROOT, 'logs'));

    // Index New Files (Source Files from Manifest)
    // Actually, we can just look at the Source File in the manifest.
    // If filename matches an Old File, we map it.
    // If duplicates, we might have trouble, but let's see.
}

// Build simple filename map
const filenameToOldPaths = new Map();
function buildOldIndex(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (item.startsWith('.')) continue;
        const fp = path.join(dir, item);
        if (fs.statSync(fp).isDirectory()) {
            buildOldIndex(fp);
        } else {
            const relPath = path.relative(OLD_ROOT, fp);
            if (!filenameToOldPaths.has(item)) filenameToOldPaths.set(item, []);
            filenameToOldPaths.get(item).push(relPath);
        }
    }
}
buildOldIndex(path.join(OLD_ROOT, 'docs'));
buildOldIndex(path.join(OLD_ROOT, 'logs'));


// --- 2. Parse Manifest ---
const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf8');
const lines = manifestContent.split('\n');
const corrections = [];

// CSV Parser (Simple)
// Source File,Type,Broken String,Proposed Replacement,Confidence
// We only care about lines with "README.md" and "Low"
const fieldRegex = /(?:"((?:""|[^"])*)"|([^,\r\n]*))(?:,|$)/g;

for (const line of lines) {
    if (!line.trim() || line.startsWith('#') || line.startsWith('```') || line.startsWith('Source File')) continue;

    // Parse fields
    const row = [];
    fieldRegex.lastIndex = 0;
    let match;
    // ... reusing the robust parser logic from before effectively
    let currentField = '';
    let inQuotes = false;
    let fieldStart = true;
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (inQuotes) {
            if (char === '"') {
                if (j + 1 < line.length && line[j+1] === '"') { currentField += '"'; j++; }
                else { inQuotes = false; }
            } else { currentField += char; }
        } else {
            if (char === '"' && fieldStart) { inQuotes = true; }
            else if (char === ',') { row.push(currentField); currentField = ''; fieldStart = true; }
            else { currentField += char; fieldStart = false; }
        }
    }
    row.push(currentField);

    if (row.length < 5) continue;
    const sourceFile = row[0];
    const type = row[1];
    const brokenString = row[2];
    const confidence = row[4];

    if (confidence === 'Low' && brokenString.includes('README.md')) {
        // Analyze this one
        const filename = path.basename(sourceFile);

        // Find Old Source Path
        const potentialOldPaths = filenameToOldPaths.get(filename);
        if (!potentialOldPaths || potentialOldPaths.length === 0) {
            console.warn(`Cannot trace ${sourceFile} back to old state.`);
            continue;
        }

        // Assume unique filename or take first match for now (Improvement: use content hash if needed, but "slow approach" allows manual verification)
        const oldSourcePath = potentialOldPaths[0];
        const oldSourceDir = path.dirname(oldSourcePath);

        // Strategy:
        // 1. Check if 'README.md' existed in oldSourceDir
        // 2. Or if broken link is explicit relative path (e.g. '../README.md') check that.

        // Extract the path from the broken string
        // Explicit: [Label](path)
        // Plaintext: path
        let targetPath = '';
        if (type === 'Explicit Link') {
            const m = /\]\((.*?)\)/.exec(brokenString);
            if (m) targetPath = m[1];
        } else {
            targetPath = brokenString;
        }

        // Normalize targetPath (resolve relative to oldSourceDir)
        // Note: targetPath might be 'README.md' or './README.md' or '../README.md'
        // We simulate resolving it from the OLD location.
        // fake root '/'
        const resolvedOldTarget = path.normalize(path.join('/', oldSourceDir, targetPath)).substring(1); // remove leading slash

        // Check if this resolved path existed in Old State
        // resolvedOldTarget is like 'logs/technical/README.md'
        // oldDirHasReadme stores directories relative to OLD_ROOT.
        // We need to check if a file existed.
        // We can check if `filenameToOldPaths` has 'README.md' and if one of them matches `resolvedOldTarget`.

        const allReadmes = filenameToOldPaths.get('README.md') || [];
        const matchedReadme = allReadmes.find(r => r === resolvedOldTarget);

        let proposedReplacement = '';
        let algorithm = '';

        if (matchedReadme) {
            // Case A: Local/Sibling README existed
            // We need to find where THIS README moved to.
            // But we don't have the migration map loaded fully.
            // Assumption: It moved to the corresponding new location in 'docs/'?
            // Wait, migration map was complex.
            // BUT, if we know the Old Path (matchedReadme), we can try to find the New Path.
            // We can scan 'docs/' for a README.md that matches this old one?
            // Or assume structure preservation?
            // "The current docs/ directory has the correct folder structure (the "CIS-Driven" structure)"
            // It's not 1:1.
            // Better: use the 'newPathToOldPath' reverse lookup if we had it.
            // Let's search 'newFiles' for a match.
            // Limitation: We don't have the hash map here.

            // Alternative: Assume if it was 'logs/technical/README.md', and 'logs/technical' items moved to 'docs/04-Operations/Intent-Log/Technical/', then the README likely moved there too.
            // BUT, let's look for *any* README.md in the new destination directory of the SOURCE file.
            // If the Source file is now at 'docs/04-Operations/Intent-Log/Technical/file.md',
            // and the old file was 'logs/technical/file.md',
            // and 'logs/technical/README.md' existed.
            // Then likely 'docs/04-Operations/Intent-Log/Technical/README.md' exists now?

            const newSourceDir = path.dirname(sourceFile);
            const siblingReadmePath = path.join(newSourceDir, 'README.md');

            if (fs.existsSync(siblingReadmePath)) {
                // High probability it's the sibling
                const relPath = path.relative(newSourceDir, siblingReadmePath);
                proposedReplacement = relPath; // 'README.md'
                algorithm = 'Resolved to Sibling (Preserved)';
            } else {
                // Old sibling existed, but New sibling does NOT exist?
                // Maybe it was renamed or moved elsewhere.
                // Fallback to Root? Or Manual?
                proposedReplacement = 'MANUAL_REVIEW';
                algorithm = 'Sibling Missing in New State';
            }

        } else {
            // Case B: No local README found in Old State at the target location.
            // Likely intended to be Root README.
            // Check if target was just "README.md" (implying sibling) or "../README.md".
            // If it was "README.md" and no sibling existed, it was BROKEN in old state or meant Root (Markdown viewers sometimes resolve to root if not found? No.)
            // BUT, users often write [README](README.md) meaning the main project one.

            // Proposed Fix: Link to Repo Root README.
            // New Source: sourceFile
            // Target: 'README.md' (at root)
            // Rel Path: path.relative(path.dirname(sourceFile), 'README.md')

            const relPathToRoot = path.relative(path.dirname(sourceFile), 'README.md');
            proposedReplacement = relPathToRoot;
            algorithm = 'Default to Root README';
        }

        if (proposedReplacement !== 'MANUAL_REVIEW') {
            corrections.push({
                sourceFile,
                type,
                brokenString,
                replacement: proposedReplacement,
                algorithm
            });
        }
    }
}

// --- 3. Output Phase 2 Manifest ---
const csvRows = ['Source File,Type,Broken String,Proposed Replacement,Algorithm'];
for (const c of corrections) {
    const safeBroken = `"${c.brokenString.replace(/"/g, '""')}"`;
    const safeRepl = `"${c.replacement}"`;
    csvRows.push(`"${c.sourceFile}",${c.type},${safeBroken},${safeRepl},${c.algorithm}`);
}

fs.writeFileSync(OUTPUT_PATH, csvRows.join('\n'));
console.log(`Phase 2 Manifest generated with ${corrections.length} proposed fixes.`);
