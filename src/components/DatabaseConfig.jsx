import React, { useState, useEffect } from 'react';

function DatabaseConfig() {
  const [config, setConfig] = useState({
    host: '',
    port: '5432',
    database: '',
    username: '',
    password: '',
    ssl: true
  });
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('database_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }

    // Check current connection status
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/admin/health`);
      if (response.ok) {
        setIsConnected(true);
        setConnectionStatus('Connected to database');
      } else {
        setIsConnected(false);
        setConnectionStatus('Database connection failed');
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus('Unable to reach backend');
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateConnectionString = () => {
    const { host, port, database, username, password } = config;
    if (!host || !database || !username || !password) return '';

    return `postgresql://${username}:${password}@${host}:${port}/${database}?sslmode=require`;
  };

  const saveConfig = () => {
    localStorage.setItem('database_config', JSON.stringify(config));

    // Copy connection string to clipboard
    const connectionString = generateConnectionString();
    if (connectionString) {
      navigator.clipboard.writeText(connectionString);
      alert('Database config saved and connection string copied to clipboard!\n\nTo use on your PC:\n1. Download LogoMesh\n2. Set DATABASE_URL environment variable to the copied connection string\n3. Start the application');
    }
  };

  const testConnection = async () => {
    setConnectionStatus('Testing connection...');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/admin/test-db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionString: generateConnectionString()
        })
      });

      const result = await response.json();

      if (response.ok) {
        setIsConnected(true);
        setConnectionStatus('✅ Connection successful!');
      } else {
        setIsConnected(false);
        setConnectionStatus(`❌ Connection failed: ${result.error}`);
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus(`❌ Connection error: ${error.message}`);
    }
  };

  const loadFromEnv = () => {
    // Parse DATABASE_URL if available
    const dbUrl = process.env.REACT_APP_DATABASE_URL;
    if (dbUrl) {
      try {
        const url = new URL(dbUrl);
        setConfig({
          host: url.hostname,
          port: url.port || '5432',
          database: url.pathname.slice(1),
          username: url.username,
          password: url.password,
          ssl: url.searchParams.get('sslmode') === 'require'
        });
      } catch (error) {
        alert('Invalid DATABASE_URL format');
      }
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Database Configuration
      </h2>

      {/* Connection Status */}
      <div className={`p-3 rounded mb-4 ${isConnected 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}>
        {connectionStatus || 'Not connected'}
      </div>

      {/* Configuration Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Host
          </label>
          <input
            type="text"
            value={config.host}
            onChange={(e) => handleConfigChange('host', e.target.value)}
            placeholder="your-database-host.neon.tech"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Port
            </label>
            <input
              type="text"
              value={config.port}
              onChange={(e) => handleConfigChange('port', e.target.value)}
              placeholder="5432"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Database
            </label>
            <input
              type="text"
              value={config.database}
              onChange={(e) => handleConfigChange('database', e.target.value)}
              placeholder="main"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Username
          </label>
          <input
            type="text"
            value={config.username}
            onChange={(e) => handleConfigChange('username', e.target.value)}
            placeholder="username"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={config.password}
              onChange={(e) => handleConfigChange('password', e.target.value)}
              placeholder="password"
              className="w-full p-2 border rounded pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="ssl"
            checked={config.ssl}
            onChange={(e) => handleConfigChange('ssl', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="ssl" className="text-sm text-gray-700 dark:text-gray-300">
            Use SSL (recommended)
          </label>
        </div>

        {/* Connection String Preview */}
        {generateConnectionString() && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Connection String Preview
            </label>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs break-all">
              {generateConnectionString().replace(config.password, '***')}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={testConnection}
            disabled={!generateConnectionString()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Test Connection
          </button>

          <button
            onClick={saveConfig}
            disabled={!generateConnectionString()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Save & Copy Connection String
          </button>

          <button
            onClick={loadFromEnv}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Load from Environment
          </button>

          <button
            onClick={checkConnectionStatus}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Check Status
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Using LogoMesh on Your PC
          </h3>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>1. Configure your database connection above</li>
            <li>2. Click "Save & Copy Connection String"</li>
            <li>3. Download LogoMesh source code to your PC</li>
            <li>4. Create a .env file with: DATABASE_URL=&lt;paste connection string&gt;</li>
            <li>5. Run: npm install && cd server && npm install</li>
            <li>6. Start: npm run dev (frontend) and cd server && npm run dev (backend)</li>
          </ol>
        </div>
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        <p>Note: Your connection string might contain special characters. Wrap them in &quot;quotes&quot; if needed.</p>
      </div>
    </div>
  );
}

export default DatabaseConfig;