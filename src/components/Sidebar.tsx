import React, { useState, useEffect, useMemo } from 'react';
import { graphService } from '../services/graphService';
import errorLogger from '../utils/errorLogger';
import DevAssistantPanel from './DevAssistantPanel';
import DatabaseConfig from './DatabaseConfig';

// Current schema version for display purposes
const thoughtSchemaVersion = '0.5';

interface Tag {
  name: string;
  color: string;
}

interface Segment {
  segment_id: string;
  title: string;
  fields?: Record<string, unknown>;
}

interface Thought {
  thought_bubble_id: string;
  title: string;
  segments?: Segment[];
  tags?: Tag[];
  color?: string;
  filteredSegments?: Segment[];
}

interface SidebarProps {
  thoughts: Thought[];
  setThoughts: (thoughts: Thought[]) => void;
  setSelectedThought: (thought: Thought) => void;
  setShowModal: (show: boolean) => void;
  toggleDarkMode: () => void;
  setActiveFilters: (ids: string[]) => void;
  onRefreshThoughts: () => void;
}

function Sidebar({
  thoughts,
  setThoughts,
  setSelectedThought,
  setShowModal,
  toggleDarkMode,
  setActiveFilters,
  onRefreshThoughts
}: SidebarProps) {
  const [filterFieldName, setFilterFieldName] = useState<string[]>([]);
  const [filterFieldValue, setFilterFieldValue] = useState('');
  const [filterFieldType, setFilterFieldType] = useState<string[]>([]);
  const [filteredThoughtIds, setFilteredThoughtIds] = useState<string[]>([]);
  const [showDevAssistant, setShowDevAssistant] = useState(false);
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);

  // Gather all field entries for dynamic filters
  const allFields = thoughts.flatMap(
    (thought) =>
      thought.segments?.flatMap((segment) =>
        Object.entries(segment.fields || {})
      ) || []
  );

  const uniqueFieldNames = Array.from(
    new Set(allFields.map(([key]) => key).filter(Boolean))
  );
  const uniqueFieldTypes = ['text', 'location', 'date', 'numeric']; // Placeholder for future

  // Memoize filtered thoughts computation
  const filteredThoughts = useMemo(() => {
    return thoughts
      .map((thought) => {
        const filteredSegments = (thought.segments || []).filter((segment) => {
          const fields = segment.fields || {};
          const matchesFieldName =
            filterFieldName.length === 0 ||
            filterFieldName.some((name) => Object.keys(fields).includes(name));

          const matchesFieldValue =
            !filterFieldValue ||
            Object.entries(fields).some(([key, val]) => {
              const fieldType = graphService.getFieldType(key);

              switch (fieldType) {
                case 'date': {
                  // Simple text matching for now
                  return String(val)
                    .toLowerCase()
                    .includes(filterFieldValue.toLowerCase());
                }
                case 'numeric': {
                  // Simple text matching for now
                  return String(val)
                    .toLowerCase()
                    .includes(filterFieldValue.toLowerCase());
                }
                case 'location': {
                  // Simple text matching for now
                  return String(val)
                    .toLowerCase()
                    .includes(filterFieldValue.toLowerCase());
                }
                default:
                  return String(val)
                    .toLowerCase()
                    .includes(filterFieldValue.toLowerCase());
              }
            });

          const matchesFieldType = filterFieldType.length === 0;
          return matchesFieldName && matchesFieldValue && matchesFieldType;
        });

        return { ...thought, filteredSegments };
      })
      .filter(
        (thought) =>
          thought.filteredSegments!.length > 0 ||
          (!filterFieldName.length &&
            !filterFieldValue &&
            !filterFieldType.length)
      );
  }, [thoughts, filterFieldName, filterFieldValue, filterFieldType]);

  // Sync active filters to parent for canvas highlighting
  useEffect(() => {
    const ids = filteredThoughts.map((t) => t.thought_bubble_id);
    setFilteredThoughtIds(ids);
    setActiveFilters(ids);
  }, [filteredThoughts, setActiveFilters]);

  const handleExportAll = () => {
    // Export functionality would be implemented here
    console.log('Export all thoughts');
  };

  const handleExportFiltered = () => {
    // Export only filtered thoughts if any filters are active
    console.log('Export filtered thoughts');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/import/json`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }

      const result = await response.json();
      console.log('Import successful:', result);
      onRefreshThoughts();
      alert('Data imported successfully!');
    } catch (error: unknown) {
      console.error('Import failed:', error);
      if (error instanceof Error) {
        alert(`Failed to import data: ${error.message}`);
      } else {
        alert('An unknown error occurred during import.');
      }
    }

    // Reset the file input
    event.target.value = '';
  };

  const handleClearCache = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all thought projects? This cannot be undone.'
      )
    ) {
      localStorage.removeItem('thought-web-data');
      setThoughts([]);
    }
  };

  const handleViewCache = () => {
    const cachedData = localStorage.getItem('thought-web-data');
    if (cachedData) {
      const formattedData = JSON.stringify(JSON.parse(cachedData), null, 2);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write('<pre>' + formattedData + '</pre>');
      }
    } else {
      alert('No cached data found');
    }
  };

  const handleResetFilters = () => {
    setFilterFieldName([]);
    setFilterFieldValue('');
    setFilterFieldType([]);
  };

  return (
    <div className="w-1/4 p-4 border-r bg-gray-50 dark:bg-gray-800 overflow-y-auto">
      {/* Header with schema version */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Schema v{thoughtSchemaVersion}
        </span>
        <h2 className="text-lg font-bold">Thought List</h2>
        <button
          onClick={() => setShowDevAssistant(!showDevAssistant)}
          className={`px-2 py-1 rounded ${showDevAssistant
            ? 'bg-blue-500 text-white'
            : 'text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Toggle Dev Assistant"
        >
          🤖
        </button>
        <button
          onClick={() => setShowDatabaseConfig(!showDatabaseConfig)}
          className={`px-2 py-1 rounded ${showDatabaseConfig
            ? 'bg-green-500 text-white'
            : 'text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Database Configuration"
        >
          🗄️
        </button>
        <button
          onClick={toggleDarkMode}
          className="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded"
        >
          Toggle Mode
        </button>
      </div>

      {/* Main Actions */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full mb-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add New Thought
      </button>
      <button
        onClick={handleExportAll}
        className="w-full mb-2 px-4 py-2 bg-green-500 text-white rounded"
      >
        Export All
      </button>
      <button
        onClick={handleExportFiltered}
        className="w-full mb-2 px-4 py-2 bg-yellow-500 text-black rounded"
      >
        Export Filtered
      </button>
      <input
        type="file"
        id="importFile"
        className="hidden"
        onChange={handleImport}
      />
      <label
        htmlFor="importFile"
        className="w-full mb-4 px-4 py-2 bg-indigo-500 text-white rounded cursor-pointer block text-center"
      >
        Import from JSON
      </label>
      <button
        onClick={handleClearCache}
        className="w-full mb-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear Cache
      </button>
      <button
        onClick={handleViewCache}
        className="w-full mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        View Cache
      </button>
      <button
        onClick={() => errorLogger.manualExport()}
        className="w-full mb-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
      >
        Export Errors ({errorLogger.getErrorCount()})
      </button>

      {/* Filters */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Filter Segments</h3>
        <label className="block mb-1 font-medium">Field Names:</label>
        <select
          multiple
          value={filterFieldName}
          onChange={(e) =>
            setFilterFieldName(
              Array.from(e.target.selectedOptions).map((o) => o.value)
            )
          }
          className="w-full mb-2 p-2 border rounded"
        >
          {uniqueFieldNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
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

        <label className="block mb-1 font-medium">Field Types (soon):</label>
        <select
          multiple
          value={filterFieldType}
          onChange={(e) =>
            setFilterFieldType(
              Array.from(e.target.selectedOptions).map((o) => o.value)
            )
          }
          className="w-full mb-4 p-2 border rounded"
        >
          {uniqueFieldTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button
          onClick={handleResetFilters}
          className="w-full bg-gray-400 text-black py-1 rounded"
        >
          Reset Filters
        </button>
      </div>

      {/* Filter Summary */}
      <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
        <strong>Active Filters:</strong>
        <ul className="list-disc list-inside">
          {filterFieldName.length > 0 && (
            <li>Field Name(s): {filterFieldName.join(', ')}</li>
          )}
          {filterFieldValue && <li>Field Value: {filterFieldValue}</li>}
          {filterFieldType.length > 0 && (
            <li>Field Type(s): {filterFieldType.join(', ')}</li>
          )}
          {!filterFieldName.length &&
            !filterFieldValue &&
            !filterFieldType.length && <li>None</li>}
        </ul>
      </div>

      {/* Thought List */}
      <ul>
        {filteredThoughts.map((thought) => (
          <li key={thought.thought_bubble_id} className="mb-3">
            <div
              onClick={() => setSelectedThought(thought)}
              className="cursor-pointer font-semibold hover:underline"
            >
              {thought.title}
            </div>
            <ul className="ml-3 mt-1 text-sm">
              {thought.filteredSegments?.map((seg) => (
                <li
                  key={`seg_list_${seg.segment_id}`}
                  className="text-gray-600 dark:text-gray-300"
                >
                  - {seg.title}
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
            const newTag = prompt('Enter new tag to apply:');
            if (!newTag) return;
            const updated = thoughts.map((t) =>
              filteredThoughtIds.includes(t.thought_bubble_id)
                ? {
                    ...t,
                    tags: [
                      ...(t.tags || []),
                      { name: newTag, color: '#facc15' },
                    ],
                  }
                : t
            );
            localStorage.setItem('thought-web-data', JSON.stringify(updated));
            setThoughts(updated);
          }}
          className="w-full mb-2 px-4 py-1 bg-purple-500 text-white rounded"
        >
          Add Tag to Filtered
        </button>
        <button
          onClick={() => {
            const newColor = prompt('Enter new hex color (e.g. #10b981):');
            if (!newColor) return;
            const updated = thoughts.map((t) =>
              filteredThoughtIds.includes(t.thought_bubble_id)
                ? { ...t, color: newColor }
                : t
            );
            localStorage.setItem('thought-web-data', JSON.stringify(updated));
            setThoughts(updated);
          }}
          className="w-full px-4 py-1 bg-pink-500 text-white rounded"
        >
          Change Color of Filtered
        </button>
      </div>

      {/* Dev Assistant Panel */}
      {showDevAssistant && (
        <div className="mt-4 border-t pt-4">
          <DevAssistantPanel />
        </div>
      )}

      {/* Database Configuration Panel */}
      {showDatabaseConfig && (
        <div className="mt-4 border-t pt-4">
          <DatabaseConfig />
        </div>
      )}
    </div>
  );
}

export default Sidebar;