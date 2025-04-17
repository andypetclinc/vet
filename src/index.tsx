import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Log to help debug GitHub Pages deployment
console.log('App starting...');
console.log('PUBLIC_URL:', process.env.PUBLIC_URL);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <App />
); 