// TODO: This variable was flagged as unused by ESLint.
// import React, { useState, useEffect, useRef } from 'react';
import { useState, useEffect, useRef } from 'react';
import { VoiceInputManager } from '../utils/VoiceInputManager';
import { ulid } from 'ulid';

const defaultFieldOptions = [
  'Concept Type',
  'Date of Origin',
  'Location',
  'Value',
  'Custom Tags',
  'Related Concepts',
];

function AddThoughtModal({ createThought, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [color, setColor] = useState('#f97316');
  const [segments, setSegments] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const voiceManagerRef = useRef(null);

  useEffect(() => {
    voiceManagerRef.current = new VoiceInputManager(
      (transcript, isFinal, isNewSegment) => {
        if (isFinal) {
          if (isNewSegment && segments.length > 0) {
            const lastSegment = segments[segments.length - 1];
            setSegments((prev) =>
              prev.map((seg) =>
                seg.segment_id === lastSegment.segment_id
                  ? { ...seg, content: seg.content + ' ' + transcript }
                  : seg
              )
            );
          } else {
            setDescription((prev) => prev + ' ' + transcript);
          }
        }
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        // Show error in UI
        const errorMessages = {
          network: 'Network error occurred. Please check your connection.',
          'service-not-allowed': 'Speech recognition service not allowed.',
          'no-speech': 'No speech detected. Please try again.',
          default: 'An error occurred with speech recognition.',
        };
        alert(errorMessages[error] || errorMessages.default);
      }
    );

    return () => {
      if (voiceManagerRef.current) {
        voiceManagerRef.current.stopListening();
      }
    };
  }, [segments]);

  const toggleVoiceInput = () => {
    if (!voiceManagerRef.current?.isSupported()) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      voiceManagerRef.current.stopListening();
    } else {
      voiceManagerRef.current.startListening();
    }
    setIsListening(!isListening);
  };

  const addSegment = () => {
    setSegments([
      ...segments,
      {
        segment_id: ulid(),
        title: '',
        content: '',
        fields: {},
        embedding_vector: [],
      },
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
      title,
      description,
      created_at: new Date().toISOString(),
      color,
      tags: tags.map((tag) => ({ name: tag, color })), //Adjusted tag handling
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      segments,
    };

    createThought(newThought);
    onClose(); //Close the modal using onClose prop.
  };

  const handleTagChange = (e) => {
    const newTag = e.target.value;
    if (newTag) {
      setTags([...tags, newTag]);
      e.target.value = '';
    }
  };

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
        <div className="relative w-full mb-2">
          <div className="relative">
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
            {isListening && (
              <div className="absolute bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-700 p-2 text-sm italic">
                Listening... Click microphone to stop
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`absolute right-2 bottom-2 p-2 rounded-full ${
              isListening ? 'bg-red-500' : 'bg-gray-200'
            }`}
            title={isListening ? 'Stop recording' : 'Start recording'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Add Tag"
            onChange={handleTagChange}
            className="w-full mb-2 p-2 border rounded"
          />
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
            <div
              key={segment.segment_id}
              className="border rounded p-3 mb-3 bg-gray-50 dark:bg-gray-700"
            >
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

              <div className="flex gap-2 mb-2">
                <select
                  value={segment.abstraction_level || 'Fact'}
                  onChange={(e) => {
                    const updated = [...segments];
                    updated[segIndex].abstraction_level = e.target.value;
                    setSegments(updated);
                  }}
                  className="w-1/2 p-2 border rounded"
                >
                  <option value="Fact">Fact</option>
                  <option value="Idea">Idea</option>
                  <option value="Theme">Theme</option>
                  <option value="Goal">Goal</option>
                </select>

                <input
                  type="text"
                  placeholder="Cluster ID"
                  value={segment.cluster_id || ''}
                  onChange={(e) => {
                    const updated = [...segments];
                    updated[segIndex].cluster_id = e.target.value;
                    setSegments(updated);
                  }}
                  className="w-1/2 p-2 border rounded"
                />
              </div>

              {/* Render fields */}
              {Object.entries(segment.fields).map(
                ([key, value], fieldIndex) => (
                  <div key={fieldIndex} className="mb-2 flex gap-2">
                    <label className="w-1/3 text-sm">{key}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        updateSegmentField(segIndex, key, e.target.value)
                      }
                      className="w-2/3 p-1 border rounded"
                    />
                  </div>
                )
              )}

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
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
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