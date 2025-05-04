
import React from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { graphService } from '../services/graphService';

function Canvas({ thoughts, setSelectedThought, activeFilters }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  React.useEffect(() => {
    // Convert thoughts to ReactFlow nodes
    const flowNodes = thoughts.map(thought => ({
      id: thought.thought_bubble_id,
      data: { label: thought.title },
      position: thought.position || { x: 0, y: 0 },
      style: {
        background: thought.color || '#f3f4f6',
        opacity: activeFilters?.length ? 
          (activeFilters.includes(thought.thought_bubble_id) ? 1 : 0.3) : 1
      }
    }));

    setNodes(flowNodes);
  }, [thoughts, activeFilters]);

  const handleNodeClick = (event, node) => {
    const thought = thoughts.find(t => t.thought_bubble_id === node.id);
    if (thought) {
      setSelectedThought(thought);
    }
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
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
