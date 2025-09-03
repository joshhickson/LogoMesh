import React, { useState, useEffect } from 'react';
import { Thought } from '../../contracts/entities';

interface ThoughtDetailPanelProps {
  thought: Thought;
  onClose: () => void;
  onUpdate: (id: string, updatedThought: Partial<Thought>) => void;
}

const ThoughtDetailPanel: React.FC<ThoughtDetailPanelProps> = ({ thought, onClose, onUpdate }) => {
  const [editableThought, setEditableThought] = useState<Partial<Thought>>(thought);

  useEffect(() => {
    setEditableThought(thought);
  }, [thought]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableThought(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(thought.thought_bubble_id, editableThought);
  };

  if (!thought) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-1/3 bg-white dark:bg-gray-800 shadow-lg p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Thought Details</h2>
        <button onClick={onClose} className="p-2">Close</button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={editableThought.title || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={editableThought.description || ''}
            onChange={handleChange}
            rows={5}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ThoughtDetailPanel;