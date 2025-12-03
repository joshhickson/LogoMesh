const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TARGET_DIRS = ['docs', 'logs'];
const OUTPUT_FILE = path.join(ROOT_DIR, 'onboarding/doc_graph/doc_graph_raw.json');

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

console.log('Starting Documentation Graph Generation (v2 - Implicit Support)...');

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

// 2.5 Filter Edges (Remove Dangling Links)
// D3.js crashes if an edge points to a node ID that doesn't exist in the nodes array.
const nodeIds = new Set(nodes.map(n => n.id));
const validEdges = edges.filter(edge => {
    if (nodeIds.has(edge.target)) {
        return true;
    }
    // Optional: Log broken links
    // console.warn(`Dropped dangling edge: ${edge.source} -> ${edge.target}`);
    return false;
});

console.log(`Found ${edges.length} Edges (Raw).`);
console.log(`Retained ${validEdges.length} Valid Edges (Target Exists).`);

// 3. Write Output
const outputData = {
    metadata: {
        generatedAt: new Date().toISOString(),
        nodeCount: nodes.length,
        edgeCount: validEdges.length
    },
    nodes: nodes,
    edges: validEdges
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
console.log(`Graph data written to: ${OUTPUT_FILE}`);
