import React, { useState } from 'react';
import { Thought } from '../../contracts/entities';

type NewThoughtData = Omit<Thought, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;

interface AddThoughtModalProps {
  onClose: () => void;
  onCreateThought: (thoughtData: NewThoughtData) => void;
  userId: string;
}

const AddThoughtModal: React.FC<AddThoughtModalProps> = ({ onClose, onCreateThought, userId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#f97316');

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a title for your thought.');
      return;
    }

    const newThoughtData: NewThoughtData = {
      title,
      description,
      color,
      // Default other properties as needed
      tags: [],
      segments: [],
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      fields: {},
      metadata: {},
    };

    onCreateThought(newThoughtData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto z-20">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-11/12 max-w-2xl">
        <h2 className="text-lg font-bold mb-4">Add New Thought</h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <label className="block text-sm font-medium mt-2">Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full mb-4"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded mb-2"
        >
          Add Thought
        </button>
        <button
          onClick={onClose}
          className="w-full bg-gray-300 dark:bg-gray-600 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddThoughtModal;