const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const TARGET_DIRS = ['docs', 'logs'];

// Recursively walk directories
function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath, callback);
        } else {
            callback(filePath);
        }
    }
}

console.log('Starting Fix for Hardened Links (Stripping Backticks)...');

let fixedCount = 0;
let fileCount = 0;

TARGET_DIRS.forEach(targetDir => {
    const absTargetDir = path.join(ROOT_DIR, targetDir);
    walkDir(absTargetDir, (filePath) => {
        if (path.extname(filePath) !== '.md') return;

        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Regex to find links imprisoned in backticks: `[text](url)`
        // We match backtick, [, text, ], (, url, ), backtick
        // Capture groups: 1=text, 2=url
        const regex = /`\[([^\]]+)\]\(([^)]+)\)`/g;

        if (regex.test(content)) {
            content = content.replace(regex, (match, text, url) => {
                modified = true;
                fixedCount++;
                // Return just the link without backticks
                return `[${text}](${url})`;
            });
        }

        if (modified) {
            fileCount++;
            fs.writeFileSync(filePath, content);
            console.log(`Fixed links in: ${path.relative(ROOT_DIR, filePath)}`);
        }
    });
});

console.log(`Fix complete.`);
console.log(`Files fixed: ${fileCount}`);
console.log(`Links liberated: ${fixedCount}`);
