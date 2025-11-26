import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// Placeholder components - these would be fully implemented
const EditorPage = () => (
  <Box sx={{ p: 3 }}>
    <h1>Editor Page</h1>
    <p>Canvas, Toolbox, Properties Panel, and Layers Tree will be rendered here</p>
  </Box>
);

const TemplatesPage = () => (
  <Box sx={{ p: 3 }}>
    <h1>Templates Page</h1>
    <p>List of all templates</p>
  </Box>
);

const LoginPage = () => (
  <Box sx={{ p: 3 }}>
    <h1>Login Page</h1>
    <p>Authentication form</p>
  </Box>
);

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route path="/" element={<Navigate to="/templates" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/editor/:id?" element={<EditorPage />} />
      </Routes>
    </Box>
  );
}

export default App;
