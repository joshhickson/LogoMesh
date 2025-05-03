import React, { useState, useEffect } from 'react';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import ThoughtDetailPanel from './components/ThoughtDetailPanel';
import AddThoughtModal from './components/AddThoughtModal';

function App() {
  const [thoughts, setThoughts] = useState([]);
  const [selectedThought, setSelectedThought] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  // Load thoughts and theme preference
  useEffect(() => {
    const stored = localStorage.getItem('thought-web-data');
    const dark = localStorage.getItem('thought-web-dark-mode');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.export_metadata && parsed.thoughts) {
          setThoughts(parsed.thoughts); // v0.5+ structure
        } else if (Array.isArray(parsed)) {
          setThoughts(parsed); // legacy array
        }
      } catch {
        console.warn('Failed to parse stored thoughts.');
      }
    }

    if (dark === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    localStorage.setItem('thought-web-data', JSON.stringify(thoughts));
  }, [thoughts]);

  useEffect(() => {
    localStorage.setItem('thought-web-dark-mode', darkMode.toString());
  }, [darkMode]);

  const addThought = (newThought) => {
    setThoughts([...thoughts, newThought]);
  };

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
      />

      {selectedThought && <ThoughtDetailPanel thought={selectedThought} />}
      {showModal && <AddThoughtModal setShowModal={setShowModal} addThought={addThought} />}
    </div>
  );
}

export default App;
