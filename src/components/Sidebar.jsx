import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Home,
  ShoppingCart,
  People,
  Map,
  TrendingUp,
  LocationOn,
  Menu,
  DarkMode,
  LightMode,
  Refresh
} from '@mui/icons-material';
import './Sidebar.css';

export default function Sidebar({ open, setOpen, darkMode, toggleDarkMode, onRefresh, isRefreshing = false }) {
  const location = useLocation();
  const theme = useTheme();

  const menuItems = [
    { text: 'Dashboard', icon: <Home />, path: '/' },
    { text: 'Pedidos', icon: <ShoppingCart />, path: '/pedidos' },
    { text: 'Clientes', icon: <People />, path: '/clientes' },
    { text: 'Mapa de Calor', icon: <Map />, path: '/mapa-calor' },
    { text: 'Predictor de Pedidos', icon: <TrendingUp />, path: '/predictor' },
    { text: 'Local', icon: <LocationOn />, path: '/local' },
  ];

  const drawerWidth = 240;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 700, 
          color: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Box component="span" sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%', 
            bgcolor: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 700
          }}>
            AA
          </Box>
          Aguas Ancud
        </Typography>
      </Box>

      {/* Theme Toggle */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightMode sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              />
            }
            label=""
          />
          <DarkMode sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  bgcolor: isActive ? theme.palette.primary.main : 'transparent',
                  color: isActive ? 'white' : theme.palette.text.primary,
                  '&:hover': {
                    bgcolor: isActive 
                      ? theme.palette.primary.dark 
                      : theme.palette.action.hover,
                    transform: 'translateX(4px)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: isActive ? 'white' : theme.palette.text.secondary,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiTypography-root': {
                      fontWeight: isActive ? 600 : 500,
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ 
        p: 2, 
        borderTop: `1px solid ${theme.palette.divider}`,
        textAlign: 'center'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Botón de actualización */}
          <Tooltip title="Actualizar datos">
            <IconButton
              onClick={onRefresh}
              disabled={isRefreshing}
              sx={{
                color: isRefreshing ? theme.palette.primary.main : theme.palette.text.secondary,
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
                '&:disabled': {
                  color: theme.palette.primary.main,
                }
              }}
            >
              <Refresh 
                sx={{ 
                  fontSize: 20,
                  animation: isRefreshing ? 'rotate 1s linear infinite' : 'none',
                  '@keyframes rotate': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} 
              />
            </IconButton>
          </Tooltip>
          
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Dashboard v1.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          display: { xs: 'flex', md: 'none' },
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[1]
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setOpen(!open)}
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Aguas Ancud
          </Typography>
          <Tooltip title={`Cambiar a modo ${darkMode ? 'claro' : 'oscuro'}`}>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.3s ease-in-out',
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
} 