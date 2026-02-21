const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = 'docs/04-Operations/Intent-Log/Technical/Link_Repair_Manifest_20251201.md';
const OUTPUT_PATH = 'docs/04-Operations/Intent-Log/Technical/Link_Repair_Manifest_Phase3_ProjectPlan.md';

// CSV Parser
function parseCSV(content) {
    const lines = content.split('\n');
    const rows = [];
    const fieldRegex = /(?:"((?:""|[^"])*)"|([^,\r\n]*))(?:,|$)/g;

    for (const line of lines) {
        if (!line.trim() || line.startsWith('#') || line.startsWith('```') || line.startsWith('Source File')) continue;
        const row = [];
        fieldRegex.lastIndex = 0;
        let match;
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
    if (r.confidence === 'Low' && r.brokenString.includes('PROJECT_PLAN.md')) {
        // Calculate relative path to root PROJECT_PLAN.md
        // Source file path is relative to repo root
        const sourceDir = path.dirname(r.sourceFile);
        const relPathToRoot = path.relative(sourceDir, 'PROJECT_PLAN.md');

        // Construct Full Replacement String
        const replacement = `[PROJECT_PLAN.md (Outdated)](${relPathToRoot})`;

        corrections.push({
            sourceFile: r.sourceFile,
            type: r.type,
            brokenString: r.brokenString,
            replacement: replacement,
            algorithm: 'Redirect to Root + Add Disclaimer'
        });
    }
}

// Output Phase 3 Manifest
const csvRows = ['Source File,Type,Broken String,Proposed Replacement,Algorithm'];
for (const c of corrections) {
    const safeBroken = `"${c.brokenString.replace(/"/g, '""')}"`;
    const safeRepl = `"${c.replacement.replace(/"/g, '""')}"`; // Replacement contains quotes? Unlikely but safe.
    csvRows.push(`"${c.sourceFile}",${c.type},${safeBroken},${safeRepl},"${c.algorithm}"`);
}

fs.writeFileSync(OUTPUT_PATH, csvRows.join('\n'));
console.log(`Phase 3 Manifest generated with ${corrections.length} proposed fixes.`);
