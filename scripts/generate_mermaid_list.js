const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const graphDataPath = path.join(workspaceRoot, 'onboarding', 'doc_graph', 'doc_graph_raw.json');
const outputMermaidPath = path.join(workspaceRoot, 'onboarding', 'doc_graph', 'mermaid_list.md');

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
    mermaid += '    classDef recent fill:#90ee90,stroke:#333,stroke-width:2px;  /* Green < 24h */\n';
    mermaid += '    classDef day_old fill:#87CEEB,stroke:#333,stroke-width:1px; /* Blue 24-48h */\n';
    mermaid += '    classDef week_old fill:#FFA500,stroke:#333,stroke-width:1px;/* Orange 2-7 days */\n';
    mermaid += '    classDef ancient fill:#F08080,stroke:#333,stroke-width:1px; /* Red > 7 days */\n';
    mermaid += '    classDef normal fill:#add8e6,stroke:#333,stroke-width:1px;   /* Default */\n\n';


    const now = new Date();

    // --- Add Nodes and Apply Styles ---
    const nodeMap = new Map();
    nodes.forEach((node, i) => {
        const nodeId = `N${i}`;
        nodeMap.set(node.id, nodeId);

        const nodeLabel = escapeMermaidLabel(node.label);
        mermaid += `    ${nodeId}["${nodeLabel}"];\n`;

        const basename = path.basename(node.id);
        const match = basename.match(/^(\d{8})/);

        if (match) {
            const dateStr = match[1];
            const year = parseInt(dateStr.substring(0, 4), 10);
            const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JS months are 0-indexed
            const day = parseInt(dateStr.substring(6, 8), 10);

            // Use UTC for all date calculations to avoid timezone issues.
            // Set the file time to noon to avoid DST edge cases.
            const fileDateUTC = Date.UTC(year, month, day, 12, 0, 0);
            const nowUTC = Date.now(); // Date.now() is already UTC

            const ageInMillis = nowUTC - fileDateUTC;
            const ageInHours = ageInMillis / (1000 * 60 * 60);

            if (ageInHours < 24) {
                mermaid += `    class ${nodeId} recent;\n`;
            } else if (ageInHours < 48) {
                mermaid += `    class ${nodeId} day_old;\n`;
            } else if (ageInHours < 168) { // 7 * 24 = 168
                mermaid += `    class ${nodeId} week_old;\n`;
            } else {
                mermaid += `    class ${nodeId} ancient;\n`;
            }
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
