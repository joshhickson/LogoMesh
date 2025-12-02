const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = 'docs/04-Operations/Intent-Log/Technical/Link_Repair_Manifest_20251202.md'; // Use the latest manifest
const OUTPUT_PATH = 'docs/04-Operations/Intent-Log/Technical/Link_Repair_Manifest_Phase4_SpecificFiles.md';

// Targets
const TARGETS = [
    {
        pattern: 'CONTEXTUAL_DEBT_SPEC.md',
        targetPath: 'docs/01-Architecture/Specs/Contextual-Debt-Spec.md',
        labelSuffix: '' // No suffix requested
    },
    {
        pattern: 'GAP_ANALYSIS.md',
        targetPath: 'docs/GAP_ANALYSIS.md',
        labelSuffix: ' (Outdated)'
    }
];

function parseCSV(content) {
    const lines = content.split('\n');
    const rows = [];
    const fieldRegex = /(?:"((?:""|[^"])*)"|([^,\r\n]*))(?:,|$)/g;

    for (const line of lines) {
        if (!line.trim() || line.startsWith('#') || line.startsWith('```') || line.startsWith('Source File')) continue;
        const row = [];
        fieldRegex.lastIndex = 0;
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
        if (row.length >= 5) rows.push({
            sourceFile: row[0],
            type: row[1],
            brokenString: row[2],
            confidence: row[4]
        });
    }
    return rows;
}

const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf8');
const records = parseCSV(manifestContent);
const corrections = [];

for (const r of records) {
    if (r.confidence !== 'Low') continue;

    // Ignore self-referential manifest entries
    if (r.sourceFile.includes('Link_Repair_Manifest')) continue;

    for (const tgt of TARGETS) {
        if (r.brokenString.includes(tgt.pattern)) {
            const sourceDir = path.dirname(r.sourceFile);
            const relPath = path.relative(sourceDir, tgt.targetPath);

            // Construct Replacement
            let replacement = '';

            if (r.type === 'Explicit Link') {
                // Extract original label
                // brokenString is like "[Label](old/path)"
                const m = /^\[(.*?)\]\(.*?\)$/.exec(r.brokenString);
                let label = m ? m[1] : tgt.pattern; // Fallback to filename if parsing fails

                // Add suffix if needed (and avoid double suffix)
                if (tgt.labelSuffix && !label.includes(tgt.labelSuffix.trim())) {
                    label = `${label}${tgt.labelSuffix}`;
                }

                replacement = `[${label}](${relPath})`;
            } else {
                // Plaintext
                // Just replace the path? Or convert to link?
                // Request implied "label that... is outdated". Plaintext doesn't have a label.
                // If it's plaintext "docs/GAP_ANALYSIS.md", we should probably just update the path.
                // OR convert it to a link if desired. But stick to "Repair" -> "Correct Path".
                // But wait, user said "label that... file is outdated".
                // If I change plaintext `docs/GAP_ANALYSIS.md` to `../../GAP_ANALYSIS.md`, there is no text to append "(Outdated)" to, unless I change the filename itself in the text.
                // Let's replace the string with the filename + suffix?
                // "See GAP_ANALYSIS.md" -> "See GAP_ANALYSIS.md (Outdated)"?
                // Safe bet: Update path, but maybe warn user?
                // Actually, most plaintext paths in the manifest are implicit links in lists.
                // Let's assume we treat them as paths.
                replacement = relPath;
            }

            corrections.push({
                sourceFile: r.sourceFile,
                type: r.type,
                brokenString: r.brokenString,
                replacement: replacement,
                algorithm: `Target: ${tgt.pattern}`
            });
        }
    }
}

const csvRows = ['Source File,Type,Broken String,Proposed Replacement,Algorithm'];
for (const c of corrections) {
    const safeBroken = `"${c.brokenString.replace(/"/g, '""')}"`;
    const safeRepl = `"${c.replacement.replace(/"/g, '""')}"`;
    csvRows.push(`"${c.sourceFile}",${c.type},${safeBroken},${safeRepl},"${c.algorithm}"`);
}

fs.writeFileSync(OUTPUT_PATH, csvRows.join('\n'));
console.log(`Phase 4 Manifest generated with ${corrections.length} proposed fixes.`);
