const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const graphDataPath = path.join(workspaceRoot, 'onboarding', 'doc_graph', 'doc_graph_raw.json');
const outputMermaidPath = path.join(workspaceRoot, 'onboarding', 'doc_graph', 'mermaid_list.md');
const indexPath = path.join(workspaceRoot, 'onboarding', 'index.html');

function getFileTimestamp(filePath) {
    try {
        const stats = fs.statSync(path.join(workspaceRoot, filePath));
        return stats.mtime;
    } catch (e) {
        // Return a very old date if file not found, so it's not highlighted
        return new Date(0);
    }
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
        const nodeLabel = node.label.replace(/"/g, '#quot;'); // Escape quotes for mermaid
        
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

    return mermaid;
}

try {
    console.log('Generating Mermaid syntax...');
    const mermaidSyntax = generateMermaidSyntax();
    
    console.log(`Writing Mermaid syntax to ${outputMermaidPath}...`);
    fs.writeFileSync(outputMermaidPath, mermaidSyntax);

    console.log('Updating index.html...');
    let indexContent = fs.readFileSync(indexPath, 'utf8');

    const replacementHtml = `
            <div class="graph-note">
                <strong>Note:</strong> This is a static analysis of the documentation graph. Nodes in green have been modified in the last 24 hours.
            </div>
            <div class="mermaid" id="mermaid-container">
            </div>
    `;

    const d3ScriptRegex = /<script>[\s\S]*?createGraph\('doc_graph\/doc_graph_raw\.json'[\s\S]*?<\/script>/;
    const mermaidFetchScript = `
    <script>
        mermaid.initialize({ startOnLoad: true });
        fetch('doc_graph/mermaid_list.md')
            .then(response => response.text())
            .then(text => {
                const mermaidContainer = document.getElementById('mermaid-container');
                mermaidContainer.innerHTML = text;
                mermaid.init(undefined, mermaidContainer);
            });
    </script>
    `;

    // Replace D3 SVG with Mermaid container
    indexContent = indexContent.replace(/<div class="graph-container">[\s\S]*?<\/div>/, `<div class="graph-container">${replacementHtml}</div>`);
    
    // Replace D3 script with Mermaid fetch script
    indexContent = indexContent.replace(d3ScriptRegex, mermaidFetchScript);

    fs.writeFileSync(indexPath, indexContent);

    console.log('Successfully updated index.html with Mermaid graph.');

} catch (error) {
    console.error('Failed to generate or update graph:', error);
}
