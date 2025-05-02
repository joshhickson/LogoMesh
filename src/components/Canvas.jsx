import React from 'react';
import ReactFlow from 'react-flow-renderer';

function Canvas({ thoughts, setSelectedThought, activeFilters }) {
  const elements = thoughts.map((thought) => {
    const matchesFilter = activeFilters?.length
      ? activeFilters.includes(thought.id)
      : true;

    return {
      id: thought.id,
      data: { label: thought.title },
      position: thought.position || { x: Math.random() * 250, y: Math.random() * 250 },
      style: {
        backgroundColor: thought.color || '#f3f4f6',
        border: matchesFilter ? '3px solid #3b82f6' : '1px solid #d1d5db',
        opacity: matchesFilter ? 1 : 0.3,
        transition: 'all 0.3s ease'
      }
    };
  });

  const onElementClick = (event, element) => {
    const found = thoughts.find((thought) => thought.id === element.id);
    if (found) setSelectedThought(found);
  };

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-900">
      <ReactFlow
        elements={elements}
        onElementClick={onElementClick}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default Canvas;
