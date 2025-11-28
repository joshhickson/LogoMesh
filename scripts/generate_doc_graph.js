const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const TARGET_DIRS = ['docs', 'logs'];
const OUTPUT_FILE = path.join(ROOT_DIR, 'onboarding/doc_graph/doc_graph_raw.json');

const nodes = [];
const edges = [];

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

console.log('Starting Documentation Graph Generation...');

// 1. Identify Nodes (Files)
TARGET_DIRS.forEach(targetDir => {
    const absTargetDir = path.join(ROOT_DIR, targetDir);
    walkDir(absTargetDir, (filePath) => {
        if (path.extname(filePath) === '.md') {
            const relPath = getRelativePath(filePath);
            nodes.push({
                id: relPath,
                label: path.basename(filePath),
                path: relPath,
                type: 'file'
            });
        }
    });
});

console.log(`Found ${nodes.length} Markdown files (Nodes).`);

// 2. Parse Edges (Links)
nodes.forEach(node => {
    const absoluteFilePath = path.join(ROOT_DIR, node.path);
    const content = fs.readFileSync(absoluteFilePath, 'utf8');

    // Regex for [Label](Path)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
        const label = match[1];
        const linkTarget = match[2];

        // Ignore external links
        if (linkTarget.startsWith('http') || linkTarget.startsWith('mailto:')) {
            continue;
        }

        // Ignore anchors
        if (linkTarget.startsWith('#')) {
            continue;
        }

        // Resolve Path
        let resolvedTarget = null;
        if (linkTarget.startsWith('/')) {
            // Root-relative (treat as relative to project root)
            // Remove leading slash
             resolvedTarget = linkTarget.substring(1);
        } else {
            // Relative to current file
            const currentDir = path.dirname(absoluteFilePath);
            const absoluteTarget = path.resolve(currentDir, linkTarget);
            resolvedTarget = getRelativePath(absoluteTarget);
        }

        // Clean up resolved target (remove query params or anchors if any)
        resolvedTarget = resolvedTarget.split('#')[0].split('?')[0];

        // Only add edge if target is inside docs or logs (and is md?)
        // The plan says "all documentation", so we assume target should exist in nodes list to be valid 'internal' link
        // But for "raw" graph, we might want to keep all internal links even if broken?
        // Let's keep all, the visualizer can flag broken ones.

        edges.push({
            source: node.id,
            target: resolvedTarget,
            label: 'links_to', // Generic label for now
            text: label // The text of the link
        });
    }
});

console.log(`Found ${edges.length} Links (Edges).`);

// 3. Write Output
const outputData = {
    metadata: {
        generatedAt: new Date().toISOString(),
        nodeCount: nodes.length,
        edgeCount: edges.length
    },
    nodes: nodes,
    edges: edges
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
console.log(`Graph data written to: ${OUTPUT_FILE}`);
