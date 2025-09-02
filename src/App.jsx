import { useState, useEffect } from 'react';
import Canvas from './components/Canvas';
import AddThoughtModal from './components/AddThoughtModal';
import Sidebar from './components/Sidebar';
import ThoughtDetailPanel from './components/ThoughtDetailPanel';
import DevAssistantPanel from './components/DevAssistantPanel';
import apiService from './services/apiService';
import { authService } from './services/authService';
import './App.css';

function App() {
  const [thoughts, setThoughts] = useState([]);
  const [relatedLinks, setRelatedLinks] = useState([]);
  const [selectedThought, setSelectedThought] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDevAssistant, setShowDevAssistant] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState([]); // Add activeFilters state

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

  const handleCreateThought = async (thoughtData) => {
    try {
      const newThought = await apiService.createThought(thoughtData);
      setThoughts([...thoughts, newThought]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create thought:", error);
    }
  };

  const handleUpdateThought = async (id, updatedThought) => {
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
        onShowDevAssistant={() => setShowDevAssistant(true)}
        user={user}
        thoughts={thoughts} // Pass thoughts to Sidebar
        setActiveFilters={setActiveFilters} // Pass setActiveFilters
      />
      <div className="main-content">
        <Canvas 
          thoughts={thoughts}
          relatedLinks={relatedLinks}
          selectedThought={selectedThought}
          onThoughtSelect={setSelectedThought}
          activeFilters={activeFilters} // Pass activeFilters to Canvas
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