import React, { useEffect, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { Thought } from '../contracts/entities';

cytoscape.use(coseBilkent);

interface CanvasProps {
  thoughts: Thought[];
  selectedThought: Thought | null;
  onSelectThought: (thought: Thought) => void;
  clusters?: any[]; // Define a proper type later
  activeCluster?: string | null;
  onClusterClick?: (clusterId: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  thoughts,
  selectedThought,
  onSelectThought,
  clusters = [],
  activeCluster = null,
  onClusterClick = () => {},
}) => {
  const elements = useMemo(() => {
    // Create cluster nodes
    const clusterNodes = clusters.map(cluster => ({
      data: { id: cluster.id, label: cluster.label, type: 'cluster' }
    }));

    // Assign thoughts to clusters
    const thoughtNodes = thoughts.map(thought => {
      const cluster = clusters.find(c => c.thoughtIds.includes(thought.id));
      return {
        data: {
          id: thought.id,
          label: thought.title,
          type: 'thought',
          parent: cluster ? cluster.id : undefined,
        },
      };
    });

    const edges = thoughts.flatMap(thought =>
      (thought.relatedThoughts || []).map(relatedId => ({
        data: {
          source: thought.id,
          target: relatedId,
          id: `${thought.id}-${relatedId}`,
        },
      }))
    );

    return [...clusterNodes, ...thoughtNodes, ...edges];
  }, [thoughts, clusters]);

  const stylesheet = [
    {
      selector: 'node[type="thought"]',
      style: {
        'background-color': '#666',
        'label': 'data(label)',
        'color': '#fff',
        'text-valign': 'center',
        'font-size': '10px',
        'width': '50px',
        'height': '50px',
      },
    },
    {
        selector: 'node:selected',
        style: {
            'border-width': '3px',
            'border-color': '#DAA520', // Gold
        }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
      },
    },
    {
      selector: 'node[type="cluster"]',
      style: {
        'background-color': 'rgba(200, 200, 200, 0.5)',
        'border-color': '#888',
        'border-width': '2px',
        'label': 'data(label)',
        'color': '#000',
        'text-valign': 'top',
        'text-halign': 'center',
        'font-size': '12px',
        'font-weight': 'bold',
      }
    },
    {
      selector: `node[id="${activeCluster}"]`,
      style: {
        'background-color': 'rgba(218, 165, 32, 0.5)', // Gold, semi-transparent
        'border-color': '#DAA520',
      }
    }
  ];

  const layout = {
    name: 'cose-bilkent',
    idealEdgeLength: 150,
    nodeRepulsion: 4500,
    animate: 'end',
    animationDuration: 500,
    fit: true,
    padding: 30,
  };

  return (
    <CytoscapeComponent
      elements={elements}
      stylesheet={stylesheet}
      style={{ width: '100%', height: '100%' }}
      layout={layout}
      cy={(cy) => {
        cy.on('tap', 'node[type="thought"]', (evt) => {
          const nodeId = evt.target.id();
          const thought = thoughts.find((t) => t.id === nodeId);
          if (thought) {
            onSelectThought(thought);
          }
        });

        cy.on('tap', 'node[type="cluster"]', (evt) => {
            const clusterId = evt.target.id();
            onClusterClick(clusterId);
        });

        // Clear selection style on background tap
        cy.on('tap', (evt) => {
            if (evt.target === cy) {
                cy.elements().removeClass('selected');
                onClusterClick(null); // Deselect cluster
            }
        });

        // Handle node selection style
        cy.elements().removeClass('selected');
        if (selectedThought) {
            cy.getElementById(selectedThought.id).addClass('selected');
        }
      }}
    />
  );
};

export default Canvas;
