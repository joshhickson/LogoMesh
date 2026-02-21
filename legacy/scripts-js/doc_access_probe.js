const fs = require('fs');
const path = require('path');

const targets = ['docs', 'logs'];

console.log('Starting Documentation Access Probe...');
console.log('Current Working Directory:', process.cwd());

targets.forEach(target => {
    const targetPath = path.join(process.cwd(), target);
    console.log(`\nProbing target: ${target}`);
    console.log(`Absolute Path: ${targetPath}`);

    try {
        if (!fs.existsSync(targetPath)) {
            console.error(`[FAIL] Directory does not exist: ${targetPath}`);
            return;
        }

        const stats = fs.statSync(targetPath);
        if (!stats.isDirectory()) {
            console.error(`[FAIL] Path is not a directory: ${targetPath}`);
            return;
        }

        console.log(`[PASS] Directory exists.`);

        // Try listing files
        const files = fs.readdirSync(targetPath);
        console.log(`[PASS] Directory listing successful. Found ${files.length} items.`);

        // List first 5 items
        const preview = files.slice(0, 5);
        console.log('First 5 items:', preview);

        // Try reading the first file if it's a file
        for (const file of preview) {
            const filePath = path.join(targetPath, file);
            const fileStats = fs.statSync(filePath);
            if (fileStats.isFile()) {
                console.log(`Attempting to read file: ${file}`);
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    console.log(`[PASS] Read file successful. Length: ${content.length} chars.`);
                    console.log(`Preview: ${content.substring(0, 50).replace(/\n/g, ' ')}...`);
                    break; // Just need one success per directory
                } catch (readErr) {
                    console.error(`[FAIL] Could not read file ${file}:`, readErr.message);
                }
            }
        }

    } catch (err) {
        console.error(`[CRITICAL FAIL] Error accessing ${target}:`, err.message);
    }
});

console.log('\nProbe Complete.');
