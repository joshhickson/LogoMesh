import React, { useState, useEffect } from 'react';
import Canvas from './components/Canvas';
import AddThoughtModal from './components/AddThoughtModal';
import Sidebar from './components/Sidebar';
import ThoughtDetailPanel from './components/ThoughtDetailPanel';
import DevAssistantPanel from './components/DevAssistantPanel';
import * as apiService from './services/apiService';
import { authService, User } from './services/authService';
import './App.css';
import { Thought } from '../contracts/entities';
import { NewThoughtData } from '@contracts/storageAdapter';

function App() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDevAssistant, setShowDevAssistant] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]); // Add activeFilters state

  useEffect(() => {
    initializeApp();
  }, []);

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

  const handleCreateThought = async (thoughtData: NewThoughtData): Promise<Thought> => {
    try {
      const newThought = await apiService.createThoughtApi(thoughtData);
      setThoughts([...thoughts, newThought]);
      setIsModalOpen(false);
      return newThought;
    } catch (error) {
      console.error("Failed to create thought:", error);
      throw error;
    }
  };

  const handleUpdateThought = async (id: string, updatedThought: Partial<NewThoughtData>) => {
    try {
      await apiService.updateThoughtApi(id, updatedThought);
      const updatedThoughts = thoughts.map(thought =>
        thought.id === id ? { ...thought, ...updatedThought } as Thought : thought
      );
      setThoughts(updatedThoughts);
      if (selectedThought && selectedThought.id === id) {
        setSelectedThought({ ...selectedThought, ...updatedThought } as Thought);
      }
    } catch (error) {
      console.error("Failed to update thought:", error);
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
        thoughts={thoughts} // Pass thoughts to Sidebar
        setThoughts={setThoughts}
        setSelectedThought={setSelectedThought}
        setShowModal={setIsModalOpen}
        toggleDarkMode={() => {}}
        setActiveFilters={setActiveFilters} // Pass setActiveFilters
        onRefreshThoughts={loadThoughts}
      />
      <div className="main-content">
        <Canvas
          thoughts={thoughts}
          setSelectedThought={setSelectedThought}
          filteredThoughtIds={activeFilters} // Pass activeFilters to Canvas
          onUpdateThought={handleUpdateThought}
        />
        {selectedThought && (
          <ThoughtDetailPanel
            thought={selectedThought}
            onClose={() => setSelectedThought(null)}
          />
        )}
      </div>

      {isModalOpen && (
        <AddThoughtModal
          onClose={() => setIsModalOpen(false)}
          createThought={handleCreateThought}
          createSegment={apiService.createSegmentApi}
        />
      )}

      {showDevAssistant && (
        <DevAssistantPanel
        />
      )}
    </div>
  );
}

export default App;