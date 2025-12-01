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

// Global variable to store Red Orphans
let redOrphanNodes = [];

function generateMermaidSyntax() {
    const graphData = JSON.parse(fs.readFileSync(graphDataPath, 'utf8'));
    const nodes = graphData.nodes;
    const edges = graphData.edges;

    // Reset list
    redOrphanNodes = [];

    // Identify Connected Nodes
    const connectedNodeIds = new Set();
    edges.forEach(edge => {
        if (edge.source !== edge.target) {
            connectedNodeIds.add(edge.source);
            connectedNodeIds.add(edge.target);
        }
    });

    let mermaid = 'graph TD\n';

    // --- Define Styles ---
    mermaid += '    classDef recent fill:#90ee90,stroke:#333,stroke-width:2px;\n';
    mermaid += '    classDef day_old fill:#87CEEB,stroke:#333,stroke-width:1px;\n';
    mermaid += '    classDef week_old fill:#FFA500,stroke:#333,stroke-width:1px;\n';
    mermaid += '    classDef ancient fill:#F08080,stroke:#333,stroke-width:1px;\n';
    mermaid += '    classDef normal fill:#add8e6,stroke:#333,stroke-width:1px;\n\n';

    const nodeMap = new Map();

    // First Pass: Classify Nodes and Filter Red Orphans
    nodes.forEach((node, i) => {
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

        // Check if Red Orphan (> 7 days (168h) AND not connected)
        // Only classify as "Red" if it has a date AND is > 7 days old.
        // If it has no date, it's "normal", so we don't hide it as a "red orphan".
        if (hasDate && ageInHours >= 168 && !connectedNodeIds.has(node.id)) {
            redOrphanNodes.push(node);
            return; // SKIP adding to Mermaid
        }

        // Add to Mermaid
        const nodeId = `N${i}`;
        nodeMap.set(node.id, nodeId);

        const nodeLabel = escapeMermaidLabel(node.label);
        mermaid += `    ${nodeId}["${nodeLabel}"];\n`;

        // Add click event
        const filePath = node.path.replace(/\\/g, '/');
        mermaid += `    click ${nodeId} href "${filePath}" "_blank"\n`;

        // Apply Styles
        if (hasDate) {
            if (ageInHours < 24) mermaid += `    class ${nodeId} recent;\n`;
            else if (ageInHours < 48) mermaid += `    class ${nodeId} day_old;\n`;
            else if (ageInHours < 168) mermaid += `    class ${nodeId} week_old;\n`;
            else mermaid += `    class ${nodeId} ancient;\n`;
        } else {
            mermaid += `    class ${nodeId} normal;\n`;
        }
    });

    mermaid += '\n';

    // --- Add Edges (Filter Self-Loops) ---
    // Only add edges if both nodes are in the map (orphans were filtered out)
    edges.forEach(edge => {
        if (edge.source === edge.target) return; // Filter self-loops
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (sourceNode && targetNode) {
            mermaid += `    ${sourceNode} --> ${targetNode};\n`;
        }
    });

    return mermaid;
}

function generateDashboardHTML(mermaidSyntax) {
    // Generate Orphan List HTML
    const orphanListItems = redOrphanNodes.map(node => {
        const filePath = node.path.replace(/\\/g, '/');
        return `<li><a href="${filePath}" target="_blank">${node.label}</a></li>`;
    }).join('\n');

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
            width: 350px;
            height: 100%;
            background: #252526;
            border-right: 1px solid #333;
            overflow-y: auto;
            padding: 20px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 20px;
            flex-shrink: 0; /* Prevent shrinking */
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
        /* Orphan List */
        #orphan-list ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        #orphan-list li {
            margin-bottom: 8px;
        }
        #orphan-list a {
            color: #F08080; /* Red color for red orphans */
            text-decoration: none;
            font-size: 0.85em;
            word-break: break-all;
            display: block;
            padding: 2px 0;
        }
        #orphan-list a:hover {
            text-decoration: underline;
            color: #ff9999;
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

        <div id="orphan-list">
            <h3>Archived Files (> 7 days)</h3>
            <p style="font-size: 0.8em; color: #aaa; margin-bottom: 10px;">These files are older than a week and have no connections.</p>
            <ul>
                ${orphanListItems}
            </ul>
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
    console.log(`Found ${redOrphanNodes.length} red orphan nodes.`);
    
    console.log('Generating dashboard HTML...');
    const dashboardHtml = generateDashboardHTML(mermaidSyntax);

    console.log(`Writing dashboard to ${outputPath}...`);
    fs.writeFileSync(outputPath, dashboardHtml);
    console.log('Successfully generated graph dashboard.');

} catch (error) {
    console.error('Failed to generate dashboard:', error);
    process.exit(1);
}
