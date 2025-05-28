import { useState, useEffect, useCallback } from 'react';
import Canvas from './components/Canvas';
import { graphService } from './services/graphService';
import Sidebar from './components/Sidebar';
import ThoughtDetailPanel from './components/ThoughtDetailPanel';
import AddThoughtModal from './components/AddThoughtModal';
import * as apiService from './services/apiService'; // Import apiService
// NewThoughtData might be useful if AddThoughtModal passes structured data
// import { NewThoughtData } from './contracts/storageAdapter';


function App() {
  const [thoughts, setThoughts] = useState([]);
  const [selectedThought, setSelectedThought] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [loadingError, setLoadingError] = useState(null); // For error display

  const refreshThoughts = useCallback(async () => {
    try {
      console.log('App: Refreshing thoughts...');
      const fetchedThoughts = await apiService.fetchThoughts();
      setThoughts(fetchedThoughts);
      setLoadingError(null); // Clear any previous error
      console.log('App: Thoughts refreshed', fetchedThoughts);
    } catch (error) {
      console.error("App: Failed to fetch thoughts:", error);
      setLoadingError(error.message || "Failed to load thoughts. Please try again later.");
      // Optionally set an error state to display to the user
    }
  }, []);

  useEffect(() => {
    refreshThoughts();
  }, [refreshThoughts]); // Initial fetch

  const handleCreateThought = useCallback(
    async (newThoughtData) => { // newThoughtData should be NewThoughtData compatible
      try {
        console.log('App: Creating thought', newThoughtData);
        // The apiService.createThoughtApi expects NewThoughtData which doesn't include segments/tags.
        // The old createThought function in App.jsx assembled these.
        // For now, we'll pass what AddThoughtModal provides, assuming it's {title, description, color, position}
        // Tags and Segments would be added via different interactions/API calls after thought creation.
        const createdThought = await apiService.createThoughtApi(newThoughtData);
        await refreshThoughts(); // Re-fetch all thoughts
        console.log('App: Thought created and list refreshed', createdThought);
        return createdThought; // Return for potential immediate use (e.g., selecting it)
      } catch (error) {
        console.error("App: Failed to create thought:", error);
        // Handle error (e.g., show notification to user)
        throw error; // Re-throw to allow modal to handle its own error state if needed
      }
    },
    [refreshThoughts]
  );
  
  useEffect(() => {
    // Sync with in-memory graph service (if still needed, or graphService uses API too)
    // This might need re-evaluation if graphService is to reflect server state.
    console.log('App: Syncing thoughts with graphService', thoughts);
    // Clear existing graph data before adding new thoughts to avoid duplicates
    // This depends on graphService's API. Assuming a clear method or similar logic.
    // graphService.clearAll(); // Example: if graphService has a clear method
    thoughts.forEach((thought) => graphService.addThought(thought));
  }, [thoughts]);

  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const dark = localStorage.getItem('thought-web-dark-mode');
    if (dark === 'true') {
      document.documentElement.classList.add('dark');
      return true;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('thought-web-dark-mode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  };

  // Handler for deleting a thought - to be passed to components if needed
  const handleDeleteThought = async (thoughtId) => {
    try {
      console.log('App: Deleting thought ID:', thoughtId);
      await apiService.deleteThoughtApi(thoughtId);
      if (selectedThought && selectedThought.thought_bubble_id === thoughtId) {
        setSelectedThought(null); // Clear selection if deleted thought was selected
      }
      await refreshThoughts();
      console.log('App: Thought deleted and list refreshed');
    } catch (error) {
      console.error(`App: Failed to delete thought ${thoughtId}:`, error);
      // Handle error (e.g., show notification)
    }
  };


  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      <Sidebar
        thoughts={thoughts}
        // setThoughts={setThoughts} // No longer directly setting thoughts from Sidebar
        setSelectedThought={setSelectedThought}
        setShowModal={setShowModal}
        toggleDarkMode={toggleDarkMode}
        setActiveFilters={setActiveFilters}
        refreshThoughts={refreshThoughts} // Pass refreshThoughts
        onDeleteThought={handleDeleteThought} // Pass delete handler
      />

      <Canvas
        thoughts={thoughts}
        setSelectedThought={setSelectedThought}
        activeFilters={activeFilters}
        // ideaManager={ideaManager} // Removed
        refreshThoughts={refreshThoughts} // Pass refreshThoughts
      />

      {selectedThought && (
        <ThoughtDetailPanel
          thought={selectedThought}
          // ideaManager={ideaManager} // Removed
          refreshThoughts={refreshThoughts} // Pass refreshThoughts
          onClose={() => setSelectedThought(null)} // Add a way to close the panel
          onDeleteThought={handleDeleteThought} // Pass delete handler
        />
      )}
      {showModal && (
        <AddThoughtModal
          // createThought is now handleCreateThought
          onCreateThought={handleCreateThought} 
          onClose={() => setShowModal(false)}
        />
      )}
      {loadingError && (
        <div style={{ position: 'fixed', top: '10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'red', color: 'white', padding: '10px', borderRadius: '5px', zIndex: 1000 }}>
          Error: {loadingError}
        </div>
      )}
    </div>
  );
}

export default App;