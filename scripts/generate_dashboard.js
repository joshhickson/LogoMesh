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

    let mermaid = 'graph TD\n';

    // --- Define Styles ---
    // Corrected syntax: removed inline comments that might break some parsers,
    // ensuring semicolons and newlines are clean.
    mermaid += '    classDef recent fill:#90ee90,stroke:#333,stroke-width:2px;\n';
    mermaid += '    classDef day_old fill:#87CEEB,stroke:#333,stroke-width:1px;\n';
    mermaid += '    classDef week_old fill:#FFA500,stroke:#333,stroke-width:1px;\n';
    mermaid += '    classDef ancient fill:#F08080,stroke:#333,stroke-width:1px;\n';
    mermaid += '    classDef normal fill:#add8e6,stroke:#333,stroke-width:1px;\n\n';

    const nodeMap = new Map();
    nodes.forEach((node, i) => {
        const nodeId = `N${i}`;
        nodeMap.set(node.id, nodeId);

        const nodeLabel = escapeMermaidLabel(node.label);
        mermaid += `    ${nodeId}["${nodeLabel}"];\n`;

        // Add click event to open file
        const filePath = node.path.replace(/\\/g, '/');
        mermaid += `    click ${nodeId} href "${filePath}" "_blank"\n`;

        const basename = path.basename(node.id);
        const match = basename.match(/^(\d{8})/);

        if (match) {
            const dateStr = match[1];
            const year = parseInt(dateStr.substring(0, 4), 10);
            const month = parseInt(dateStr.substring(4, 6), 10) - 1;
            const day = parseInt(dateStr.substring(6, 8), 10);
            const fileDateUTC = Date.UTC(year, month, day, 12, 0, 0);
            const nowUTC = Date.now();
            const ageInHours = (nowUTC - fileDateUTC) / (1000 * 60 * 60);

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
            position: fixed;
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
        #legend {
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(30, 30, 30, 0.9);
            padding: 15px;
            border: 1px solid #555;
            border-radius: 5px;
            pointer-events: none;
        }
        .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
            font-size: 14px;
        }
        .legend-color {
            width: 15px;
            height: 15px;
            margin-right: 10px;
            border: 1px solid #fff;
        }
    </style>
</head>
<body>
    <div id="legend">
        <div class="legend-item"><div class="legend-color" style="background:#90ee90"></div>Recent (< 24h)</div>
        <div class="legend-item"><div class="legend-color" style="background:#87CEEB"></div>Yesterday (24-48h)</div>
        <div class="legend-item"><div class="legend-color" style="background:#FFA500"></div>This Week (2-7d)</div>
        <div class="legend-item"><div class="legend-color" style="background:#F08080"></div>Older (> 7d)</div>
    </div>

    <div id="graph-container" class="mermaid">
${mermaidSyntax}
    </div>

    <div id="controls">
        <button id="zoom-in" title="Zoom In">+</button>
        <button id="zoom-out" title="Zoom Out">-</button>
        <button id="reset" title="Reset View">⟲</button>
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
                const { svg } = await mermaid.render('mermaid-svg', element.textContent);
                element.innerHTML = svg;

                // Initialize Pan-Zoom
                // We target the SVG element ID generated by mermaid
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
