import React from 'react';

function ThoughtDetailPanel({ thought }) {
  return (
    <div className="w-1/4 p-4 border-l bg-gray-50 dark:bg-gray-800 overflow-y-auto">
      <h2 className="text-lg font-bold mb-2">{thought.title}</h2>
      <p className="mb-2">{thought.description}</p>
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
            <p className="font-medium">{segment.title}</p>
            <p className="text-sm mb-1">{segment.content}</p>

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
