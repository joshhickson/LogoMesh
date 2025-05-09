
import React, { useCallback, useRef, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { graphService } from '../services/graphService';

function Canvas({ thoughts, setSelectedThought, activeFilters }) {
  const cyRef = useRef(null);

  const elements = React.useMemo(() => {
    // Convert thoughts to Cytoscape nodes
    const nodes = thoughts.map(thought => ({
      data: { 
        id: thought.thought_bubble_id,
        label: thought.title,
      },
      style: {
        backgroundColor: thought.color || '#f3f4f6',
        opacity: activeFilters?.length ? 
          (activeFilters.includes(thought.thought_bubble_id) ? 1 : 0.3) : 1
      }
    }));

    // Create edges from segments
    const edges = thoughts.flatMap(thought => 
      (thought.segments || []).map(segment => ({
        data: {
          id: `${thought.thought_bubble_id}-${segment.segment_id}`,
          source: thought.thought_bubble_id,
          target: segment.segment_id
        },
        style: {
          lineStyle: 'dotted',
          lineColor: '#666',
          width: 2
        }
      }))
    );

    return [...nodes, ...edges];
  }, [thoughts, activeFilters]);

  const layout = {
    name: 'cose',
    padding: 50,
    animate: true
  };

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'width': 120,
        'height': 60,
        'shape': 'roundrectangle',
        'padding': '10px'
      }
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle'
      }
    }
  ];

  const handleNodeClick = useCallback((evt) => {
    const node = evt.target;
    const thought = thoughts.find(t => t.thought_bubble_id === node.id());
    if (thought) {
      setSelectedThought(thought);
    }
  }, [thoughts, setSelectedThought]);

  useEffect(() => {
    const cy = cyRef.current;
    if (cy) {
      cy.on('tap', 'node', handleNodeClick);
      cy.on('dragfree', 'node', (evt) => {
        const node = evt.target;
        const position = node.position();
        const updatedThoughts = thoughts.map(thought => {
          if (thought.thought_bubble_id === node.id()) {
            return {
              ...thought,
              position,
              segments: (thought.segments || []).map(segment => ({
                ...segment,
                sourcePosition: position
              }))
            };
          }
          return thought;
        });
        localStorage.setItem('thought-web-data', JSON.stringify(updatedThoughts));
      });
    }
  }, [thoughts, handleNodeClick]);

  return (
    <div className="w-full h-full">
      <CytoscapeComponent
        elements={elements}
        layout={layout}
        stylesheet={stylesheet}
        cy={(cy) => { cyRef.current = cy; }}
        className="w-full h-full"
      />
    </div>
  );
}

export default Canvas;
