import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import ThoughtDetailPanel from './components/ThoughtDetailPanel';
import AddThoughtModal from './components/AddThoughtModal';
import apiService from './services/apiService';
import { Thought } from '../contracts/entities';
import { User } from './services/authService';
import './App.css';

const App: React.FC = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [user, setUser] = useState<User | null>({ id: '1', name: 'Dev' }); // Mock user
  const [showAddThoughtModal, setShowAddThoughtModal] = useState<boolean>(false);
  const [clusters, setClusters] = useState<any[]>([]); // Define proper type later
  const [activeCluster, setActiveCluster] = useState<string | null>(null);


  useEffect(() => {
    const fetchThoughts = async () => {
      if (user) {
        try {
          const fetchedThoughts = await apiService.getThoughts(user.id);
          setThoughts(fetchedThoughts);
        } catch (error) {
          console.error('Error fetching thoughts:', error);
        }
      }
    };
    fetchThoughts();
  }, [user]);

  const handleClusterThoughts = async () => {
      if (activeCluster) {
          // If clusters are already active, toggle them off
          setActiveCluster(null);
          setClusters([]);
          return;
      }
      try {
          const fetchedClusters = await apiService.getThoughtClusters(user!.id);
          setClusters(fetchedClusters);
      } catch (error) {
          console.error('Error fetching thought clusters:', error);
      }
  };

  const handleUpdateThought = (updatedThought: Thought) => {
    setThoughts(thoughts.map(t => t.id === updatedThought.id ? updatedThought : t));
    if (selectedThought && selectedThought.id === updatedThought.id) {
      setSelectedThought(updatedThought);
    }
  };

  const handleCreateThought = async (newThoughtData: Omit<Thought, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (user) {
        try {
            const newThought = await apiService.createThought(user.id, newThoughtData);
            setThoughts([...thoughts, newThought]);
            setShowAddThoughtModal(false);
        } catch (error) {
            console.error('Error creating thought:', error);
        }
    }
  };

  return (
    <div className="App">
      <Sidebar
        user={user}
        thoughts={thoughts}
        onSelectThought={setSelectedThought}
        onCreateThought={() => setShowAddThoughtModal(true)}
        activeThought={selectedThought}
        onClusterThoughts={handleClusterThoughts}
        clusters={clusters}
        activeCluster={activeCluster}
        onClusterClick={setActiveCluster}
        onShowDevAssistant={() => { /* Placeholder */ }}
      />
      <main className="main-content">
        <Canvas
          thoughts={thoughts}
          onSelectThought={setSelectedThought}
          selectedThought={selectedThought}
          clusters={clusters}
          activeCluster={activeCluster}
          onClusterClick={setActiveCluster}
        />
        {selectedThought && (
          <ThoughtDetailPanel
            thought={selectedThought}
            onUpdate={handleUpdateThought}
            onClose={() => setSelectedThought(null)}
          />
        )}
      </main>
      {showAddThoughtModal && (
        <AddThoughtModal
          onClose={() => setShowAddThoughtModal(false)}
          onCreateThought={handleCreateThought}
          userId={user!.id}
        />
      )}
    </div>
  );
};

export default App;
