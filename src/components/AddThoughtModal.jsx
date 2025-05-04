import React, { useState } from 'react';
import { newBubbleId, newSegmentId } from '../utils/eventBus';

const defaultFieldOptions = [
  'Concept Type',
  'Date of Origin',
  'Location',
  'Value',
  'Custom Tags',
  'Related Concepts'
];

function AddThoughtModal({ createThought, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [color, setColor] = useState('#f97316');
  const [segments, setSegments] = useState([]);

  const addSegment = () => {
    setSegments([
      ...segments,
      {
        segment_id: newSegmentId(),
        title: '',
        content: '',
        fields: {},
        embedding_vector: []
      }
    ]);
  };

  const updateSegmentField = (segmentIndex, fieldName, fieldValue) => {
    const updatedSegments = [...segments];
    updatedSegments[segmentIndex].fields[fieldName] = fieldValue;
    setSegments(updatedSegments);
  };

  const addCustomFieldToSegment = (segmentIndex) => {
    const fieldName = prompt('Enter custom field name:');
    if (!fieldName) return;
    updateSegmentField(segmentIndex, fieldName, '');
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a title for your thought.');
      return;
    }

    const newThought = {
      thought_bubble_id: newBubbleId(),
      title,
      description,
      created_at: new Date().toISOString(),
      color,
      tags: tags.map(tag => ({name: tag, color})), //Adjusted tag handling
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      segments
    };

    createThought(newThought);
    onClose(); //Close the modal using onClose prop.
  };

  const handleTagChange = (e) => {
    const newTag = e.target.value;
    if (newTag) {
      setTags([...tags, newTag]);
      e.target.value = "";
    }
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-11/12 max-w-2xl">
        <h2 className="text-lg font-bold mb-4">Add New Thought</h2>

        {/* Main Thought Info */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <div>
          <input type="text" placeholder="Add Tag" onChange={handleTagChange} className="w-full mb-2 p-2 border rounded"/>
          <ul>
            {tags.map((tag, index) => (
              <li key={index}>{tag}</li>
            ))}
          </ul>
        </div>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full mb-4"
        />

        {/* Segments */}
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2">Segments</h3>
          {segments.map((segment, segIndex) => (
            <div key={segment.segment_id} className="border rounded p-3 mb-3 bg-gray-50 dark:bg-gray-700">
              <input
                type="text"
                placeholder="Segment Title"
                value={segment.title}
                onChange={(e) => {
                  const updated = [...segments];
                  updated[segIndex].title = e.target.value;
                  setSegments(updated);
                }}
                className="w-full mb-2 p-2 border rounded"
              />
              <textarea
                placeholder="Segment Content"
                value={segment.content}
                onChange={(e) => {
                  const updated = [...segments];
                  updated[segIndex].content = e.target.value;
                  setSegments(updated);
                }}
                className="w-full mb-2 p-2 border rounded"
              />

              {/* Render fields */}
              {Object.entries(segment.fields).map(([key, value], fieldIndex) => (
                <div key={fieldIndex} className="mb-2 flex gap-2">
                  <label className="w-1/3 text-sm">{key}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateSegmentField(segIndex, key, e.target.value)}
                    className="w-2/3 p-1 border rounded"
                  />
                </div>
              ))}

              {/* Add Field Options */}
              <div className="flex justify-between items-center mb-3">
                <select
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value !== '') updateSegmentField(segIndex, value, '');
                    e.target.selectedIndex = 0;
                  }}
                  className="w-2/3 p-2 border rounded"
                >
                  <option value="">+ Add predefined field</option>
                  {defaultFieldOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <button
                  onClick={() => addCustomFieldToSegment(segIndex)}
                  className="text-sm text-blue-500 hover:underline"
                >
                  + Custom Field
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addSegment}
            className="w-full mt-2 bg-green-500 text-white py-1 rounded"
          >
            + Add Segment
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded mb-2"
        >
          Add Thought
        </button>
        <button
          onClick={onClose}
          className="w-full bg-gray-300 dark:bg-gray-600 text-black dark:text-white py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AddThoughtModal;