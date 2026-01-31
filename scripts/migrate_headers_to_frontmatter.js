const fs = require('fs');
const path = require('path');

// Parse args
const args = process.argv.slice(2);
const dryRunIndex = args.indexOf('--dry-run');
const DRY_RUN = dryRunIndex !== -1;
if (DRY_RUN) args.splice(dryRunIndex, 1);

// Target dir is the first arg, or default to docs
const targetPath = args[0] ? path.resolve(args[0]) : path.join(__dirname, '../docs');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;

    // If input is a file, just process it
    if (fs.statSync(dir).isFile()) {
        callback(dir);
        return;
    }

    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        try {
            let isDirectory = fs.statSync(dirPath).isDirectory();
            if (isDirectory && !dirPath.includes('node_modules') && !dirPath.includes('_build') && !f.startsWith('.')) {
                walkDir(dirPath, callback);
            } else {
                callback(path.join(dir, f));
            }
        } catch (e) {
            console.error(`Error accessing ${dirPath}:`, e);
        }
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.md')) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Check if file already has frontmatter
    if (lines[0] && lines[0].trim() === '---') {
        // Already has frontmatter, skipping unless we want to force-update (not implemented yet)
        // console.log(`Skipping ${filePath}: Already has frontmatter.`);
        return;
    }

    let frontmatter = {};
    let newLines = [];
    let processingHeader = true;
    let foundHeader = false;

    // Regex for blockquote headers
    const statusRegex = /^>\s*\*\*Status:?\*\*\s*(.*)$/i;
    const typeRegex = /^>\s*\*\*Type:?\*\*\s*(.*)$/i;

    // Some files might use a different format, e.g. non-bold keys
    const altStatusRegex = /^>\s*Status:?\s*(.*)$/i;
    const altTypeRegex = /^>\s*Type:?\s*(.*)$/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (processingHeader) {
            const statusMatch = line.match(statusRegex) || line.match(altStatusRegex);
            const typeMatch = line.match(typeRegex) || line.match(altTypeRegex);

            // Allow empty lines or simple blockquotes to continue the header block *if* we haven't hit content yet
            // But be careful: a blockquote might be content.
            // Heuristic: If we found a status/type, we are in the header.
            // If we hit a non-blockquote, non-empty line, header is done.
            const isBlockquote = line.trim().startsWith('>');
            const isEmpty = line.trim() === '';

            if (statusMatch) {
                frontmatter['status'] = statusMatch[1].trim();
                foundHeader = true;
            } else if (typeMatch) {
                frontmatter['type'] = typeMatch[1].trim();
                foundHeader = true;
            } else if (foundHeader && (isBlockquote || isEmpty)) {
                // Keep these lines as part of the context block (removed from body, frontmatter added)
                // Actually, we usually want to KEEP the context blockquote in the body,
                // but REMOVE the status/type lines.
                // The prompt implies converting "Headers" (Status/Type) to Frontmatter.
                // It's safer to preserve the Context blockquote in the body.
                newLines.push(line);
            } else if (!foundHeader && (isBlockquote || isEmpty)) {
                // Haven't found status/type yet, might be top of file whitespace or other quotes
                newLines.push(line);
            } else {
                // Non-header line, header processing done
                processingHeader = false;
                newLines.push(line);
            }
        } else {
            newLines.push(line);
        }
    }

    if (Object.keys(frontmatter).length > 0) {
        const fmString = [
            '---',
            ...Object.entries(frontmatter).map(([k, v]) => `${k}: ${v}`),
            '---',
            ''
        ].join('\n');

        // Clean up leading newlines in newLines to avoid big gaps
        while (newLines.length > 0 && newLines[0].trim() === '') {
            newLines.shift();
        }

        const newContent = fmString + newLines.join('\n');

        console.log(`Migrating: ${filePath}`);
        if (DRY_RUN) {
            console.log('--- Extracted ---');
            console.log(frontmatter);
        } else {
            fs.writeFileSync(filePath, newContent);
        }
    }
}

console.log(`Starting migration on ${targetPath} (Dry Run: ${DRY_RUN})...`);
walkDir(targetPath, processFile);
console.log('Migration scan complete.');
