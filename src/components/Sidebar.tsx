import React from 'react';
import { Thought } from '../../contracts/entities';
import { User } from '../services/authService';

interface SidebarProps {
  thoughts: Thought[];
  user: User | null;
  onCreateThought: () => void;
  onClusterThoughts: () => void;
  onShowDevAssistant: () => void;
  setSelectedThought: (thought: Thought) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  thoughts,
  user,
  onCreateThought,
  onClusterThoughts,
  onShowDevAssistant,
  setSelectedThought,
}) => {
  return (
    <div className="w-1/4 p-4 border-r bg-gray-50 dark:bg-gray-800 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">LogoMesh</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">{user?.name}</span>
          <button
            onClick={onShowDevAssistant}
            className="px-2 py-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Toggle Dev Assistant"
          >
            🤖
          </button>
        </div>
      </div>

      {/* Main Actions */}
      <div className="space-y-2 mb-4">
        <button
          onClick={onCreateThought}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New Thought
        </button>
        <button
          onClick={onClusterThoughts}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Toggle Cluster View
        </button>
      </div>

      {/* Thought List */}
      <h3 className="text-md font-semibold mb-2">Thoughts</h3>
      <ul>
        {thoughts.map((thought) => (
          <li key={thought.id} className="mb-1">
            <div
              onClick={() => setSelectedThought(thought)}
              className="cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {thought.title}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;