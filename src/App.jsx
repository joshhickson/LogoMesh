import React, { useState, useEffect, useCallback } from 'react';
import Canvas from './components/Canvas';
import { newBubbleId, newSegmentId } from './utils/eventBus';
import { graphService } from './services/graphService';
import Sidebar from './components/Sidebar';
import ThoughtDetailPanel from './components/ThoughtDetailPanel';
import AddThoughtModal from './components/AddThoughtModal';
import { v4 as ulid } from 'ulid'; //Import ulid


function App() {
  const [thoughts, setThoughts] = useState(() => {
    const saved = localStorage.getItem('thought-web-data');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedThought, setSelectedThought] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);

  const createThought = useCallback(({ title, description, tags, segments }) => {
    const newThought = {
      thought_bubble_id: newBubbleId(),
      title,
      description,
      tags: tags.map(tag => ({name: tag, color: '#10b981'})), // Default color for tags
      created_at: new Date().toISOString(),
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      segments: segments.map(segment => ({
        ...segment,
        segment_id: newSegmentId(),
        embedding_vector: [] // Prepare for future AI features
      }))
    };

    const updatedThoughts = [...thoughts, newThought];
    setThoughts(updatedThoughts);
    
    // Persist to localStorage with metadata
    const persistData = {
      export_metadata: {
        version: '0.5.0',
        exported_at: new Date().toISOString(),
        thought_count: updatedThoughts.length
      },
      thoughts: updatedThoughts
    };
    localStorage.setItem('thought-web-data', JSON.stringify(persistData));
    return newThought;
  }, [thoughts]);

  useEffect(() => {
    localStorage.setItem('thought-web-data', JSON.stringify(thoughts));
    // Initialize Neo4j and sync thoughts
    const syncGraph = async () => {
      await graphService.initializeDb();
      for (const thought of thoughts) {
        await graphService.addThought(thought);
      }
    };
    syncGraph().catch(console.error);
  }, [thoughts]);


  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);


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

      {selectedThought && <ThoughtDetailPanel thought={selectedThought} setThoughts={setThoughts} />}
      {showModal && <AddThoughtModal setShowModal={setShowModal} addThought={createThought} />} {/*Updated addThought to createThought*/}
    </div>
  );
}

export default App;