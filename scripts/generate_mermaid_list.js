const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const graphDataPath = path.join(workspaceRoot, 'onboarding', 'doc_graph', 'doc_graph_raw.json');
const outputMermaidPath = path.join(workspaceRoot, 'onboarding', 'doc_graph', 'mermaid_list.md');

function getFileTimestamp(filePath) {
    try {
        const stats = fs.statSync(path.join(workspaceRoot, filePath));
        return stats.mtime;
    } catch (e) {
        return new Date(0);
    }
}

// Robust escaping function for Mermaid
function escapeMermaidLabel(label) {
    if (!label) return 'Untitled';
    // 1. Replace quotes " with equivalent HTML entity or single quotes
    // 2. Escape other Mermaid special chars if necessary
    // 3. Ensure no newlines break the syntax
    return label
        .replace(/"/g, '&quot;')
        .replace(/#/g, '&#35;') // Hash can start comments in some contexts
        .replace(/[\n\r]+/g, ' '); // Remove newlines
}

function generateMermaidSyntax() {
    const graphData = JSON.parse(fs.readFileSync(graphDataPath, 'utf8'));
    const nodes = graphData.nodes;
    const edges = graphData.edges;

    let mermaid = 'graph TD\n';

    // --- Define Styles ---
    mermaid += '    classDef recent fill:#90ee90,stroke:#333,stroke-width:2px;\n';
    mermaid += '    classDef normal fill:#add8e6,stroke:#333,stroke-width:1px;\n\n';

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    // --- Add Nodes and Apply Styles ---
    const nodeMap = new Map();
    nodes.forEach((node, i) => {
        const nodeId = `N${i}`;
        nodeMap.set(node.id, nodeId);
        const fileTimestamp = getFileTimestamp(node.id);

        const nodeLabel = escapeMermaidLabel(node.label);
        
        mermaid += `    ${nodeId}["${nodeLabel}"];\n`;
        
        if (fileTimestamp > twentyFourHoursAgo) {
            mermaid += `    class ${nodeId} recent;\n`;
        } else {
            mermaid += `    class ${nodeId} normal;\n`;
        }
    });

    mermaid += '\n';

    // --- Add Edges ---
    edges.forEach(edge => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (sourceNode && targetNode) {
            mermaid += `    ${sourceNode} --> ${targetNode};\n`;
        }
    });

    mermaid += '\n';

    // --- Force Vertical Layout (Spine) ---
    for (let i = 0; i < nodes.length - 1; i++) {
        mermaid += `    N${i} ~~~ N${i+1};\n`;
    }

    return mermaid;
}

try {
    console.log('Generating Mermaid syntax...');
    const mermaidSyntax = generateMermaidSyntax();
    
    console.log(`Writing Mermaid syntax to ${outputMermaidPath}...`);
    fs.writeFileSync(outputMermaidPath, mermaidSyntax);
    console.log('Successfully generated Mermaid graph.');

} catch (error) {
    console.error('Failed to generate graph:', error);
}
