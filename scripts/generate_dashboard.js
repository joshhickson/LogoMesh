const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const graphDataPath = path.join(workspaceRoot, 'onboarding', 'doc_graph', 'doc_graph_raw.json');
const outputPath = path.join(workspaceRoot, 'onboarding', 'graph_dashboard.html');

// Robust escaping function for Mermaid
function escapeMermaidLabel(label) {
    if (!label) return 'Untitled';
    return label.replace(/"/g, '&quot;').replace(/#/g, '&#35;').replace(/[\n\r]+/g, ' ');
}

function generateMermaidSyntax() {
    const graphData = JSON.parse(fs.readFileSync(graphDataPath, 'utf8'));
    const nodes = graphData.nodes;
    const edges = graphData.edges;

    // Identify Connected Nodes (optional now, but useful if needed later)
    const connectedNodeIds = new Set();
    edges.forEach(edge => {
        if (edge.source !== edge.target) {
            connectedNodeIds.add(edge.source);
            connectedNodeIds.add(edge.target);
        }
    });

    // Switch to LR (Left-Right) for the main graph.
    // In Mermaid, unconnected subgraphs in an LR graph are typically stacked vertically,
    // which prevents the "ultra-wide" layout issue.
    let mermaid = 'graph LR\n';

    // --- Define Styles ---
    mermaid += '    classDef recent fill:#90ee90,stroke:#333,stroke-width:2px;\n';
    mermaid += '    classDef day_old fill:#87CEEB,stroke:#333,stroke-width:1px;\n';
    mermaid += '    classDef week_old fill:#FFA500,stroke:#333,stroke-width:1px;\n';
    mermaid += '    classDef ancient fill:#F08080,stroke:#333,stroke-width:1px;\n';
    mermaid += '    classDef normal fill:#add8e6,stroke:#333,stroke-width:1px;\n\n';

    // Clustering Logic
    const clusterMap = new Map(); // ClusterName -> Array of Node Definitions
    const nodeMap = new Map(); // ID -> Mermaid ID

    nodes.forEach((node, i) => {
        const nodeId = `N${i}`;
        nodeMap.set(node.id, nodeId);

        // --- Age Logic ---
        const basename = path.basename(node.id);
        const match = basename.match(/^(\d{8})/);
        let ageInHours = 0;
        let hasDate = false;

        if (match) {
            hasDate = true;
            const dateStr = match[1];
            const year = parseInt(dateStr.substring(0, 4), 10);
            const month = parseInt(dateStr.substring(4, 6), 10) - 1;
            const day = parseInt(dateStr.substring(6, 8), 10);
            const fileDateUTC = Date.UTC(year, month, day, 12, 0, 0);
            const nowUTC = Date.now();
            ageInHours = (nowUTC - fileDateUTC) / (1000 * 60 * 60);
        }

        // Determine Cluster
        let clusterName = 'Uncategorized';
        // Check for specific top-level directories under docs/
        // Matches: docs/00-Strategy, docs/01-Architecture, etc.
        const pathParts = node.path.split('/');
        if (pathParts[0] === 'docs' && pathParts.length >= 2) {
            // Check if second part is one of the numbered pillars or archive
            if (pathParts[1].match(/^\d{2}-/) || pathParts[1] === 'archive' || pathParts[1] === 'archive-pre-refactor') {
                clusterName = pathParts[1];
            } else if (pathParts[1] === 'Archive') { // Handle legacy case if it exists in JSON
                 clusterName = 'Archive';
            }
        } else if (node.path === 'README.md' || node.path === 'PROJECT_PLAN.md') {
            clusterName = 'Root';
        }

        // Prepare Node Definition string
        const nodeLabel = escapeMermaidLabel(node.label);
        const filePath = node.path.replace(/\\/g, '/');
        let nodeDef = `    ${nodeId}["${nodeLabel}"];\n`;
        nodeDef += `    click ${nodeId} href "${filePath}" "_blank"\n`;

        // Style
        let styleClass = 'normal';
        if (hasDate) {
            if (ageInHours < 24) styleClass = 'recent';
            else if (ageInHours < 48) styleClass = 'day_old';
            else if (ageInHours < 168) styleClass = 'week_old';
            else styleClass = 'ancient';
        }
        nodeDef += `    class ${nodeId} ${styleClass};\n`;

        // Add to map
        if (!clusterMap.has(clusterName)) {
            clusterMap.set(clusterName, []);
        }
        clusterMap.get(clusterName).push(nodeDef);
    });

    // Generate Subgraphs
    // Sort keys to have consistent order (00, 01, 02...)
    const sortedClusters = Array.from(clusterMap.keys()).sort();

    sortedClusters.forEach(cluster => {
        mermaid += `subgraph ${cluster}\n`;
        mermaid += `    direction TB\n`; // Keep internal cluster flow Top-Bottom
        const nodesInCluster = clusterMap.get(cluster);
        nodesInCluster.forEach(n => mermaid += n);
        mermaid += `end\n\n`;
    });

    // Edges
    edges.forEach(edge => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        if (sourceNode && targetNode && sourceNode !== targetNode) {
            mermaid += `    ${sourceNode} --> ${targetNode};\n`;
        }
    });

    return mermaid;
}

function generateDashboardHTML(mermaidSyntax) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LogoMesh - Documentation Graph</title>
    <!-- Local Dependencies -->
    <script src="mermaid.min.js"></script>
    <script src="svg-pan-zoom.min.js"></script>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            background-color: #1e1e1e;
            color: #d4d4d4;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
        }
        #sidebar {
            width: 250px; /* Reduced width since we removed the list */
            height: 100%;
            background: #252526;
            border-right: 1px solid #333;
            overflow-y: auto;
            padding: 20px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 20px;
            flex-shrink: 0;
        }
        #graph-area {
            flex-grow: 1;
            position: relative;
            height: 100%;
            overflow: hidden;
        }
        #graph-container {
            width: 100%;
            height: 100%;
        }
        .mermaid svg {
            width: 100%;
            height: 100%;
        }
        #controls {
            position: absolute;
            bottom: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        #controls button {
            width: 40px;
            height: 40px;
            font-size: 20px;
            background-color: #333;
            color: #fff;
            border: 1px solid #555;
            border-radius: 5px;
            cursor: pointer;
        }
        #controls button:hover {
            background-color: #444;
        }
        /* Legend */
        .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .legend-color {
            width: 15px;
            height: 15px;
            margin-right: 10px;
            border: 1px solid #fff;
        }
        h3 {
            margin-top: 0;
            border-bottom: 1px solid #555;
            padding-bottom: 10px;
            color: #fff;
            font-size: 1.1em;
        }
    </style>
</head>
<body>
    <div id="sidebar">
        <div id="legend-container">
            <h3>Legend</h3>
            <div class="legend-item"><div class="legend-color" style="background:#90ee90"></div>Recent (< 24h)</div>
            <div class="legend-item"><div class="legend-color" style="background:#87CEEB"></div>Yesterday (24-48h)</div>
            <div class="legend-item"><div class="legend-color" style="background:#FFA500"></div>This Week (2-7d)</div>
            <div class="legend-item"><div class="legend-color" style="background:#F08080"></div>Older (> 7d)</div>
        </div>
    </div>

    <div id="graph-area">
        <div id="graph-container" class="mermaid">
${mermaidSyntax}
        </div>

        <div id="controls">
            <button id="zoom-in" title="Zoom In">+</button>
            <button id="zoom-out" title="Zoom Out">-</button>
            <button id="reset" title="Reset View">⟲</button>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'dark',
                securityLevel: 'loose',
                flowchart: {
                    useMaxWidth: false,
                    htmlLabels: true
                },
            });

            async function renderGraph() {
                const element = document.querySelector('.mermaid');
                // Render mermaid to SVG
                try {
                    const { svg } = await mermaid.render('mermaid-svg', element.textContent);
                    element.innerHTML = svg;

                    // Initialize Pan-Zoom
                    const panZoom = svgPanZoom('#mermaid-svg', {
                        zoomEnabled: true,
                        controlIconsEnabled: false,
                        fit: true,
                        center: true,
                        minZoom: 0.1,
                        maxZoom: 10,
                    });

                    document.getElementById('zoom-in').addEventListener('click', () => panZoom.zoomIn());
                    document.getElementById('zoom-out').addEventListener('click', () => panZoom.zoomOut());
                    document.getElementById('reset').addEventListener('click', () => panZoom.resetZoom());
                } catch (e) {
                    element.innerHTML = '<div style="color:red; padding:20px;">Error rendering graph: ' + e.message + '</div>';
                }
            }

            renderGraph();
        });
    </script>
</body>
</html>
`;
}

try {
    console.log('Generating Mermaid syntax for dashboard...');
    const mermaidSyntax = generateMermaidSyntax();
    
    console.log('Generating dashboard HTML...');
    const dashboardHtml = generateDashboardHTML(mermaidSyntax);

    console.log(`Writing dashboard to ${outputPath}...`);
    fs.writeFileSync(outputPath, dashboardHtml);
    console.log('Successfully generated graph dashboard.');

} catch (error) {
    console.error('Failed to generate dashboard:', error);
    process.exit(1);
}
