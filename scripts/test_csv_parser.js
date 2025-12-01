const fs = require('fs');

const MANIFEST_PATH = 'docs/04-Operations/Intent-Log/Technical/Link_Repair_Manifest_20251201.md';

function parseCSV(content) {
    const lines = content.split('\n');
    const rows = [];
    let headers = null;

    // Use a robust regex that handles:
    // 1. Quoted fields containing commas
    // 2. Escaped quotes ("") inside quoted fields
    // 3. Normal fields
    // The regex matches:
    // (quoted string) OR (unquoted string)
    // It assumes commas as delimiters.

    // Explanation:
    // "((?:""|[^"])*)"  -> Group 1: Quoted string. Matches " followed by (escaped quotes or non-quotes) followed by "
    // ([^,\r\n]*)       -> Group 2: Unquoted string. Matches anything except comma or newline
    const fieldRegex = /(?:"((?:""|[^"])*)"|([^,\r\n]*))(?:,|$)/g;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (line.startsWith('```')) continue;
        if (line.startsWith('#')) continue;

        const row = [];
        let match;
        // Reset lastIndex for each line
        fieldRegex.lastIndex = 0;

        // We need to loop until the regex doesn't match or we hit the end of the string
        // Note: standard regex iteration might miss the last empty field if line ends in comma
        // But let's see.

        // Manual scan is safer for CSV parsing than regex in JS sometimes.
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

        // Check if this is the header row
        if (!headers) {
             // Heuristic: Check if first column is "Source File"
             if (row[0] === 'Source File') {
                 headers = row;
             }
        } else {
            // Only add data rows if we have headers
            if (row.length === headers.length) {
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

// Test with a snippet of the actual file content
const testContent = `
Source File,Type,Broken String,Proposed Replacement,Confidence
"docs/00-Strategy/Business/20251116-Strategy-Doc-Creation-Log.md",Explicit Link,"[docs/strategy_and_ip/README.md](docs/strategy_and_ip/README.md)","MANUAL_REVIEW",Low
"docs/00-Strategy/Business/20251116-Strategy-Doc-Creation-Log.md",Plaintext Path,"docs/strategy_and_ip/01_CORE_IP_DEFINITION.md","../IP/01_CORE_IP_DEFINITION.md",High
`;

const parsed = parseCSV(testContent);
console.log('Parsed Rows:', parsed.length);
if (parsed.length > 0) {
    console.log('Sample Row 1 Confidence:', parsed[1].Confidence);
    console.log('Sample Row 1 Replacement:', parsed[1]['Proposed Replacement']);
}
