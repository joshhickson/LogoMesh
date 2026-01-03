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
            if (isDirectory && !dirPath.includes('node_modules') && !dirPath.includes('_build')) {
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

    let frontmatter = {};
    let newLines = [];
    let processingHeader = true;
    let hasHeaderLines = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (processingHeader) {
            const statusMatch = line.match(/^>\s*\*\*Status:\*\*\s*(.*)$/i);
            const typeMatch = line.match(/^>\s*\*\*Type:\*\*\s*(.*)$/i);
            const isBlockquote = line.trim().startsWith('>');
            const isEmpty = line.trim() === '';

            if (statusMatch) {
                frontmatter['status'] = statusMatch[1].trim();
                hasHeaderLines = true;
            } else if (typeMatch) {
                frontmatter['type'] = typeMatch[1].trim();
                hasHeaderLines = true;
            } else if (isBlockquote) {
                newLines.push(line);
            } else if (isEmpty) {
                newLines.push(line);
            } else {
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
