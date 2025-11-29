import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Expose a global BBX object for telemetry and session info
window._BBX = window._BBX || {};

// Helper to set session info after login
window.BBXSetSession = function (opts) {
  window._BBX.user_id = opts.user_id || window._BBX.user_id;
  window._BBX.session_id = opts.session_id || window._BBX.session_id;
};
