import React from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState
} from 'reactflow';
import { graphService } from '../services/graphService';
import 'reactflow/dist/style.css';

function Canvas({ thoughts, setSelectedThought, activeFilters }) {
  const [filteredThoughts, setFilteredThoughts] = React.useState(thoughts);

  React.useEffect(() => {
    if (activeFilters?.length) {
      const filterByTags = async () => {
        try {
          const results = await Promise.all(
            activeFilters.map(tag => graphService.findThoughtsByTag(tag))
          );
          const filtered = results.flat().map(t => t.properties);
          setFilteredThoughts(filtered);
        } catch (error) {
          console.warn('Graph filtering unavailable:', error);
          // Fall back to client-side filtering
          const filtered = thoughts.filter(thought => 
            thought.tags?.some(tag => activeFilters.includes(tag.name))
          );
          setFilteredThoughts(filtered);
        }
      };
      filterByTags();
    } else {
      setFilteredThoughts(thoughts);
    }
  }, [thoughts, activeFilters]);

  const initialNodes = filteredThoughts.map((thought) => ({
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

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow 
        nodes={initialNodes}
        onNodeClick={(_, node) => setSelectedThought(node.id)}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default Canvas;