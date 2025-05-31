import React, { useCallback, useRef, useEffect, useState } from 'react'; // Added useState
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

// Register the layout only once
cytoscape.use(fcose);

function Canvas({ thoughts, setSelectedThought, activeFilters, ideaManager, refreshThoughts }) {
  const cyRef = useRef(null);
  const [isLinkingModeActive, setIsLinkingModeActive] = useState(false);
  const [linkSourceNodeId, setLinkSourceNodeId] = useState(null);

  const ensureNodeData = (data) => {
    const cleanData = {};
    for (const key in data) {
      if (
        Object.prototype.hasOwnProperty.call(data, key) &&
        data[key] !== null &&
        data[key] !== undefined
      ) {
        cleanData[key] = data[key];
      }
    }
    return cleanData;
  };

  const elements = React.useMemo(() => {
    // First create all nodes from thoughts using ULIDs as stable keys
    const nodes = thoughts.flatMap((thought) => {
      const thoughtNode = {
        data: ensureNodeData({
          id: thought.thought_bubble_id,
          label: thought.title || 'Untitled',
          type: 'thought',
        }),
        classes: ['thought-node'],
      };

      const segmentNodes = (thought.segments || []).map((segment) => ({
        data: {
          id: segment.segment_id,
          label: segment.content || segment.title || 'Untitled Segment',
          type: 'segment',
        },
        classes: ['segment-node'],
      }));

      return [thoughtNode, ...segmentNodes];
    });

    // Then create edges between existing nodes
    const edges = thoughts.flatMap((thought) =>
      (thought.segments || []).map((segment) => ({
        data: {
          id: `${thought.thought_bubble_id}_${segment.segment_id}`,
          source: thought.thought_bubble_id,
          target: segment.segment_id,
          label: segment.relationship || 'relates to',
          type: 'segment',
        },
        classes: ['segment-edge'],
      }))
    );

    const linkEdges = thoughts.flatMap(thought => {
      const relatedEdges = [];
      if (thought.related_thought_ids) {
        thought.related_thought_ids.forEach(related_id => {
          const targetExists = thoughts.some(t => t.thought_bubble_id === related_id);
          // Ensure edge is drawn only once for bidirectional links and target exists
          if (targetExists && thought.thought_bubble_id < related_id) {
            relatedEdges.push({
              data: {
                id: `link_${thought.thought_bubble_id}_${related_id}`,
                source: thought.thought_bubble_id,
                target: related_id,
                label: 'related'
              },
              classes: 'thought-link-edge'
            });
          }
        });
      }
      return relatedEdges;
    });

    return [...nodes, ...edges, ...linkEdges];
  }, [thoughts, activeFilters]);

  const layout = {
    name: 'fcose',
    animate: true,
    randomize: true,
    nodeRepulsion: 8000,
    idealEdgeLength: 200,
    edgeElasticity: 0.45,
    quality: 'proof',
    // Enable position constraints based on saved positions
    fixedNodeConstraint: thoughts
      .filter((t) => t.position)
      .map((t) => ({
        nodeId: t.thought_bubble_id,
        position: t.position,
      })),
  };

  const stylesheet = [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        width: 120,
        height: 60,
        shape: 'roundrectangle',
        padding: '10px',
        'background-color': '#f3f4f6',
        'border-width': 1,
        'border-color': '#e5e7eb',
        'font-size': 14,
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': '#64748b',
        'target-arrow-color': '#64748b',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
      },
    },
    {
      selector: '.thought-node',
      style: {
        'background-opacity': (ele) =>
          activeFilters?.length
            ? activeFilters.includes(ele.id())
              ? 1
              : 0.3
            : 1,
      },
    },
    {
      selector: '.thought-link-edge',
      style: {
        'width': 1.5,
        'line-color': '#808080',
        'line-style': 'dashed',
        'curve-style': 'bezier'
      }
    },
  ];

  const handleNodeClick = useCallback(
    (evt) => {
      const clickedNode = evt.target;
      const clickedNodeId = clickedNode.id();

      if (isLinkingModeActive) {
        if (!linkSourceNodeId) {
          // First click in linking mode: set source node
          setLinkSourceNodeId(clickedNodeId);
          // Optional: logger.log(`Selected ${clickedNodeId} as link source. Click another thought.`);
        } else {
          // Second click in linking mode: try to create link
          if (clickedNodeId !== linkSourceNodeId) {
            ideaManager.linkThoughts(linkSourceNodeId, clickedNodeId);
            refreshThoughts();
          } else {
            // Optional: logger.warn('Cannot link a thought to itself.');
            console.warn('Cannot link a thought to itself.'); // Using console for now if logger is not set up for components
          }
          // Reset linking state
          setLinkSourceNodeId(null);
          setIsLinkingModeActive(false);
        }
      } else {
        // Original logic for selecting a thought
        const thought = thoughts.find((t) => t.thought_bubble_id === clickedNodeId);
        if (thought) {
          setSelectedThought(thought);
        }
      }
    },
    [isLinkingModeActive, linkSourceNodeId, thoughts, setSelectedThought, ideaManager, refreshThoughts] // Updated dependencies
  );

  useEffect(() => {
    const cy = cyRef.current;
    if (cy) {
      cy.on('tap', 'node', handleNodeClick); // handleNodeClick now includes linking logic
      cy.on('dragfree', 'node', (evt) => {
        const node = evt.target;
        const position = node.position();

        // Find the specific thought that was dragged to get its ID
        const draggedThought = thoughts.find(t => t.thought_bubble_id === node.id());
        if (draggedThought) {
          ideaManager.updateThought(draggedThought.thought_bubble_id, { position });
          refreshThoughts(); // Call the refresh function passed from App.jsx
        }
      });

      return () => {
        cy.removeListener('tap');
        cy.removeListener('dragfree');
      };
    }
  }, [thoughts, handleNodeClick, ideaManager, refreshThoughts]);

  return (
    <div className="w-full h-full relative"> {/* Ensure parent is relative for button positioning */}
      <button
        onClick={() => {
          setIsLinkingModeActive(!isLinkingModeActive);
          if (isLinkingModeActive) { // If it WAS active, now turning off
            setLinkSourceNodeId(null);
          }
        }}
        className="absolute top-2 left-2 z-10 p-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded shadow hover:bg-gray-300 dark:hover:bg-gray-600"
        title={isLinkingModeActive ? "Cancel linking thoughts" : "Start linking thoughts"}
      >
        {isLinkingModeActive
          ? (linkSourceNodeId ? `Linking from node... Cancel` : 'Cancel Linking')
          : 'Create Link'}
      </button>
      <CytoscapeComponent
        elements={elements}
        layout={layout}
        stylesheet={stylesheet}
        cy={(cy) => {
          cyRef.current = cy;
        }}
        className="w-full h-full"
      />
    </div>
  );
}

export default Canvas;
