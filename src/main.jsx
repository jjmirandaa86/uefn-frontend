import React from 'react';
import ReactDOM from 'react-dom/client';
import '@mantine/core/styles.css';
import './styles.css';
import { AppRoot } from './AppRoot.jsx';
import { migrateAppSettingsForHttps } from './utils/appSettingsStore.js';
import { getBackendApiUrl } from './utils/backendApiUrl.js';

migrateAppSettingsForHttps();
if (import.meta.env.DEV) {
  console.info('[MoodVision] API base (dev, vía proxy Vite):', getBackendApiUrl());
}

const theme = {
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  primaryColor: 'violet',
  defaultRadius: 'lg',
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRoot theme={theme} />
  </React.StrictMode>,
);
