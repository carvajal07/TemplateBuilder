import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Placeholder components
const EditorPage = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, minHeight: '80vh' }}>
        <Typography variant="h3" gutterBottom color="primary">
          🎨 Editor de Plantillas
        </Typography>
        <Typography variant="body1" paragraph>
          Canvas, Toolbox, Panel de Propiedades y Árbol de Capas se renderizarán aquí.
        </Typography>
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Funcionalidades del Editor:
          </Typography>
          <ul>
            <li>Drag & Drop de elementos</li>
            <li>Canvas interactivo con zoom</li>
            <li>Panel de propiedades dinámico</li>
            <li>Árbol de capas jerárquico</li>
            <li>Undo/Redo ilimitado</li>
            <li>Colaboración en tiempo real</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

const TemplatesPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" gutterBottom color="primary">
          📁 Mis Plantillas
        </Typography>
        <Typography variant="body1" paragraph>
          Lista de todas tus plantillas PDF y Email.
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/editor')}
            sx={{ mr: 2 }}
          >
            ➕ Nueva Plantilla PDF
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/editor')}
          >
            ✉️ Nueva Plantilla Email
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Ejemplos disponibles:
          </Typography>
          <ul>
            <li>📄 Factura PDF (examples/pdf-templates/invoice.xml)</li>
            <li>✉️ Email de Bienvenida (examples/email-templates/welcome.json)</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          🔐 Iniciar Sesión
        </Typography>
        <Typography variant="body1" paragraph align="center">
          Formulario de autenticación
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => navigate('/templates')}
          >
            Entrar (Demo)
          </Button>
        </Box>

        <Typography variant="caption" display="block" align="center" sx={{ mt: 2 }}>
          Para implementación completa, ver backend/app/api/auth.py
        </Typography>
      </Paper>
    </Container>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h2" gutterBottom color="primary">
          🎨 Universal Template Builder
        </Typography>
        <Typography variant="h5" paragraph color="text.secondary">
          Sistema avanzado de creación de plantillas PDF y Email
        </Typography>

        <Box sx={{ mt: 6, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/templates')}
          >
            Ver Plantillas
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/editor')}
          >
            Crear Nueva
          </Button>
        </Box>

        <Box sx={{ mt: 6, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            ✨ Características:
          </Typography>
          <ul>
            <li>Editor visual drag & drop</li>
            <li>Canvas interactivo con zoom y guías</li>
            <li>Renderizado PDF con ReportLab</li>
            <li>Renderizado Email HTML compatible</li>
            <li>Variables dinámicas y placeholders</li>
            <li>Código QR y Barras</li>
            <li>Colaboración en tiempo real</li>
            <li>Importar/Exportar XML</li>
          </ul>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>📚 Documentación:</strong> Ver README.md y docs/ARCHITECTURE.md
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>🔌 API Docs:</strong> http://localhost:8000/api/docs
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

function App() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/editor/:id?" element={<EditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
