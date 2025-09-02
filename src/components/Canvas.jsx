import React, { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import coseBilkent from 'cytoscape-cose-bilkent';

// Register layout extensions
cytoscape.use(fcose);
cytoscape.use(coseBilkent);

const Canvas = ({
  thoughts = [],
  relatedLinks = [],
  selectedThought,
  onThoughtSelect: setSelectedThought,
  filteredThoughtIds = [],
  onUpdateThought
}) => {
  const cyRef = useRef(null);
  const [cy, setCy] = useState(null);
  const [layoutMode, setLayoutMode] = useState('fcose');

  useEffect(() => {
    if (cyRef.current && !cy) {
      const cytoscapeInstance = cytoscape({
        container: cyRef.current,
        style: [
          {
            selector: 'node[type="thought"]',
            style: {
              'background-color': 'data(color)',
              'label': 'data(label)',
              'width': '100px',
              'height': '100px',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '14px',
              'text-wrap': 'wrap',
              'text-max-width': '90px',
              'border-width': 2,
              'border-color': '#333',
              'text-outline-width': 1,
              'text-outline-color': '#fff',
              'shape': 'ellipse'
            }
          },
          {
            selector: 'node[type="segment"]',
            style: {
              'background-color': '#f3f4f6',
              'label': 'data(label)',
              'width': '60px',
              'height': '60px',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '10px',
              'text-wrap': 'wrap',
              'text-max-width': '50px',
              'border-width': 1,
              'border-color': '#9ca3af',
              'shape': 'rectangle'
            }
          },
          {
            selector: 'node[type="cluster"]',
            style: {
              'background-color': 'rgba(59, 130, 246, 0.1)',
              'border-width': 2,
              'border-color': '#3b82f6',
              'border-style': 'dashed',
              'label': 'data(label)',
              'text-valign': 'top',
              'text-halign': 'center',
              'font-size': '16px',
              'font-weight': 'bold',
              'text-margin-y': -10,
              'shape': 'round-rectangle'
            }
          },
          {
            selector: 'node:selected',
            style: {
              'border-width': 4,
              'border-color': '#ef4444',
              'box-shadow': '0 0 20px rgba(239, 68, 68, 0.5)'
            }
          },
          {
            selector: 'node.highlighted',
            style: {
              'border-width': 3,
              'border-color': '#10b981',
              'box-shadow': '0 0 15px rgba(16, 185, 129, 0.5)'
            }
          },
          {
            selector: 'node.faded',
            style: {
              'opacity': 0.3
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#6b7280',
              'target-arrow-color': '#6b7280',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'arrow-scale': 1.2
            }
          },
          {
            selector: 'edge[type="contains"]',
            style: {
              'line-color': '#3b82f6',
              'target-arrow-color': '#3b82f6',
              'line-style': 'dashed',
              'width': 1
            }
          },
          {
            selector: 'edge[type="related"]',
            style: {
              'line-color': '#10b981',
              'target-arrow-color': '#10b981',
              'curve-style': 'unbundled-bezier'
            }
          },
          {
            selector: 'edge[type="semantic"]',
            style: {
              'line-color': '#8b5cf6',
              'target-arrow-color': '#8b5cf6',
              'line-style': 'dotted',
              'width': 'mapData(strength, 0.7, 1, 1, 4)',
            }
          }
        ],
        layout: {
          name: 'fcose',
          quality: 'proof',
          randomize: false,
          animate: true,
          animationDuration: 1000,
          fit: true,
          padding: 50,
          nodeDimensionsIncludeLabels: true,
          uniformNodeDimensions: false,
          packComponents: true,
          nodeRepulsion: 4500,
          idealEdgeLength: 150,
          edgeElasticity: 0.1,
          nestingFactor: 0.1,
          gravity: 0.25,
          numIter: 2500,
          tile: true,
          tilingPaddingVertical: 10,
          tilingPaddingHorizontal: 10
        }
      });

      setCy(cytoscapeInstance);
    }
  }, [cy]);

  useEffect(() => {
    if (cy && thoughts.length > 0) {
      // Clear existing elements
      cy.elements().remove();

      // Group thoughts by tags for clustering
      const tagGroups = {};
      thoughts.forEach(thought => {
        if (thought.tags && thought.tags.length > 0) {
          thought.tags.forEach(tag => {
            if (!tagGroups[tag.name]) {
              tagGroups[tag.name] = [];
            }
            tagGroups[tag.name].push(thought);
          });
        }
      });

      const elements = [];

      // Create cluster nodes for tags with multiple thoughts
      Object.entries(tagGroups).forEach(([tagName, taggedThoughts]) => {
        if (taggedThoughts.length > 1) {
          elements.push({
            data: {
              id: `cluster-${tagName}`,
              label: `${tagName} (${taggedThoughts.length})`,
              type: 'cluster'
            }
          });
        }
      });

      // Convert thoughts to cytoscape elements
      thoughts.forEach(thought => {
        // Main thought node
        elements.push({
          data: {
            id: thought.id,
            label: thought.title || 'Untitled',
            color: thought.color || '#3b82f6',
            type: 'thought',
            thought: thought,
            parent: thought.tags && thought.tags.length > 0 && 
                   tagGroups[thought.tags[0].name] && 
                   tagGroups[thought.tags[0].name].length > 1 ? 
                   `cluster-${thought.tags[0].name}` : undefined
          },
          position: thought.position || { x: Math.random() * 400, y: Math.random() * 400 }
        });

        // Add segment nodes if segments exist
        if (thought.segments && thought.segments.length > 0) {
          thought.segments.forEach((segment, index) => {
            elements.push({
              data: {
                id: `${thought.id}-segment-${index}`,
                label: segment.title || `Segment ${index + 1}`,
                type: 'segment',
                parent: thought.id,
                segment: segment
              }
            });

            // Add edge from thought to segment
            elements.push({
              data: {
                id: `${thought.id}-to-segment-${index}`,
                source: thought.id,
                target: `${thought.id}-segment-${index}`,
                type: 'contains'
              }
            });
          });
        }
      });

      // Add semantic relationships between thoughts based on shared tags
      thoughts.forEach(thought1 => {
        thoughts.forEach(thought2 => {
          if (thought1.id !== thought2.id && thought1.tags && thought2.tags) {
            const sharedTags = thought1.tags.filter(tag1 => 
              thought2.tags.some(tag2 => tag1.name === tag2.name)
            );

            if (sharedTags.length > 0 && !elements.some(el => 
              el.data.id === `${thought1.id}-to-${thought2.id}` ||
              el.data.id === `${thought2.id}-to-${thought1.id}`
            )) {
              elements.push({
                data: {
                  id: `related-${thought1.id}-to-${thought2.id}`,
                  source: thought1.id,
                  target: thought2.id,
                  type: 'related',
                  sharedTags: sharedTags.length
                }
              });
            }
          }
        });
      });

      // Add AI-generated semantic links
      if (selectedThought && relatedLinks && relatedLinks.length > 0) {
        relatedLinks.forEach(link => {
          // Ensure the edge doesn't already exist from the tag-based relationships
          const edgeExists = elements.some(el =>
            (el.data.source === selectedThought.thought_bubble_id && el.data.target === link.thoughtId) ||
            (el.data.source === link.thoughtId && el.data.target === selectedThought.thought_bubble_id)
          );

          if (!edgeExists) {
            elements.push({
              data: {
                id: `semantic-${selectedThought.thought_bubble_id}-to-${link.thoughtId}`,
                source: selectedThought.thought_bubble_id,
                target: link.thoughtId,
                type: 'semantic',
                strength: link.strength
              }
            });
          }
        });
      }

      // Add elements to cytoscape
      cy.add(elements);

      // Apply filtering if filteredThoughtIds is provided
      if (filteredThoughtIds.length > 0) {
        cy.nodes().forEach(node => {
          const nodeId = node.data('id');
          const isThoughtFiltered = filteredThoughtIds.includes(nodeId);
          const isSegmentFiltered = filteredThoughtIds.some(id => nodeId.startsWith(id));
          const isClusterFiltered = node.data('type') === 'cluster' && 
            cy.nodes(`[parent="${nodeId}"]`).some(child => 
              filteredThoughtIds.includes(child.data('id'))
            );

          if (isThoughtFiltered || isSegmentFiltered || isClusterFiltered) {
            node.addClass('highlighted');
            node.removeClass('faded');
          } else {
            node.addClass('faded');
            node.removeClass('highlighted');
          }
        });
      } else {
        cy.nodes().removeClass('highlighted faded');
      }

      // Add interaction handlers
      cy.on('tap', 'node[type="thought"]', (event) => {
        const node = event.target;
        const thought = node.data('thought');
        setSelectedThought(thought);

        // Highlight connected nodes
        cy.nodes().removeClass('highlighted');
        node.addClass('highlighted');
        node.neighborhood().addClass('highlighted');
      });

      cy.on('tap', 'node[type="segment"]', (event) => {
        const node = event.target;
        const parentNode = node.parent();
        if (parentNode.length > 0) {
          const thought = parentNode.data('thought');
          setSelectedThought(thought);
        }
      });

      // Double-click to focus/zoom on node
      cy.on('dbltap', 'node', (event) => {
        const node = event.target;
        cy.animate({
          fit: {
            eles: node.neighborhood().union(node),
            padding: 50
          }
        }, {
          duration: 500
        });
      });

      // Save position changes
      cy.on('position', 'node[type="thought"]', (event) => {
        const node = event.target;
        const thought = node.data('thought');
        const position = node.position();

        if (onUpdateThought && thought) {
          onUpdateThought({
            ...thought,
            position: { x: position.x, y: position.y }
          });
        }
      });

      // Run layout
      const layoutOptions = {
        fcose: {
          name: 'fcose',
          quality: 'proof',
          randomize: false,
          animate: true,
          animationDuration: 1000,
          fit: true,
          padding: 50,
          nodeDimensionsIncludeLabels: true,
          uniformNodeDimensions: false,
          packComponents: true,
          nodeRepulsion: 4500,
          idealEdgeLength: 150,
          edgeElasticity: 0.1,
          nestingFactor: 0.1,
          gravity: 0.25,
          numIter: 2500,
          tile: true
        },
        'cose-bilkent': {
          name: 'cose-bilkent',
          quality: 'proof',
          randomize: false,
          animate: true,
          animationDuration: 1000,
          fit: true,
          padding: 50,
          nodeRepulsion: 4500,
          idealEdgeLength: 150,
          edgeElasticity: 0.1,
          nestingFactor: 0.1
        },
        circular: {
          name: 'circle',
          animate: true,
          animationDuration: 1000,
          fit: true,
          padding: 50
        }
      };

      cy.layout(layoutOptions[layoutMode] || layoutOptions.fcose).run();
    }
  }, [cy, thoughts, relatedLinks, filteredThoughtIds, setSelectedThought, onUpdateThought, layoutMode]);

  const handleLayoutChange = (newLayout) => {
    setLayoutMode(newLayout);
  };

  const handleFitToView = () => {
    if (cy) {
      cy.fit(undefined, 50);
    }
  };

  const handleResetZoom = () => {
    if (cy) {
      cy.zoom(1);
      cy.center();
    }
  };

  return (
    <div className="flex-1 bg-gray-50 relative">
      {/* Layout controls */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md p-2 space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-2">Layout</div>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => handleLayoutChange('fcose')}
            className={`px-3 py-1 text-xs rounded ${
              layoutMode === 'fcose' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Force-Directed
          </button>
          <button
            onClick={() => handleLayoutChange('cose-bilkent')}
            className={`px-3 py-1 text-xs rounded ${
              layoutMode === 'cose-bilkent' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Compound
          </button>
          <button
            onClick={() => handleLayoutChange('circular')}
            className={`px-3 py-1 text-xs rounded ${
              layoutMode === 'circular' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Circular
          </button>
        </div>
      </div>

      {/* View controls */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md p-2 space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-2">View</div>
        <div className="flex flex-col space-y-1">
          <button
            onClick={handleFitToView}
            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 rounded"
          >
            Fit to View
          </button>
          <button
            onClick={handleResetZoom}
            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 rounded"
          >
            Reset Zoom
          </button>
        </div>
      </div>

      <div ref={cyRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Canvas;