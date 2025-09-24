import React, { useState } from 'react';

const DevAssistantPanel = () => {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const testPlugin = async (command: string, payload: any) => {
    setLoading(true);
    try {
      // Initialize plugin host first
      await fetch('/api/plugins/init', { method: 'POST' });
      
      // Load the plugin
      await fetch('/api/plugins/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          manifestPath: './plugins/logomesh-dev-assistant/manifest.json' 
        })
      });

      // Execute the plugin command
      const response = await fetch('/api/plugins/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pluginName: 'logomesh-dev-assistant',
          command,
          payload
        })
      });

      const result = await response.json();
      setOutput(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 max-w-2xl">
      <h3 className="text-lg font-bold mb-4">🤖 Dev Assistant Plugin Tester</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={() => testPlugin('analyzeCode', { 
            filePath: './src/App.tsx',
            analysisType: 'quality' 
          })}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
        >
          Analyze App.tsx
        </button>

        <button
          onClick={() => testPlugin('generateCode', { 
            description: 'Create a utility function for formatting dates',
            fileType: 'typescript'
          })}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
        >
          Generate Code
        </button>

        <button
          onClick={() => testPlugin('suggestImprovement', { 
            filePath: './src/components/Canvas.tsx',
            focus: 'performance' 
          })}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
        >
          Suggest Improvements
        </button>
      </div>

      {loading && <div className="text-blue-600">🔄 Running plugin...</div>}
      
      <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto max-h-96 text-sm">
        {output || 'Click a button to test the plugin...'}
      </pre>
    </div>
  );
};

export default DevAssistantPanel;
