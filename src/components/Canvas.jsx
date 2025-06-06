import React, { useCallback, useRef, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

// Register the layout only once
cytoscape.use(fcose);

function Canvas({ thoughts, setSelectedThought, activeFilters }) {
  const cyRef = useRef(null);

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

    return [...nodes, ...edges];
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
  ];

  const handleNodeClick = useCallback(
    (evt) => {
      const node = evt.target;
      const thought = thoughts.find((t) => t.thought_bubble_id === node.id());
      if (thought) {
        setSelectedThought(thought);
      }
    },
    [thoughts, setSelectedThought]
  );

  useEffect(() => {
    const cy = cyRef.current;
    if (cy) {
      cy.on('tap', 'node', handleNodeClick);
      cy.on('dragfree', 'node', (evt) => {
        const node = evt.target;
        const position = node.position();
        const updatedThoughts = thoughts.map((thought) => {
          if (thought.thought_bubble_id === node.id()) {
            return {
              ...thought,
              position,
              segments: (thought.segments || []).map((segment) => ({
                ...segment,
                sourcePosition: position,
              })),
            };
          }
          return thought;
        });
        localStorage.setItem(
          'thought-web-data',
          JSON.stringify(updatedThoughts)
        );
      });

      return () => {
        cy.removeListener('tap');
        cy.removeListener('dragfree');
      };
    }
  }, [thoughts, handleNodeClick]);

  return (
    <div className="w-full h-full">
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
