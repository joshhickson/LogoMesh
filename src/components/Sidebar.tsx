import React from 'react';
import { Thought } from '../../contracts/entities';
import { User } from '../services/authService';

interface SidebarProps {
  user: User | null;
  thoughts: Thought[];
  onSelectThought: (thought: Thought) => void;
  onCreateThought: () => void;
  activeThought: Thought | null;
  onClusterThoughts: () => void;
  clusters: any[];
  activeCluster: string | null;
  onClusterClick: (clusterId: string | null) => void;
  onShowDevAssistant: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  thoughts,
  onSelectThought,
  onCreateThought,
  activeThought,
  onClusterThoughts,
  clusters,
  activeCluster,
  onClusterClick,
  onShowDevAssistant,
}) => {
  const renderThoughtList = (thoughtList: Thought[]) => (
    <ul>
      {thoughtList.map((thought) => (
        <li key={thought.id} className="mb-1">
          <div
            onClick={() => onSelectThought(thought)}
            className={`cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
              activeThought?.id === thought.id ? 'bg-blue-200 dark:bg-blue-800' : ''
            }`}
          >
            {thought.title}
          </div>
        </li>
      ))}
    </ul>
  );

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
          data-testid="toggle-cluster-view-btn"
        >
          {clusters.length > 0 ? 'Hide Clusters' : 'Show Clusters'}
        </button>
      </div>

      {/* Cluster and Thought List */}
      {clusters.length > 0 ? (
        <div>
          <h3 className="text-md font-semibold mb-2">Clusters</h3>
          <ul>
            {clusters.map((cluster) => (
              <li key={cluster.id} className="mb-1">
                <div
                  onClick={() => onClusterClick(cluster.id)}
                  className={`cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    activeCluster === cluster.id ? 'bg-purple-200 dark:bg-purple-800' : ''
                  }`}
                >
                  {cluster.label} ({cluster.thoughtIds.length})
                </div>
              </li>
            ))}
          </ul>
          <hr className="my-4" />
          <h3 className="text-md font-semibold mb-2">Thoughts</h3>
          {renderThoughtList(thoughts)}
        </div>
      ) : (
        <div>
          <h3 className="text-md font-semibold mb-2">Thoughts</h3>
          {renderThoughtList(thoughts)}
        </div>
      )}
    </div>
  );
};

export default Sidebar;