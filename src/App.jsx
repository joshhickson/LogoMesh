import React, { useState, useCallback, useEffect } from 'react';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import ThoughtDetailPanel from './components/ThoughtDetailPanel';
import AddThoughtModal from './components/AddThoughtModal';
import DevAssistantPanel from './components/DevAssistantPanel';

function App() {
  const [thoughts, setThoughts] = useState([]);
  const [selectedThought, setSelectedThought] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const dark = localStorage.getItem('thought-web-dark-mode');
    if (dark === 'true') {
      document.documentElement.classList.add('dark');
      return true;
    }
    return false;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchThoughts = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedThoughts = await apiService.fetchThoughts();
      setThoughts(fetchedThoughts);
      setError(null);
    } catch (err) {
      setError('Failed to load thoughts');
      console.error('Error fetching thoughts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createThought = useCallback(
    async ({ title, description, tags, segments }) => {
      try {
        const thoughtData = {
          title,
          description,
          tags: tags.map((tag) => ({ name: tag, color: '#10b981' })),
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          segments: segments.map((segment) => ({
            ...segment,
            embedding_vector: [], // Assuming a comma was missing here before an implicit next line
          })),
        };
        const newThought = await apiService.createThoughtApi(thoughtData);
        await fetchThoughts(); // Re-fetch all thoughts to ensure consistency
        return newThought;
      } catch (err) {
        setError('Failed to create thought');
        console.error('Error creating thought:', err);
        throw err;
      }
    },
    [fetchThoughts]
  );

  const refreshThoughts = useCallback(() => {
    fetchThoughts();
  }, [fetchThoughts]);

  const handleUpdateThought = useCallback(
    async (thoughtId, updatedData) => {
      try {
        const updatedThought = await apiService.updateThoughtApi(
          thoughtId,
          updatedData
        );
        await fetchThoughts(); // Re-fetch to ensure consistency
        setSelectedThought(updatedThought);
      } catch (err) {
        setError('Failed to update thought');
        console.error('Error updating thought:', err);
      }
    },
    [fetchThoughts]
  );

  const handleDeleteThought = useCallback(
    async (thoughtId) => {
      try {
        await apiService.deleteThoughtApi(thoughtId);
        await fetchThoughts(); // Re-fetch to ensure consistency
        if (selectedThought && selectedThought.thought_bubble_id === thoughtId) {
          setSelectedThought(null);
        }
      } catch (err) {
        setError('Failed to delete thought');
        console.error('Error deleting thought:', err);
      }
    },
    [selectedThought, fetchThoughts]
  );

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const thoughtsResponse = await apiService.fetchThoughts();
        setThoughts(thoughtsResponse || []);
      } catch (error) {
        console.warn('Backend API not available:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    localStorage.setItem('thought-web-dark-mode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  };

  // Handle position updates from Canvas (for drag operations)
  const handlePositionUpdate = (updatedThought) => {
    // Update local state immediately for smooth interaction
    setThoughts(prev =>
      prev.map(thought =>
        thought.thought_bubble_id === updatedThought.thought_bubble_id ? updatedThought : thought
      )
    );

    // Debounce API call to avoid too many requests during dragging
    clearTimeout(window.positionUpdateTimeout);
    window.positionUpdateTimeout = setTimeout(() => {
      handleUpdateThought(updatedThought.thought_bubble_id, {position: updatedThought.position});
    }, 500);
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      <Sidebar
        thoughts={thoughts}
        setThoughts={setThoughts}
        setSelectedThought={setSelectedThought}
        setShowModal={setShowModal}
        toggleDarkMode={toggleDarkMode}
        setActiveFilters={setActiveFilters}
      />
      {error && (
        <div
          className="error-banner"
          style={{
            background: '#fee',
            color: '#c00',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}
      {loading && (
        <div
          className="loading-banner"
          style={{
            background: '#eef',
            color: '#666',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '4px',
          }}
        >
          Loading thoughts...
        </div>
      )}
      <Canvas
        thoughts={thoughts}
        segments={thoughts.flatMap(thought => thought.segments || [])}
        selectedThought={selectedThought}
        onThoughtSelect={setSelectedThought}
        refreshThoughts={refreshThoughts}
        onUpdateThought={handlePositionUpdate}
      />

      {selectedThought && (
        <ThoughtDetailPanel
          thought={selectedThought}
          refreshThoughts={refreshThoughts}
          onUpdate={handleUpdateThought}
          onDelete={handleDeleteThought}
        />
      )}
      {showModal && (
        <AddThoughtModal
          createThought={createThought}
          onClose={() => setShowModal(false)}
        />
      )}

        {/* Dev Assistant Plugin Panel */}
        <div className="fixed bottom-4 right-4">
          <DevAssistantPanel />
        </div>
      </div>
    );
  }

export default App;