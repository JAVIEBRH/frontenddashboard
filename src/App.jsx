import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Pedidos from './pages/Pedidos';
import Clientes from './pages/Clientes';
import { RefreshProvider, useRefresh } from './context/RefreshContext';
import './App.css';

// Lazy loading para páginas pesadas
const MapaCalor = lazy(() => import('./pages/MapaCalor'));
const Predictor = lazy(() => import('./pages/Predictor'));
const Local = lazy(() => import('./pages/Local'));

// Componente de loading para Suspense
const LoadingSpinner = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="50vh"
  >
    <CircularProgress size={60} />
  </Box>
);

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#00bfff' : '#3b82f6', // Cyan brillante en modo oscuro
        light: darkMode ? '#1e90ff' : '#60a5fa',
        dark: darkMode ? '#0099cc' : '#2563eb',
      },
      secondary: {
        main: darkMode ? '#00ff7f' : '#10b981', // Verde brillante en modo oscuro
        light: darkMode ? '#32cd32' : '#34d399',
        dark: darkMode ? '#00cc66' : '#059669',
      },
      // Paleta de colores High Contrast para alertas y estados
      error: {
        main: darkMode ? '#ff1493' : '#7c2d12', // Rosa/Magenta brillante
        light: darkMode ? '#ff69b4' : '#fed7aa',
        dark: darkMode ? '#ff0066' : '#92400e',
      },
      warning: {
        main: darkMode ? '#ffff00' : '#92400e', // Amarillo brillante
        light: darkMode ? '#ffd700' : '#fef3c7',
        dark: darkMode ? '#ffcc00' : '#78350f',
      },
      info: {
        main: darkMode ? '#00ffff' : '#1e40af', // Cian brillante
        light: darkMode ? '#1e90ff' : '#dbeafe',
        dark: darkMode ? '#0099cc' : '#1e3a8a',
      },
      success: {
        main: darkMode ? '#00ff7f' : '#059669', // Verde brillante
        light: darkMode ? '#32cd32' : '#d1fae5',
        dark: darkMode ? '#00cc66' : '#047857',
      },
      background: {
        default: darkMode ? '#000000' : '#f8fafc', // Negro puro para alto contraste
        paper: darkMode ? '#0a0a0a' : '#ffffff', // Casi negro para cards
      },
      text: {
        primary: darkMode ? '#ffffff' : '#1e293b', // Blanco puro para máximo contraste
        secondary: darkMode ? '#e0e0e0' : '#64748b', // Gris muy claro
      },
      divider: darkMode ? '#333333' : '#e2e8f0',
      // Colores personalizados High Contrast para estados
      custom: {
        critical: darkMode ? '#ff1493' : '#7c2d12', // Rosa brillante
        warning: darkMode ? '#ffff00' : '#92400e', // Amarillo brillante
        info: darkMode ? '#00ffff' : '#1e40af', // Cian brillante
        success: darkMode ? '#00ff7f' : '#059669', // Verde brillante
        neutral: darkMode ? '#ffffff' : '#6b7280', // Blanco para máximo contraste
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.125rem',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
      },
      body1: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
      },
      body2: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: darkMode 
              ? '0 4px 6px -1px rgba(255, 255, 255, 0.1), 0 2px 4px -1px rgba(255, 255, 255, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease-in-out',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            '&:hover': {
              boxShadow: darkMode 
                ? '0 10px 15px -3px rgba(0, 191, 255, 0.3), 0 4px 6px -2px rgba(0, 191, 255, 0.2), 0 0 0 1px rgba(0, 191, 255, 0.5)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transform: 'translateY(-2px)',
              border: darkMode ? '1px solid rgba(0, 191, 255, 0.5)' : 'none',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
            color: darkMode ? '#ffffff' : undefined,
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.3)' : undefined,
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          h1: {
            color: darkMode ? '#ffffff' : undefined,
            fontWeight: 700,
          },
          h2: {
            color: darkMode ? '#ffffff' : undefined,
            fontWeight: 600,
          },
          h3: {
            color: darkMode ? '#ffffff' : undefined,
            fontWeight: 600,
          },
          h4: {
            color: darkMode ? '#ffffff' : undefined,
            fontWeight: 600,
          },
          h5: {
            color: darkMode ? '#ffffff' : undefined,
            fontWeight: 600,
          },
          h6: {
            color: darkMode ? '#ffffff' : undefined,
            fontWeight: 600,
          },
        },
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const AppContent = () => {
    const { isRefreshing, handleRefresh } = useRefresh();

    return (
      <Box sx={{ 
        display: 'flex', 
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
        transition: 'all 0.3s ease-in-out'
      }}>
        <Sidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            transition: 'all 0.3s ease-in-out',
            marginLeft: sidebarOpen ? '240px' : '64px',
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100vh',
            '@media (max-width: 768px)': {
              marginLeft: 0,
              paddingTop: '64px', // Espacio para el AppBar móvil
            },
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route 
              path="/mapa-calor" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <MapaCalor />
                </Suspense>
              } 
            />
            <Route 
              path="/predictor" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Predictor />
                </Suspense>
              } 
            />
            <Route 
              path="/local" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Local />
                </Suspense>
              } 
            />
          </Routes>
        </Box>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RefreshProvider>
        <AppContent />
      </RefreshProvider>
    </ThemeProvider>
  );
}

export default App; 