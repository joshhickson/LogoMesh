import React from 'react';
import { Alchemy, GraphCanvas } from 'alchemy-graph-react';
import { graphService } from '../services/graphService';

function Canvas({ thoughts, setSelectedThought, activeFilters }) {
  const [graphData, setGraphData] = React.useState({ nodes: [], edges: [] });

  React.useEffect(() => {
    // Convert thoughts to ReGraph format
    const nodes = thoughts.map(thought => ({
      id: thought.thought_bubble_id,
      caption: thought.title,
      properties: thought,
      type: 'thought',
      style: {
        fill: thought.color || '#f3f4f6',
        stroke: activeFilters?.includes(thought.thought_bubble_id) ? '#3b82f6' : '#d1d5db',
        opacity: activeFilters?.length ? (activeFilters.includes(thought.thought_bubble_id) ? 1 : 0.3) : 1
      }
    }));

    // Create edges from segment relationships
    const edges = [];
    thoughts.forEach(thought => {
      if (thought.segments) {
        thought.segments.forEach(segment => {
          edges.push({
            source: thought.thought_bubble_id,
            target: segment.segment_id,
            caption: 'HAS_SEGMENT'
          });
        });
      }
    });

    setGraphData({ nodes, edges });
  }, [thoughts, activeFilters]);

  const config = {
    nodeCaption: 'caption',
    nodeStyle: {
      radius: 25,
      borderWidth: 2,
      cursor: 'pointer'
    },
    edgeStyle: {
      width: 1,
      arrow: true
    }
  };

  const handleNodeClick = (node) => {
    const thought = thoughts.find(t => t.thought_bubble_id === node.id);
    if (thought) {
      setSelectedThought(thought);
    }
  };

  return (
    <div className="w-full h-full">
      <Alchemy graphData={graphData} config={config} onNodeClick={handleNodeClick}>
        <GraphCanvas />
      </Alchemy>
    </div>
  );
}

export default Canvas;