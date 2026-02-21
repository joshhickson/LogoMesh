const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MANIFEST_PATH = 'docs/04-Operations/Intent-Log/Technical/Proposed-Headers-Manifest.md';
const LOG_PATH = 'docs/04-Operations/Intent-Log/Technical/Header-Application-Log.md';
const ONBOARDING_DIR = 'onboarding/';

function calculateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}

function parseManifestLine(line) {
    if (!line.trim().startsWith('|')) return null;
    const parts = line.split('|').map(p => p.trim());
    if (parts.length < 6) return null;

    const filepathRaw = parts[1];
    if (!filepathRaw || filepathRaw.includes('Filepath') || filepathRaw.includes('---')) return null;

    const filepath = filepathRaw.replace(/^`|`$/g, '');
    const status = parts[2];
    const type = parts[3];
    let context = parts[4].replace(/^`|`$/g, '');
    const supersededBy = parts[5] ? parts[5].replace(/^`|`$/g, '') : '';

    return { filepath, status, type, context, supersededBy };
}

function constructHeader(metadata) {
    let header = `> **Status:** ${metadata.status}\n`;
    header += `> **Type:** ${metadata.type}\n`;
    header += `> **Context:**\n`;
    header += `> ${metadata.context}`;
    if (metadata.supersededBy) {
        header += `\n> **Superseded By:** [${metadata.supersededBy}](${metadata.supersededBy})`;
    }
    return header;
}

function extractBody(content) {
    const lines = content.split('\n');
    let hasHeader = false;
    let endIndex = 0;

    // Check if it starts with > **Status:**
    if (lines.length > 0 && lines[0].startsWith('> **Status:**')) {
        hasHeader = true;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('>')) {
                endIndex = i + 1;
            } else {
                break;
            }
        }
    }

    let rawBody = '';
    let headerRaw = '';

    if (hasHeader) {
        headerRaw = lines.slice(0, endIndex).join('\n');
        rawBody = lines.slice(endIndex).join('\n');
    } else {
        headerRaw = '';
        rawBody = content;
    }

    const cleanBody = rawBody.replace(/^\n+/, '');

    return { hasHeader, body: cleanBody, headerRaw };
}

async function main() {
    const args = process.argv.slice(2);
    console.log('Raw Args:', args);

    // Explicitly handle arguments
    let skip = 0;
    let limit = 5; // Default low limit for safety

    if (args.length > 0) skip = parseInt(args[0], 10);
    if (args.length > 1) limit = parseInt(args[1], 10);

    if (isNaN(skip)) skip = 0;
    if (isNaN(limit)) limit = 5;

    console.log(`Starting Header Application (Skip: ${skip}, Limit: ${limit})...`);

    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error(`Manifest not found at ${MANIFEST_PATH}`);
        process.exit(1);
    }

    const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    const allLines = manifestContent.split('\n');

    const validItems = [];
    for (const line of allLines) {
        const meta = parseManifestLine(line);
        if (meta && !meta.filepath.startsWith(ONBOARDING_DIR) && !meta.filepath.includes('*')) {
            validItems.push(meta);
        }
    }

    const itemsToProcess = validItems.slice(skip, skip + limit);
    console.log(`Total Valid Items: ${validItems.length}`);
    console.log(`Processing ${itemsToProcess.length} items.`);
    console.log('Target Files:', itemsToProcess.map(i => i.filepath));

    const logs = [];
    if (skip === 0) {
        logs.push(`# Header Application Log - ${new Date().toISOString()}\n`);
        logs.push(`| File | Action | Result | Hash Check |`);
        logs.push(`| --- | --- | --- | --- |`);
    }

    for (const meta of itemsToProcess) {
        if (!fs.existsSync(meta.filepath)) {
            console.error(`File not found: ${meta.filepath}`);
            logs.push(`| \`${meta.filepath}\` | Error | File Not Found | N/A |`);
            continue;
        }

        try {
            const content = fs.readFileSync(meta.filepath, 'utf-8');
            const { hasHeader, body, headerRaw } = extractBody(content);

            const newHeader = constructHeader(meta);
            const newContent = `${newHeader}\n\n${body}`;

            const originalBodyHash = calculateHash(body);
            const reExtracted = extractBody(newContent);
            const newBodyHash = calculateHash(reExtracted.body);

            if (originalBodyHash !== newBodyHash) {
                console.error(`Hash mismatch for ${meta.filepath}`);
                throw new Error(`Hash mismatch! Original: ${originalBodyHash}, New: ${newBodyHash}`);
            }

            fs.writeFileSync(meta.filepath, newContent, 'utf-8');

            const action = hasHeader ? 'Replaced Header' : 'Prepended Header';
            console.log(`${action}: ${meta.filepath}`);
            logs.push(`| \`${meta.filepath}\` | ${action} | Success | PASS |`);

        } catch (err) {
            console.error(`Error processing ${meta.filepath}:`, err);
            logs.push(`| \`${meta.filepath}\` | Error | ${err.message} | FAIL |`);
            process.exit(1);
        }
    }

    if (logs.length > 0) {
        if (skip === 0) {
            fs.writeFileSync(LOG_PATH, logs.join('\n') + '\n', 'utf-8');
        } else {
            fs.appendFileSync(LOG_PATH, logs.join('\n') + '\n', 'utf-8');
        }
        console.log(`Log appended to ${LOG_PATH}`);
    }
}

main();
