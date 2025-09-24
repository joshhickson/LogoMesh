import React from 'react';
import { Thought } from '@contracts/entities';

interface ThoughtDetailPanelProps {
  thought: Thought | null;
  onClose: () => void;
}

const ThoughtDetailPanel: React.FC<ThoughtDetailPanelProps> = ({ thought, onClose }) => {
  if (!thought) return null;

  const content = thought.segments?.[0]?.content || '';

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
        <p>{content}</p>
      </div>
      <div className="form-section">
        <input
          type="text"
          defaultValue={thought.title}
          aria-label="Thought title"
        />
        <textarea
          defaultValue={content}
          aria-label="Thought content"
        />
      </div>
    </div>
  );
};

export default ThoughtDetailPanel;