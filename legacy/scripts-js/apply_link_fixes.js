const fs = require('fs');

const MANIFEST_PATH = process.argv[2] || 'docs/04-Operations/Intent-Log/Technical/Link_Repair_Manifest_20251201.md';

function parseCSV(content) {
    const lines = content.split('\n');
    const rows = [];
    let headers = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (line.startsWith('```')) continue;
        if (line.startsWith('#')) continue;

        const row = [];
        let currentField = '';
        let inQuotes = false;
        let fieldStart = true;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];

            if (inQuotes) {
                if (char === '"') {
                    if (j + 1 < line.length && line[j+1] === '"') {
                        // Escaped quote
                        currentField += '"';
                        j++;
                    } else {
                        // End of quotes
                        inQuotes = false;
                    }
                } else {
                    currentField += char;
                }
            } else {
                if (char === '"' && fieldStart) {
                    inQuotes = true;
                } else if (char === ',') {
                    row.push(currentField);
                    currentField = '';
                    fieldStart = true;
                } else {
                    currentField += char;
                    fieldStart = false;
                }
            }
        }
        row.push(currentField); // Push the last field

        if (!headers) {
             if (row[0] === 'Source File') {
                 headers = row;
             }
        } else {
            if (row.length >= headers.length) {
                const rowObj = {};
                for (let h = 0; h < headers.length; h++) {
                    rowObj[headers[h]] = row[h];
                }
                rows.push(rowObj);
            }
        }
    }
    return rows;
}

function applyFixes() {
    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error(`Manifest not found at ${MANIFEST_PATH}`);
        process.exit(1);
    }

    console.log(`Applying fixes from ${MANIFEST_PATH}...`);
    const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const records = parseCSV(manifestContent);

    // Group by file
    const fixesByFile = new Map();
    let count = 0;

    for (const record of records) {
        if (!fixesByFile.has(record['Source File'])) {
            fixesByFile.set(record['Source File'], []);
        }
        fixesByFile.get(record['Source File']).push(record);
        count++;
    }

    console.log(`Found ${count} fixes across ${fixesByFile.size} files.`);

    for (const [filepath, fixes] of fixesByFile) {
        if (!fs.existsSync(filepath)) {
            console.warn(`File not found, skipping: ${filepath}`);
            continue;
        }

        let content = fs.readFileSync(filepath, 'utf8');
        let modified = false;

        fixes.sort((a, b) => {
            if (a.Type === 'Explicit Link' && b.Type !== 'Explicit Link') return -1;
            if (a.Type !== 'Explicit Link' && b.Type === 'Explicit Link') return 1;
            return b['Broken String'].length - a['Broken String'].length;
        });

        for (const fix of fixes) {
            const broken = fix['Broken String'];
            const replacement = fix['Proposed Replacement'];

            if (content.includes(broken)) {
                if (fix.Type === 'Explicit Link') {
                    // Check if replacement is a FULL markdown link (starts with '[')
                    if (replacement.trim().startsWith('[')) {
                         // Full replacement strategy (Phase 3)
                         const parts = content.split(broken);
                         if (parts.length > 1) {
                             content = parts.join(replacement);
                             modified = true;
                         }
                    } else {
                        // Standard strategy: Preserve Label (Phase 1 & 2)
                        // broken: [Label](path) -> replacement: newPath
                        const openBracket = broken.indexOf('[');
                        const closeBracket = broken.lastIndexOf('](');
                        const closeParen = broken.lastIndexOf(')');

                        if (openBracket !== -1 && closeBracket !== -1 && closeParen !== -1) {
                            const label = broken.substring(openBracket + 1, closeBracket);
                            const newString = `[${label}](${replacement})`;

                            const parts = content.split(broken);
                            if (parts.length > 1) {
                                content = parts.join(newString);
                                modified = true;
                            }
                        } else {
                             console.warn(`Could not parse explicit link format for: ${broken}`);
                        }
                    }

                } else {
                    // Plaintext Path
                    const parts = content.split(broken);
                    if (parts.length > 1) {
                        content = parts.join(replacement);
                        modified = true;
                    }
                }
            } else {
                // console.warn(`Broken string not found in ${filepath}: ${broken}`);
            }
        }

        if (modified) {
            fs.writeFileSync(filepath, content);
            console.log(`Updated ${filepath}`);
        }
    }
    console.log('Done.');
}

applyFixes();
