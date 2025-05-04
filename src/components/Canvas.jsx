
import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { graphService } from '../services/graphService';

function Canvas({ thoughts, setSelectedThought, activeFilters }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params) => {
    // Create new segment when edge is drawn
    const sourceThought = thoughts.find(t => t.thought_bubble_id === params.source);
    const targetThought = thoughts.find(t => t.thought_bubble_id === params.target);
    
    if (sourceThought && targetThought) {
      const newSegment = {
        segment_id: `seg_${params.source}_${params.target}`,
        sourcePosition: sourceThought.position,
        targetPosition: targetThought.position
      };
      
      sourceThought.segments = [...(sourceThought.segments || []), newSegment];
      localStorage.setItem('thought-web-data', JSON.stringify(thoughts));
      
      setEdges(eds => addEdge(params, eds));
    }
  }, [thoughts, setEdges]);

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

    // Create edges from segments
    const flowEdges = thoughts.flatMap(thought => 
      (thought.segments || []).map(segment => ({
        id: `${thought.thought_bubble_id}-${segment.segment_id}`,
        source: thought.thought_bubble_id,
        target: segment.segment_id,
        style: { strokeDasharray: '5 5' }, // Dotted line for fuzzy connections
        animated: true
      }))
    );

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [thoughts, activeFilters]);

  const handleNodeClick = (event, node) => {
    const thought = thoughts.find(t => t.thought_bubble_id === node.id);
    if (thought) {
      setSelectedThought(thought);
    }
  };

  const handleNodeDragStop = (event, node) => {
    const updatedThoughts = thoughts.map(thought => {
      if (thought.thought_bubble_id === node.id) {
        return {
          ...thought,
          position: node.position,
          segments: (thought.segments || []).map(segment => ({
            ...segment,
            sourcePosition: node.position
          }))
        };
      }
      return thought;
    });
    
    // Update edges to follow node positions
    const newEdges = edges.map(edge => ({
      ...edge,
      sourcePosition: nodes.find(n => n.id === edge.source)?.position,
      targetPosition: nodes.find(n => n.id === edge.target)?.position
    }));
    
    setEdges(newEdges);
    localStorage.setItem('thought-web-data', JSON.stringify(updatedThoughts));
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
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
