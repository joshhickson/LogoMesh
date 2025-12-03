const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- Configuration ---
const OLD_ROOT_BASE = 'preserved-docs-logs';
const NEW_ROOT = 'docs';
const DATE_STR = new Date().toISOString().split('T')[0].replace(/-/g, '');
const OUTPUT_FILE = `docs/04-Operations/Intent-Log/Technical/Link_Repair_Manifest_${DATE_STR}.md`;

console.log(`Starting Link Repair Analysis...`);
console.log(`Old State Root: ${OLD_ROOT_BASE}`);
console.log(`New State Root: ${NEW_ROOT}`);
console.log(`Output: ${OUTPUT_FILE}`);

// --- Data Structures ---
// oldFiles: Map<Filename, Array<{ relPath: string, hash: string, firstLines: string }>>
const oldFiles = new Map();
// newFiles: Map<Filename, Array<{ relPath: string, hash: string, firstLines: string }>>
const newFiles = new Map();
// validOldPaths: Set<string> (e.g., 'logs/technical/foo.md')
const validOldPaths = new Set();
// migrationMap: Map<OldPath, NewPath>
const migrationMap = new Map();

// --- Helpers ---
function getFileSignature(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const hash = crypto.createHash('md5').update(content).digest('hex');
    // Normalize newlines for firstLines comparison
    const firstLines = content.replace(/\r\n/g, '\n').split('\n').slice(0, 5).join('\n').trim();
    return { hash, firstLines, content }; // We don't store content in the index to save RAM, but return it here
  } catch (e) {
    console.warn(`Failed to read ${filepath}: ${e.message}`);
    return null;
  }
}

// --- Step 1 & 2: Indexing ---
function indexDirectory(rootDir, subDir, targetMap, isOldState) {
    const fullDir = subDir ? path.join(rootDir, subDir) : rootDir;

    if (!fs.existsSync(fullDir)) return;

    const items = fs.readdirSync(fullDir);
    for (const item of items) {
        if (item.startsWith('.')) continue;
        const itemPath = path.join(fullDir, item);
        const relativePath = subDir ? path.join(subDir, item) : item; // relative to repo root (for old) or docs root?
        // For Old State: we want paths like 'logs/foo.md' or 'docs/foo.md'.
        // rootDir is 'preserved-docs-logs'. subDir is 'logs' or 'docs'.
        // So relativePath is exactly what we want.

        // For New State: rootDir is 'docs'. subDir starts empty.
        // We want paths like 'docs/foo.md'.
        // So we need to prepend 'docs/' if we are strictly talking repo-root relative.
        // Let's standardize: EVERYTHING is repo-root relative.

        let repoRelativePath;
        if (isOldState) {
            repoRelativePath = relativePath;
        } else {
            // new state is rooted at 'docs/'.
            // if subDir is empty, item is 'docs/file.md'
            // Wait, walk logic below needs to be recursive.
            repoRelativePath = path.join(NEW_ROOT, relativePath); // Wait, logic below handles recursion
        }

        if (fs.statSync(itemPath).isDirectory()) {
            indexDirectory(rootDir, relativePath, targetMap, isOldState);
        } else {
            // Standardize repoRelativePath for New State inside recursion
            // The recursive call passes 'relativePath' which is 'subdir/item'.
            // For Old State: 'logs/subdir/item'. Correct.
            // For New State: 'subdir/item'. We need to prepend 'docs/' to make it repo-root relative?
            // Yes, let's fix the recursive logic to just track 'currentRepoPath'.
        }
    }
}

function walk(dir, fileListMap, isOldState) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (item.startsWith('.')) continue;
        const fullPath = path.join(dir, item);

        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, fileListMap, isOldState);
        } else {
            const signature = getFileSignature(fullPath);
            if (!signature) continue;

            const filename = item;
            // Store path relative to REPO ROOT
            // process.cwd() is repo root.
            const relPath = path.relative(process.cwd(), fullPath);

            if (isOldState) {
                 // preserved-docs-logs/logs/foo.md -> logs/foo.md
                 // strip preserved-docs-logs/
                 const stripped = relPath.replace(/^preserved-docs-logs\//, '');
                 if (!fileListMap.has(filename)) fileListMap.set(filename, []);
                 fileListMap.get(filename).push({ relPath: stripped, ...signature });
                 validOldPaths.add(stripped);
            } else {
                 // docs/foo.md -> docs/foo.md
                 if (!fileListMap.has(filename)) fileListMap.set(filename, []);
                 fileListMap.get(filename).push({ relPath, ...signature });
            }
        }
    }
}

console.log('Indexing Old State...');
walk(path.join(OLD_ROOT_BASE, 'docs'), oldFiles, true);
walk(path.join(OLD_ROOT_BASE, 'logs'), oldFiles, true);

console.log('Indexing New State...');
walk(NEW_ROOT, newFiles, false);

// --- Step 3: Migration Map ---
console.log('Building Migration Map...');
let mappedCount = 0;
let totalOld = 0;

for (const [filename, oldInstances] of oldFiles) {
    totalOld += oldInstances.length;

    if (!newFiles.has(filename)) {
        // File deleted or renamed
        continue;
    }

    const newInstances = newFiles.get(filename);

    for (const oldInst of oldInstances) {
        // Find best match in newInstances
        let match = null;

        // 1. Hash Match
        match = newInstances.find(n => n.hash === oldInst.hash);

        // 2. First 5 Lines Match (if no hash match)
        if (!match) {
            match = newInstances.find(n => n.firstLines === oldInst.firstLines);
        }

        // 3. Filename uniqueness (if 1 old and 1 new, assume match even if content changed)
        if (!match && oldInstances.length === 1 && newInstances.length === 1) {
            match = newInstances[0];
        }

        if (match) {
            migrationMap.set(oldInst.relPath, match.relPath);
            mappedCount++;
        }
    }
}
console.log(`Mapped ${mappedCount}/${totalOld} old files to new locations.`);

// --- Step 4: Scan for Decay ---
console.log('Scanning for Broken Links...');

const brokenLinks = [];

function scanFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const filename = path.basename(filepath);
    const repoRelPath = path.relative(process.cwd(), filepath);

    // 1. Explicit Markdown Links: [Label](target)
    const linkRegex = /\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
        const fullMatch = match[0];
        const linkTarget = match[1];

        // Ignore external links, anchors, absolute paths (unless likely internal)
        if (linkTarget.startsWith('http') || linkTarget.startsWith('#') || linkTarget.startsWith('mailto:')) continue;

        // Check if broken
        const currentDir = path.dirname(filepath);
        const absoluteTarget = path.resolve(currentDir, linkTarget);

        if (!fs.existsSync(absoluteTarget)) {
            // BROKEN LINK DETECTED
            // Resolve Strategy: Rosetta Stone
            // 1. Find the 'Old Path' of the current file
            // We need to reverse-lookup current file in Migration Map?
            // Or use the newFiles index to guess which old file this is.

            // It's safer to try to match the current file to an old file.
            // We can check which old file mapped to this 'repoRelPath'.
            let oldSourcePath = null;
            for (const [oldP, newP] of migrationMap.entries()) {
                if (newP === repoRelPath) {
                    oldSourcePath = oldP;
                    break;
                }
            }

            if (oldSourcePath) {
                // We know where this file used to be.
                // Assuming the link was valid in the old location, let's resolve it relative to the Old Source Path.
                // Old Source Path is like 'logs/technical/report.md'.
                // Link Target is '../foo.md'.
                // Intended Old Target = resolve('logs/technical', '../foo.md') -> 'logs/foo.md'

                // Note: path.resolve handles absolute paths, but here we work with repo-relative strings.
                // We can fake it by joining process.cwd() temporarily or just using path.join if careful.
                // Best to use path.resolve on a fake root.

                const fakeRoot = '/ROOT';
                const oldSourceDir = path.dirname(path.join(fakeRoot, oldSourcePath));
                const oldTargetAbs = path.resolve(oldSourceDir, linkTarget);
                const oldTargetRel = path.relative(fakeRoot, oldTargetAbs); // 'logs/foo.md'

                // Is this 'oldTargetRel' a valid old path?
                if (validOldPaths.has(oldTargetRel)) {
                    // Look up new location
                    const newTarget = migrationMap.get(oldTargetRel);
                    if (newTarget) {
                        // Calculate replacement
                        // New Source: filepath
                        // New Target: newTarget (full repo path)
                        const newTargetAbs = path.resolve(process.cwd(), newTarget);
                        const newRelLink = path.relative(path.dirname(filepath), newTargetAbs);

                        brokenLinks.push({
                            source: repoRelPath,
                            type: 'Explicit Link',
                            broken: fullMatch, // User wants "Broken String"
                            replacement: newRelLink, // Just the path, or full link? User said "Proposed Replacement: (The new, correct relative path)"
                            confidence: 'High'
                        });
                        continue;
                    }
                }
            }

            // Fallback: If we couldn't resolve via Rosetta Stone, flag it anyway but with unknown replacement?
            // User only asked for a Manifest of broken links to *repair*.
            // "Your goal is to prepare a "Link Repair Manifest" that mathematically derives the correct new paths"
            // If we can't derive it, maybe we skip or flag as "Manual Review".
            brokenLinks.push({
                source: repoRelPath,
                type: 'Explicit Link',
                broken: fullMatch,
                replacement: 'MANUAL_REVIEW',
                confidence: 'Low'
            });
        }
    }

    // 2. Plaintext Paths
    // Search for strings in validOldPaths
    for (const oldPath of validOldPaths) {
        if (content.includes(oldPath)) {
            // Check if this string is actually inside a broken link we already caught?
            // Or just a standalone text.
            // If the text exists, and that path does NOT exist (it's old), it's a candidate.
            // But 'oldPath' is repo-relative. Does the text imply repo-relative?
            // "implicit path: docs/old/folder/file.md" -> yes.

            const newTarget = migrationMap.get(oldPath);
            if (newTarget) {
                // Proposed replacement should be relative to current file?
                // Or if it was an absolute-looking string, keep it absolute-looking?
                // User said: "Proposed Replacement: (The new, correct relative path)"

                const newTargetAbs = path.resolve(process.cwd(), newTarget);
                const newRelLink = path.relative(path.dirname(filepath), newTargetAbs);

                brokenLinks.push({
                    source: repoRelPath,
                    type: 'Plaintext Path',
                    broken: oldPath,
                    replacement: newRelLink,
                    confidence: 'High'
                });
            }
        }
    }
}

// Recursive scan of NEW_ROOT
function scanDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (item.startsWith('.')) continue;
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (item.endsWith('.md')) {
            scanFile(fullPath);
        }
    }
}

scanDir(NEW_ROOT);

// --- Output ---
// De-duplicate broken links (same source, same broken string)
const uniqueLinks = new Map();
for (const link of brokenLinks) {
    const key = `${link.source}|${link.broken}`;
    // Plaintext might trigger multiple times if the same string appears multiple times?
    // "content.includes" checks existence, not count.
    // If explicit link matches, plaintext scanner might also match if the link contains the path.
    // E.g. [foo](logs/foo.md). Explicit regex catches it. Plaintext scan for 'logs/foo.md' catches it.
    // We should filter.
    if (!uniqueLinks.has(key)) {
        // Prefer Explicit Link over Plaintext if collision
        uniqueLinks.set(key, link);
    } else {
        const existing = uniqueLinks.get(key);
        if (existing.type === 'Plaintext Path' && link.type === 'Explicit Link') {
            uniqueLinks.set(key, link);
        }
    }
}

const csvRows = ['Source File,Type,Broken String,Proposed Replacement,Confidence'];
for (const link of uniqueLinks.values()) {
    // Escape commas in strings
    const safeSource = `"${link.source}"`;
    const safeBroken = `"${link.broken.replace(/"/g, '""')}"`;
    const safeRepl = `"${link.replacement}"`;
    csvRows.push(`${safeSource},${link.type},${safeBroken},${safeRepl},${link.confidence}`);
}

const outputContent = `
# Link Repair Manifest (${DATE_STR})

\`\`\`csv
${csvRows.join('\n')}
\`\`\`
`;

const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, outputContent);
console.log(`Manifest generated at ${OUTPUT_FILE}`);
console.log(`Found ${uniqueLinks.size} broken references.`);
