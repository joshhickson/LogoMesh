
import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

// Register the fcose layout
cytoscape.use(fcose);

const Canvas = ({ thoughts, segments, selectedThought, onThoughtSelect, onRefreshThoughts }) => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const [cy, setCy] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Cytoscape
    const cytoscapeInstance = cytoscape({
      container: containerRef.current,
      
      elements: generateElements(thoughts, segments),
      
      style: [
        // Thought bubble styles (parent/compound nodes)
        {
          selector: 'node[type="thought"]',
          style: {
            'background-color': '#4A90E2',
            'border-color': '#2E5C8A',
            'border-width': 2,
            'label': 'data(title)',
            'text-valign': 'top',
            'text-halign': 'center',
            'color': 'white',
            'font-size': '12px',
            'font-weight': 'bold',
            'padding': '10px',
            'compound-sizing-wrt-labels': 'include',
            'min-width': '100px',
            'min-height': '60px'
          }
        },
        
        // Segment styles (child nodes)
        {
          selector: 'node[type="segment"]',
          style: {
            'background-color': '#7ED321',
            'border-color': '#5BA617',
            'border-width': 1,
            'label': 'data(title)',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': 'white',
            'font-size': '10px',
            'width': '60px',
            'height': '40px'
          }
        },
        
        // Selected thought highlighting
        {
          selector: 'node[type="thought"]:selected',
          style: {
            'border-color': '#FF6B35',
            'border-width': 3
          }
        },
        
        // Edge styles (if any direct edges are needed)
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#cccccc',
            'target-arrow-color': '#cccccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],
      
      layout: {
        name: 'fcose',
        // fcose-specific options for compound nodes
        quality: 'default',
        randomize: false,
        animate: true,
        animationDuration: 1000,
        fit: true,
        padding: 30,
        nodeDimensionsIncludeLabels: true,
        uniformNodeDimensions: false,
        packComponents: true,
        nodeRepulsion: 4500,
        idealEdgeLength: 50,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        numIter: 2500,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10,
        gravityRangeCompound: 1.5,
        gravityCompound: 1.0,
        gravityRange: 3.8
      },
      
      // Enable compound node interactions
      autoungrabify: false,
      autounselectify: false
    });

    setCy(cytoscapeInstance);

    // Handle node selection
    cytoscapeInstance.on('tap', 'node[type="thought"]', (event) => {
      const thoughtId = event.target.data('id');
      if (onThoughtSelect) {
        onThoughtSelect(thoughtId);
      }
    });

    // Handle node position updates for thoughts
    cytoscapeInstance.on('dragfree', 'node[type="thought"]', async (event) => {
      const node = event.target;
      const position = node.position();
      const thoughtId = node.data('id');
      
      try {
        // Find the thought to update
        const thought = thoughts.find(t => t.thought_bubble_id === thoughtId);
        if (thought) {
          // Update position via API (assuming updateThoughtApi exists)
          const updatedThought = {
            ...thought,
            x_coordinate: position.x,
            y_coordinate: position.y
          };
          
          // Import the API service dynamically to avoid circular deps
          const { updateThoughtApi } = await import('../services/apiService');
          await updateThoughtApi(thoughtId, updatedThought);
        }
      } catch (error) {
        console.error('Error updating thought position:', error);
      }
    });

    return () => {
      if (cytoscapeInstance) {
        cytoscapeInstance.destroy();
      }
    };
  }, [thoughts, segments, onThoughtSelect]);

  // Update selection when selectedThought changes
  useEffect(() => {
    if (cy && selectedThought) {
      cy.nodes().unselect();
      const thoughtNode = cy.getElementById(selectedThought);
      if (thoughtNode.length > 0) {
        thoughtNode.select();
        cy.center(thoughtNode);
      }
    }
  }, [cy, selectedThought]);

  // Helper function to generate Cytoscape elements
  const generateElements = (thoughts, segments) => {
    const elements = [];

    // Add thought nodes (compound/parent nodes)
    thoughts.forEach(thought => {
      elements.push({
        data: {
          id: thought.thought_bubble_id,
          title: thought.title || 'Untitled Thought',
          type: 'thought'
        },
        position: {
          x: thought.x_coordinate || 0,
          y: thought.y_coordinate || 0
        }
      });
    });

    // Add segment nodes (child nodes)
    segments.forEach(segment => {
      elements.push({
        data: {
          id: segment.segment_id,
          parent: segment.thought_bubble_id, // This makes it a child of the thought
          title: segment.title || segment.content?.substring(0, 20) + '...' || 'Untitled Segment',
          type: 'segment'
        }
      });
    });

    return elements;
  };

  return (
    <div className="canvas-container w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full bg-gray-50"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default Canvas;
