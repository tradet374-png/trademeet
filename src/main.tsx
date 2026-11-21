// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { SocketProvider } from './context/SocketContext';
import { MediaProvider } from './context/MediaContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SocketProvider>
      <MediaProvider>
        <App />
      </MediaProvider>
    </SocketProvider>
  </React.StrictMode>
);
