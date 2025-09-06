import React from 'react';

const ThoughtDetailPanel = ({ thought, onClose }) => {
  if (!thought) return null;

  return (
    <div className="thought-detail-panel">
      <div className="header">
        <h2>{thought.title}</h2>
        <button
          onClick={onClose}
          role="button"
          aria-label="Close"
          className="close-button"
        >
          Close
        </button>
      </div>
      <div className="content">
        <p>{thought.content}</p>
      </div>
      <div className="form-section">
        <input
          type="text"
          defaultValue={thought.title}
          aria-label="Thought title"
        />
        <textarea
          defaultValue={thought.content}
          aria-label="Thought content"
        />
      </div>
    </div>
  );
};

export default ThoughtDetailPanel;