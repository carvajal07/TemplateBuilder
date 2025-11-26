import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  Menu,
  MenuItem as MenuItemMUI,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Mail as MailIcon,
  PictureAsPdf as PdfIcon,
  AccountCircle,
  Logout,
} from '@mui/icons-material';

import { useTemplates, useCreateTemplate, useDeleteTemplate, useDuplicateTemplate } from './hooks/useTemplates';
import { useAuth } from './hooks/useAuth';
import { TemplateType } from './types';

// ============================================================================
// TEMPLATES PAGE
// ============================================================================

const TemplatesPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TemplateType>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data: templates, isLoading } = useTemplates({
    search,
    type: typeFilter === 'all' ? undefined : typeFilter,
  });

  const { mutate: deleteTemplate } = useDeleteTemplate();
  const { mutate: duplicateTemplate } = useDuplicateTemplate();

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Eliminar la plantilla "${name}"?`)) {
      deleteTemplate(id);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateTemplate(id);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎨 Universal Template Builder
          </Typography>
          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItemMUI disabled>
              <Typography variant="body2">{user?.email}</Typography>
            </MenuItemMUI>
            <MenuItemMUI onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} />
              Cerrar Sesión
            </MenuItemMUI>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Mis Plantillas
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/editor/new')}
          >
            Nueva Plantilla
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar plantillas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={typeFilter}
                  label="Tipo"
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {templates?.length || 0} plantilla(s) encontrada(s)
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Templates Grid */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : templates && templates.length > 0 ? (
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  {/* Preview Image */}
                  <Box
                    sx={{
                      height: 180,
                      bgcolor: template.type === 'pdf' ? '#e3f2fd' : '#fce4ec',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 64,
                    }}
                  >
                    {template.type === 'pdf' ? '📄' : '✉️'}
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={template.type.toUpperCase()}
                        size="small"
                        icon={template.type === 'pdf' ? <PdfIcon /> : <MailIcon />}
                        color={template.type === 'pdf' ? 'primary' : 'secondary'}
                      />
                    </Box>

                    <Typography variant="h6" gutterBottom noWrap>
                      {template.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: 40,
                      }}
                    >
                      {template.description || 'Sin descripción'}
                    </Typography>

                    {template.tags && template.tags.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <Chip key={index} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    )}
                  </CardContent>

                  <CardActions>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/editor/${template.id}`)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDuplicate(template.id)}
                      title="Duplicar"
                    >
                      <CopyIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(template.id, template.name)}
                      title="Eliminar"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              No se encontraron plantillas
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {search ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera plantilla para comenzar'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('/editor/new')}
            >
              Crear Plantilla
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

// ============================================================================
// EDITOR PAGE
// ============================================================================

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

// ============================================================================
// LOGIN PAGE
// ============================================================================

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@templatebuilder.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate('/templates');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ mb: 4 }}>
          🔐 Iniciar Sesión
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Entrar'}
          </Button>
        </form>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="caption" display="block">
            <strong>Demo Mode:</strong> Las credenciales ya están precargadas.
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            📝 Solo haz click en "Entrar" para acceder al demo.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

// ============================================================================
// HOME PAGE
// ============================================================================

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
            onClick={() => navigate(isAuthenticated ? '/templates' : '/login')}
          >
            {isAuthenticated ? 'Ver Plantillas' : 'Comenzar'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/editor/new')}
          >
            Crear Nueva
          </Button>
        </Box>

        <Box sx={{ mt: 6, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            ✨ Características:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ul>
                <li>Editor visual drag & drop</li>
                <li>Canvas interactivo con zoom y guías</li>
                <li>Renderizado PDF con ReportLab</li>
                <li>Renderizado Email HTML compatible</li>
              </ul>
            </Grid>
            <Grid item xs={12} md={6}>
              <ul>
                <li>Variables dinámicas y placeholders</li>
                <li>Código QR y Barras</li>
                <li>Colaboración en tiempo real</li>
                <li>Importar/Exportar XML</li>
              </ul>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>📦 MODO DEMO:</strong> Esta versión funciona sin backend, todos los datos se almacenan en localStorage.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>🔌 API Docs:</strong> http://localhost:8000/api/docs (cuando el backend esté corriendo)
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/templates"
          element={isAuthenticated ? <TemplatesPage /> : <Navigate to="/login" replace />}
        />
        <Route path="/editor/:id?" element={<EditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
