
import React from 'react';
import ReactFlow, { 

import { graphService } from '../services/graphService';

  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

function Canvas({ thoughts, setSelectedThought, activeFilters }) {
  const [filteredThoughts, setFilteredThoughts] = React.useState(thoughts);

  React.useEffect(() => {
    if (activeFilters?.length) {
      const filterByTags = async () => {
        const results = await Promise.all(
          activeFilters.map(tag => graphService.findThoughtsByTag(tag))
        );
        const filtered = results.flat().map(t => t.properties);
        setFilteredThoughts(filtered);
      };
      filterByTags();
    } else {
      setFilteredThoughts(thoughts);
    }
  }, [thoughts, activeFilters]);
  // Convert thoughts to nodes
  const initialNodes = thoughts.map((thought) => ({
    id: thought.thought_bubble_id,
    type: 'default',
    data: { label: thought.title },
    position: thought.position || { x: Math.random() * 400, y: Math.random() * 400 },
    style: {
      background: thought.color || '#f3f4f6',
      border: activeFilters?.includes(thought.thought_bubble_id) ? '3px solid #3b82f6' : '1px solid #d1d5db',
      opacity: activeFilters?.length ? (activeFilters.includes(thought.thought_bubble_id) ? 1 : 0.3) : 1,
      borderRadius: 8,
      padding: 10,
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onNodeClick = (event, node) => {
    const thought = thoughts.find(t => t.thought_bubble_id === node.id);
    if (thought) setSelectedThought(thought);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default Canvas;
