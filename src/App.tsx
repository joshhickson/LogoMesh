import React, { useState, useEffect } from 'react';
import Canvas from './components/Canvas';
import AddThoughtModal from './components/AddThoughtModal';
import Sidebar from './components/Sidebar';
import ThoughtDetailPanel from './components/ThoughtDetailPanel';
import DevAssistantPanel from './components/DevAssistantPanel';
import apiService from './services/apiService';
import { authService, User } from './services/authService';
import { Thought } from '../contracts/entities';
import { NewThoughtData } from '../contracts/storageAdapter';
import { RelatedThoughtLink } from '../core/services/meshGraphEngine';
import './App.css';

type Clusters = Record<string, Thought[]>;

function App(): React.ReactElement {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [relatedLinks, setRelatedLinks] = useState<RelatedThoughtLink[]>([]);
  const [clusters, setClusters] = useState<Clusters>({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showDevAssistant, setShowDevAssistant] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (selectedThought) {
      apiService.getRelatedThoughts(selectedThought.thought_bubble_id).then(links => {
        setRelatedLinks(links);
      }).catch(error => {
        console.error("Failed to fetch related thoughts:", error);
        setRelatedLinks([]);
      });
    } else {
      setRelatedLinks([]);
    }
  }, [selectedThought]);

  const initializeApp = async () => {
    setIsLoading(true);
    try {
      // Check authentication first
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      // Load thoughts if authenticated
      if (currentUser && currentUser.isAuthenticated) {
        await loadThoughts();
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadThoughts = async () => {
    try {
      const fetchedThoughts = await apiService.fetchThoughts();
      setThoughts(fetchedThoughts);
    } catch (error) {
      console.error("Failed to fetch thoughts:", error);
    }
  };

  const handleCreateThought = async (thoughtData: NewThoughtData) => {
    try {
      const newThought = await apiService.createThought(thoughtData);
      if (newThought) {
        setThoughts([...thoughts, newThought]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create thought:", error);
    }
  };

  const handleUpdateThought = async (id: string, updatedThought: Partial<Thought>) => {
    try {
      await apiService.updateThought(id, updatedThought);
      const updatedThoughts = thoughts.map(thought =>
        thought.id === id ? { ...thought, ...updatedThought } : thought
      );
      setThoughts(updatedThoughts);
      setSelectedThought({ ...selectedThought, ...updatedThought });
    } catch (error) {
      console.error("Failed to update thought:", error);
    }
  };

  const handleClusterThoughts = async () => {
    try {
      const fetchedClusters = await apiService.fetchClusters();
      setClusters(fetchedClusters);
    } catch (error) {
      console.error("Failed to fetch clusters:", error);
      setClusters({});
    }
  };

  if (isLoading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">
          <p>Loading LogoMesh...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAuthenticated) {
    return (
      <div className="app auth-required">
        <div className="auth-container">
          <h1>Welcome to LogoMesh</h1>
          <p>Please log in with your Replit account to access your thoughts and ideas.</p>
          <div className="auth-button-container">
            <script
              data-authenticated="location.reload()"
              src="https://auth.util.repl.co/script.js"
            ></script>
          </div>
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => {
                // For development - bypass auth
                setUser({ id: 'dev-user', name: 'Development User', isAuthenticated: true });
              }}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Continue as Guest (Development Mode)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar 
        onCreateThought={() => setIsModalOpen(true)}
        onClusterThoughts={handleClusterThoughts}
        onShowDevAssistant={() => setShowDevAssistant(true)}
        user={user}
        thoughts={thoughts}
        setActiveFilters={setActiveFilters}
        setSelectedThought={setSelectedThought}
      />
      <div className="main-content">
        <button
          onClick={handleClusterThoughts}
          className="absolute top-20 right-4 z-10 bg-purple-600 text-white py-2 px-4 rounded shadow-lg hover:bg-purple-700"
        >
          Cluster Thoughts
        </button>
        <Canvas 
          thoughts={thoughts}
          clusters={clusters}
          relatedLinks={relatedLinks}
          selectedThought={selectedThought}
          onThoughtSelect={setSelectedThought}
          onUpdateThought={handleUpdateThought}
          filteredThoughtIds={activeFilters}
        />
        {selectedThought && (
          <ThoughtDetailPanel
            thought={selectedThought}
            onClose={() => setSelectedThought(null)}
            onUpdate={handleUpdateThought}
          />
        )}
      </div>

      {isModalOpen && (
        <AddThoughtModal 
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateThought}
        />
      )}

      {showDevAssistant && (
        <DevAssistantPanel
          onClose={() => setShowDevAssistant(false)}
        />
      )}
    </div>
  );
}

export default App;