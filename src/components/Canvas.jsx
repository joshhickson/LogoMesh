import React from 'react';
import ReactFlow, { MiniMap, Controls } from 'react-flow-renderer';

function Canvas({ thoughts, setSelectedThought, activeFilters }) {
  // Build React Flow nodes from your thoughts
  const nodes = thoughts.map((thought) => {
    const matchesFilter = !activeFilters?.length || activeFilters.includes(thought.thought_bubble_id);

    return {
      id: thought.thought_bubble_id,               // use the schema’s ID
      type: 'default',
      data: { label: thought.title },
      position: thought.position || { x: Math.random() * 400, y: Math.random() * 400 },
      style: {
        background: thought.color || '#f3f4f6',
        border: matchesFilter ? '3px solid #3b82f6' : '1px solid #d1d5db',
        opacity: matchesFilter ? 1 : 0.3,
        borderRadius: 8,
        padding: 10,
        transition: 'all 0.3s ease',
      },
    };
  });

  // If you ever need edges, build an array here:
  const edges = []; // no edges defined yet

  const onElementClick = (_, element) => {
    // find by thought_bubble_id
    const found = thoughts.find(t => t.thought_bubble_id === element.id);
    if (found) setSelectedThought(found);
  };

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-900">
      <ReactFlow
        elements={[...nodes, ...edges]}
        onElementClick={onElementClick}
        style={{ width: '100%', height: '100%' }}
      >
        <MiniMap 
          nodeStrokeColor={n => (activeFilters.includes(n.id) ? '#3b82f6' : '#888')} 
          nodeColor={n => (activeFilters.includes(n.id) ? '#3b82f6' : '#fff')} 
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default Canvas;
