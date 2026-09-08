import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/app.css';
import './styles/practice.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from index.html');

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
