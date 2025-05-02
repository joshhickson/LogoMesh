import React, { useState, useEffect } from 'react';
import { exportToJsonFile } from '../utils/exportHandler';
import { importFromJsonFile } from '../utils/importHandler';

function Sidebar({ thoughts, setSelectedThought, setShowModal, toggleDarkMode, setActiveFilters }) {
  const [filterFieldName, setFilterFieldName] = useState([]);
  const [filterFieldValue, setFilterFieldValue] = useState('');
  const [filterFieldType, setFilterFieldType] = useState([]); // For future use

  const [filteredThoughtIds, setFilteredThoughtIds] = useState([]);

  // Get all field names from segments
  const allFields = thoughts.flatMap(thought =>
    thought.segments?.flatMap(segment => Object.entries(segment.fields || {})) || []
  );

  const uniqueFieldNames = [...new Set(allFields.map(([key]) => key).filter(Boolean))];
  const uniqueFieldTypes = ['text', 'location', 'date', 'numeric']; // Future expansion

  const filteredThoughts = thoughts.map(thought => {
    const filteredSegments = (thought.segments || []).filter(segment => {
      const fields = segment.fields || {};

      const matchesFieldName =
        filterFieldName.length === 0 ||
        filterFieldName.some(name => Object.keys(fields).includes(name));

      const matchesFieldValue =
        !filterFieldValue ||
        Object.values(fields).some(val =>
          typeof val === 'string' &&
          val.toLowerCase().includes(filterFieldValue.toLowerCase())
        );

      const matchesFieldType =
        filterFieldType.length === 0 || true; // Not enforced in schema yet

      return matchesFieldName && matchesFieldValue && matchesFieldType;
    });

    return { ...thought, filteredSegments };
  }).filter(thought =>
    thought.filteredSegments.length > 0 ||
    (!filterFieldName.length && !filterFieldValue && !filterFieldType.length)
  );

  useEffect(() => {
    const ids = filteredThoughts.map(t => t.thought_bubble_id);
    setFilteredThoughtIds(ids);
    setActiveFilters(ids);
  }, [filterFieldName, filterFieldValue, filterFieldType, filteredThoughts, setActiveFilters]);

  const handleExportFiltered = () => {
    exportToJsonFile(filteredThoughts);
  };

  const handleResetFilters = () => {
    setFilterFieldName([]);
    setFilterFieldValue('');
    setFilterFieldType([]);
  };

  return (
    <div className="w-1/4 p-4 border-r bg-gray-50 dark:bg-gray-800 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Thought List</h2>
        <button onClick={toggleDarkMode} className="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded">
          Toggle Mode
        </button>
      </div>

      {/* Main Buttons */}
      <button onClick={() => setShowModal(true)} className="w-full mb-2 px-4 py-2 bg-blue-500 text-white rounded">Add New Thought</button>
      <button onClick={() => exportToJsonFile(thoughts)} className="w-full mb-2 px-4 py-2 bg-green-500 text-white rounded">Export All</button>
      <button onClick={handleExportFiltered} className="w-full mb-2 px-4 py-2 bg-yellow-500 text-black rounded">Export Filtered</button>
      <button
        onClick={() =>
          importFromJsonFile(importedThoughts => {
            localStorage.setItem('thought-web-data', JSON.stringify(importedThoughts));
            window.location.reload();
          })
        }
        className="w-full mb-4 px-4 py-2 bg-indigo-500 text-white rounded"
      >
        Import from JSON
      </button>

      {/* Filter UI */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Filter Segments</h3>

        <label className="block mb-1 font-medium">Field Names:</label>
        <select
          multiple
          value={filterFieldName}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
            setFilterFieldName(selected);
          }}
          className="w-full mb-2 p-2 border rounded"
        >
          {uniqueFieldNames.map(field => (
            <option key={field} value={field}>{field}</option>
          ))}
        </select>

        <label className="block mb-1 font-medium">Field Value:</label>
        <input
          type="text"
          value={filterFieldValue}
          onChange={(e) => setFilterFieldValue(e.target.value)}
          placeholder="Enter value to match"
          className="w-full mb-2 p-2 border rounded"
        />

        <label className="block mb-1 font-medium">Field Types (coming soon):</label>
        <select
          multiple
          value={filterFieldType}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
            setFilterFieldType(selected);
          }}
          className="w-full mb-4 p-2 border rounded"
        >
          {uniqueFieldTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <button onClick={handleResetFilters} className="w-full bg-gray-400 text-black py-1 rounded">
          Reset Filters
        </button>
      </div>

      {/* Filter Summary */}
      <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
        <strong>Active Filters:</strong>
        <ul className="list-disc list-inside">
          {filterFieldName.length > 0 && <li>Field Name(s): {filterFieldName.join(', ')}</li>}
          {filterFieldValue && <li>Field Value: {filterFieldValue}</li>}
          {filterFieldType.length > 0 && <li>Field Type(s): {filterFieldType.join(', ')}</li>}
          {filterFieldName.length === 0 && !filterFieldValue && filterFieldType.length === 0 && <li>None</li>}
        </ul>
      </div>

      {/* Thought List */}
      <ul>
        {filteredThoughts.map(thought => (
          <li key={thought.thought_bubble_id} className="mb-3">
            <div onClick={() => setSelectedThought(thought)} className="cursor-pointer font-semibold hover:underline">
              {thought.title}
            </div>
            <ul className="ml-3 mt-1 text-sm">
              {(thought.filteredSegments || []).map(segment => (
                <li key={segment.segment_id} className="text-gray-600 dark:text-gray-300">
                  - {segment.title}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* Batch Edit */}
      <div className="mt-6">
  <h3 className="text-md font-semibold mb-2">Batch Edit</h3>

  <button
    onClick={() => {
      const newTag = prompt("Enter new tag to apply:");
      if (!newTag) return;
      const updated = thoughts.map(t =>
        filteredThoughtIds.includes(t.thought_bubble_id)
          ? { ...t, tags: [...(t.tags || []), { name: newTag, color: '#facc15' }] }
          : t
      );
      localStorage.setItem('thought-web-data', JSON.stringify(updated));
      window.location.reload();
    }}
    className="w-full mb-2 px-4 py-1 bg-purple-500 text-white rounded"
  >
    Add Tag to Filtered
  </button>

<button
  onClick={() => {
    const newColor = prompt("Enter new hex color (e.g. #10b981):");
    if (!newColor) return;
    const updated = thoughts.map(t =>
      filteredThoughtIds.includes(t.thought_bubble_id)
        ? { ...t, color: newColor }
        : t
    );
    localStorage.setItem('thought-web-data', JSON.stringify(updated));
    window.location.reload();
  }}
  className="w-full px-4 py-1 bg-pink-500 text-white rounded"
>
  Change Color of Filtered
</button>
</div>

    </div>
  );
}

export default Sidebar;
