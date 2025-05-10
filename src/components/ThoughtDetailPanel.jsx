import React from 'react';
import { graphService } from '../services/graphService';

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
    // Update field type if it's a field value
    if (field.startsWith('fields.')) {
      const fieldName = field.split('.')[1];
      graphService.updateFieldType(fieldName, value);
    }
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
    // Update in graph service
    graphService.updateSegment(segmentId, field, value).catch(console.error);
  };

  const handleAddField = (segmentId) => {
    const fieldName = prompt('Enter field name:');
    if (!fieldName) return;

    setThoughts(prevThoughts => 
      prevThoughts.map(t => {
        if (t.thought_bubble_id === thought.thought_bubble_id) {
          return {
            ...t,
            segments: t.segments.map(s => 
              s.segment_id === segmentId ? {
                ...s,
                fields: { ...s.fields, [fieldName]: '' }
              } : s
            )
          };
        }
        return t;
      })
    );
  };

  const handleRemoveField = (segmentId, fieldName) => {
    setThoughts(prevThoughts => 
      prevThoughts.map(t => {
        if (t.thought_bubble_id === thought.thought_bubble_id) {
          return {
            ...t,
            segments: t.segments.map(s => {
              if (s.segment_id === segmentId) {
                const { [fieldName]: removed, ...remainingFields } = s.fields;
                return { ...s, fields: remainingFields };
              }
              return s;
            })
          };
        }
        return t;
      })
    );
  };

  const handleDeleteSegment = (segmentId) => {
    if (!window.confirm('Are you sure you want to delete this segment?')) return;

    setThoughts(prevThoughts => 
      prevThoughts.map(t => {
        if (t.thought_bubble_id === thought.thought_bubble_id) {
          return {
            ...t,
            segments: t.segments.filter(s => s.segment_id !== segmentId)
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
        {(thought.segments || []).map((segment) => (
          <div key={`seg_detail_${segment.segment_id}`} className="mb-4 border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-center mb-2">
              <input
                type="text"
                value={segment.title}
                onChange={(e) => handleSegmentEdit(segment.segment_id, 'title', e.target.value)}
                className="font-medium w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
                placeholder="Segment Title"
              />
              <button
                onClick={() => handleDeleteSegment(segment.segment_id)}
                className="text-red-500 hover:text-red-700 ml-2"
                title="Delete Segment"
              >
                ×
              </button>
            </div>

            <textarea
              value={segment.content}
              onChange={(e) => handleSegmentEdit(segment.segment_id, 'content', e.target.value)}
              className="text-sm mb-3 w-full bg-transparent border rounded p-2 hover:border-gray-300 focus:border-blue-500 outline-none resize-y"
              placeholder="Segment Content"
            />

            {/* Segment Fields */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Fields</h4>
                <button
                  onClick={() => handleAddField(segment.segment_id)}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  + Add Field
                </button>
              </div>

              {segment.fields && Object.entries(segment.fields).map(([fieldName, fieldValue], i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="font-medium min-w-[100px]">{fieldName}:</span>
                  <input
                    type="text"
                    value={fieldValue}
                    onChange={(e) => handleSegmentEdit(segment.segment_id, `fields.${fieldName}`, e.target.value)}
                    className="flex-1 bg-transparent border rounded px-2 py-1"
                  />
                  <button
                    onClick={() => handleRemoveField(segment.segment_id, fieldName)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Field"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThoughtDetailPanel;