import React, { useState } from 'react';

function ThoughtDetailPanel({ thought, setThoughts }) {
  // State management is now handled through parent component
  
  const handleThoughtEdit = (field, value) => {
    setThoughts(prevThoughts => 
      prevThoughts.map(t => 
        t.thought_bubble_id === thought.thought_bubble_id 
          ? { ...t, [field]: value }
          : t
      )
    );
  };

  const handleSegmentEdit = (segmentId, field, value) => {
    setThoughts(prevThoughts => 
      prevThoughts.map(t => {
        if (t.thought_bubble_id === thought.thought_bubble_id) {
          return {
            ...t,
            segments: t.segments.map(s => 
              s.segment_id === segmentId ? { ...s, [field]: value } : s
            )
          };
        }
        return t;
      })
    );
  };

  return (
    <div className="w-1/4 p-4 border-l bg-gray-50 dark:bg-gray-800 overflow-y-auto">
      <input
        type="text"
        value={thought.title}
        onChange={(e) => handleThoughtEdit('title', e.target.value)}
        className="text-lg font-bold mb-2 w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
      />
      <textarea
        value={thought.description}
        onChange={(e) => handleThoughtEdit('description', e.target.value)}
        className="mb-2 w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 outline-none resize-y"
      />
      <p className="mb-2 text-sm text-gray-500">
        Created: {new Date(thought.created_at).toLocaleDateString()}
      </p>

      {/* Tags */}
      <div className="mb-4">
        <strong>Tags:</strong>
        <ul className="mt-1">
          {(thought.tags || []).map((tag, index) => (
            <li key={index} style={{ color: tag.color }}>
              {tag.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Segments */}
      <div>
        <h3 className="text-md font-semibold mb-2">Segments:</h3>
        {(thought.segments || []).map((segment, index) => (
          <div key={segment.segment_id || index} className="mb-4 border-t pt-2">
            <input
              type="text"
              value={segment.title}
              onChange={(e) => handleSegmentEdit(segment.segment_id, 'title', e.target.value)}
              className="font-medium w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
            />
            <textarea
              value={segment.content}
              onChange={(e) => handleSegmentEdit(segment.segment_id, 'content', e.target.value)}
              className="text-sm mb-1 w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 outline-none resize-y"
            />

            {/* Segment Fields */}
            {segment.fields && Object.keys(segment.fields).length > 0 && (
              <div className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {Object.entries(segment.fields).map(([fieldName, fieldValue], i) => (
                  <p key={i}>
                    <strong>{fieldName}:</strong> {Array.isArray(fieldValue) ? fieldValue.join(', ') : fieldValue}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThoughtDetailPanel;
