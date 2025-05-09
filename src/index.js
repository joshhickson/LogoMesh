import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enable access from all interfaces in development
if (process.env.NODE_ENV === 'development') {
  process.env.HOST = '0.0.0.0';
}
