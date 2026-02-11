import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Imports the global styles
import App from './App'; // Imports your main App component

// This finds the 'root' div from index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// This renders your  entire <App> component into that div
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);