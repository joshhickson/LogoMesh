import React, { useState, useEffect, useCallback } from 'react';
import Canvas from './components/Canvas';
import { graphService } from './services/graphService';
import Sidebar from './components/Sidebar';
import ThoughtDetailPanel from './components/ThoughtDetailPanel';
import AddThoughtModal from './components/AddThoughtModal';
import { IdeaManager } from '@core/IdeaManager';

const ideaManager = new IdeaManager();

function App() {
  const [thoughts, setThoughts] = useState(() => ideaManager.getThoughts());
  const [selectedThought, setSelectedThought] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);

  const createThought = useCallback(
    ({ title, description, tags, segments }) => {
      const thoughtData = {
        title,
        description,
        tags: tags.map((tag) => ({ name: tag, color: '#10b981' })),
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        segments: segments.map((segment) => ({
          ...segment,
          embedding_vector: [],
        })),
      };

      const newThought = ideaManager.addThought(thoughtData);
      setThoughts([...ideaManager.getThoughts()]);
      return newThought;
    },
    []
  );

  // Simplified addThought to use ideaManager
  const addThought = (thoughtData) => {
    ideaManager.addThought(thoughtData);
    setThoughts([...ideaManager.getThoughts()]);
  };

  useEffect(() => {
    // Sync with in-memory graph only
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

      <Canvas
        thoughts={thoughts}
        setSelectedThought={setSelectedThought}
        activeFilters={activeFilters}
        ideaManager={ideaManager}
        refreshThoughts={() => setThoughts([...ideaManager.getThoughts()])}
      />

      {selectedThought && (
        <ThoughtDetailPanel
          thought={selectedThought}
          ideaManager={ideaManager}
          refreshThoughts={() => setThoughts([...ideaManager.getThoughts()])}
        />
      )}
      {showModal && (
        <AddThoughtModal
          createThought={createThought}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default App;
