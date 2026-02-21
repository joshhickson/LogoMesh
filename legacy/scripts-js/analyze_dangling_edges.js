const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const TARGET_DIRS = ['docs']; // logs/ is gone
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs/04-Operations/Intent-Log/Technical/20251129-dangling-edges.csv');

// Helper to get relative path from root
function getRelativePath(absolutePath) {
    return path.relative(ROOT_DIR, absolutePath).split(path.sep).join('/');
}

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

console.log('Starting Dangling Edge Analysis...');

const nodes = [];
const edges = [];
const validFilePaths = new Set();

// 1. Identify Nodes (Files) & Build Census
TARGET_DIRS.forEach(targetDir => {
    const absTargetDir = path.join(ROOT_DIR, targetDir);
    walkDir(absTargetDir, (filePath) => {
        if (path.extname(filePath) === '.md') {
            const relPath = getRelativePath(filePath);

            // Add Node
            nodes.push({
                id: relPath,
                label: path.basename(filePath),
                path: relPath,
                type: 'file'
            });

            // Add to Census
            validFilePaths.add(relPath);
        }
    });
});

// Add root files to census AND nodes array because they are link targets
['PROJECT_PLAN.md', 'README.md'].forEach(fileName => {
    if (fs.existsSync(path.join(ROOT_DIR, fileName))) {
        validFilePaths.add(fileName);
        nodes.push({
            id: fileName,
            label: fileName,
            path: fileName,
            type: 'file'
        });
    }
});


console.log(`Found ${nodes.length} Nodes.`);

// 2. Parse Edges (Links)
nodes.forEach(node => {
    const absoluteFilePath = path.join(ROOT_DIR, node.path);
    const content = fs.readFileSync(absoluteFilePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
        // --- Pass 1: Explicit Links ---
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        while ((match = linkRegex.exec(line)) !== null) {
            const label = match[1];
            const linkTarget = match[2];

            // Ignore external/anchors
            if (linkTarget.startsWith('http') || linkTarget.startsWith('mailto:') || linkTarget.startsWith('#')) {
                continue;
            }

            let resolvedTarget = null;
            if (linkTarget.startsWith('/')) {
                resolvedTarget = linkTarget.substring(1);
            } else {
                const targetWithoutAnchor = linkTarget.split('#')[0];
                const currentDir = path.dirname(absoluteFilePath);
                const absoluteTarget = path.resolve(currentDir, targetWithoutAnchor);
                resolvedTarget = getRelativePath(absoluteTarget);
            }

            // Clean up
            resolvedTarget = resolvedTarget.split('#')[0].split('?')[0];

            edges.push({
                source: node.id,
                target: resolvedTarget,
                label: 'explicit_link',
                text: label
            });
        }

        // --- Pass 2: Implicit Links ---
        validFilePaths.forEach(validPath => {
            if (line.includes(validPath)) {
                // Filter if already part of explicit link
                if (line.includes(`](${validPath}`)) return;
                if (line.includes(`] (/${validPath}`)) return;

                edges.push({
                    source: node.id,
                    target: validPath,
                    label: 'implicit_link',
                    text: validPath
                });
            }
        });
    });
});

console.log(`Found ${edges.length} Edges (Raw).`);

// 3. Identify Dangling Edges
const nodeIds = new Set(nodes.map(n => n.id));
const danglingEdges = edges.filter(edge => {
    return !nodeIds.has(edge.target);
});

console.log(`Found ${danglingEdges.length} Dangling Edges.`);

// 4. Write CSV
const csvRows = ['Source,Target,LinkType,LinkText']; // Header
danglingEdges.forEach(edge => {
    // Escape quotes in text
    const text = edge.text ? edge.text.replace(/"/g, '""') : '';
    csvRows.push(`"${edge.source}","${edge.target}","${edge.label}","${text}"`);
});

fs.writeFileSync(OUTPUT_FILE, csvRows.join('\n'));
console.log(`Dangling edges written to: ${OUTPUT_FILE}`);
