import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Button, Grid } from '@mui/material';
import ConfirmClaim from './ConfirmClaim'; // Ensure this path is correct
import BlockUser from './BlockUser'; // Ensure this path is correct
import GeneratePDF from './GeneratePDF'; // Ensure this path is correct
import Profile from './Profile';
import { useNavigate, useLocation } from 'react-router-dom';
const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState('adminProfile');
  const navigate = useNavigate();
  const location = useLocation();
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setCurrentTab(tab);
    }
  }, [location]);
  const handleLogout = () => {
    // Clear token or handle logout logic
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'confirmClaim':
        return <ConfirmClaim />;
      case 'blockUser':
        return <BlockUser />;
      case 'adminProfile':
        return <Profile />;
      default:
        return <ConfirmClaim />;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh', // Ensure the background covers the full viewport height
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh', // Ensure the background covers the full viewport height
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Button
          onClick={handleLogout}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'primary.main',
            color: 'white',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}>
          Logout
        </Button>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 600,
            margin: 'auto',
            padding: 2,
            border: '1px solid #ccc',
            borderRadius: 8,
            boxShadow: 3,
            bgcolor: 'background.paper',
            mt: 4,
            mb: 4,
            backgroundColor: '#f0f0f0',
          }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Box sx={{ width: '100%' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              aria-label="dashboard navigation"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTabs-flexContainer': {
                  justifyContent: 'space-evenly', // Distribute tabs evenly
                },
              }}>
              <Tab label="Admin Profile" value="adminProfile" />
              <Tab label="Confirm Claim" value="confirmClaim" />
              <Tab label="Block User" value="blockUser" />
            </Tabs>
          </Box>
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12}>
              {renderContent()}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
