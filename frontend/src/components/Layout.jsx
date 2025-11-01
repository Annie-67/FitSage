import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  FitnessCenter as WorkoutIcon,
  Restaurant as NutritionIcon,
  TrendingUp as ProgressIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Psychology as BrainIcon,
  Bolt as BoltIcon,
  Spa as SpaIcon,
} from '@mui/icons-material';
import { useAuth } from '../utils/AuthContext';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Workouts', icon: <WorkoutIcon />, path: '/workouts' },
  { text: 'Nutrition', icon: <NutritionIcon />, path: '/nutrition' },
  { text: 'Progress', icon: <ProgressIcon />, path: '/progress' },
  { text: 'AI Coach', icon: <ChatIcon />, path: '/chat' },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const drawer = (
    <Box>
      {/* Logo and Brand Section */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}>
        <img
          src="/logo.png"
          alt="FitSage"
          style={{
            height: 200,
            width: 220,
            marginBottom: 16,
          }}
        />
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            color: 'primary.main',
            textAlign: 'center',
          }}
        >
          FitSage
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mt: 1,
            fontWeight: 500,
            letterSpacing: 0.5,
            textAlign: 'center',
          }}
        >
          Train Smart. Live Wise.
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 2, pt: 3 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'white' : 'primary.main',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative', height: 40, display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                whiteSpace: 'nowrap',
                animation: 'scrollText 40s linear infinite',
                '@keyframes scrollText': {
                  '0%': {
                    transform: 'translateX(0)',
                  },
                  '100%': {
                    transform: 'translateX(-50%)',
                  },
                },
              }}
            >
              <BrainIcon sx={{ fontSize: 20 }} />
              <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                FitSage = AI × Sweat × Progress
              </Typography>
              <Box component="span" sx={{ mx: 1 }}>•</Box>
              <BoltIcon sx={{ fontSize: 20, color: 'warning.main' }} />
              <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                Smarter Workouts. Stronger You.
              </Typography>
              <Box component="span" sx={{ mx: 1 }}>•</Box>
              <WorkoutIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                AI-Crafted Workouts. Human-Level Hustle.
              </Typography>
              <Box component="span" sx={{ mx: 1 }}>•</Box>
              <SpaIcon sx={{ fontSize: 20, color: 'success.main' }} />
              <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                Next-Gen Fitness. Fueled by Intelligence.
              </Typography>
              <Box component="span" sx={{ mx: 2 }}>•</Box>
              {/* Duplicate for seamless loop */}
              <BrainIcon sx={{ fontSize: 20 }} />
              <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                FitSage = AI × Sweat × Progress
              </Typography>
              <Box component="span" sx={{ mx: 1 }}>•</Box>
              <BoltIcon sx={{ fontSize: 20, color: 'warning.main' }} />
              <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                Smarter Workouts. Stronger You.
              </Typography>
              <Box component="span" sx={{ mx: 1 }}>•</Box>
              <WorkoutIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                AI-Crafted Workouts. Human-Level Hustle.
              </Typography>
              <Box component="span" sx={{ mx: 1 }}>•</Box>
              <SpaIcon sx={{ fontSize: 20, color: 'success.main' }} />
              <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                Next-Gen Fitness. Fueled by Intelligence.
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleMenuOpen}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
