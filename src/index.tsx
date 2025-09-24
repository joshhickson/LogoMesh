import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import config from '../core/config';

const container = document.getElementById('root');

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}


// Enable access from all interfaces in development
if (config.nodeEnv === 'development') {
  console.log('Development mode');
}