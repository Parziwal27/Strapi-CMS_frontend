import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Profile from './Profile';
import AddPolicy from './AddPolicy';
import UpdatePolicy from './UpdatePolicy';
import DeletePolicy from './DeletePolicy';
import FileClaim from './FileClaim';
import ClaimStatus from './ClaimsStatus';
import GeneratePDF from './GeneratePDF';

const UserDashboard = () => {
  const [currentTab, setCurrentTab] = useState('profile');
  const location = useLocation();
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    // Read the current tab from URL parameters
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setCurrentTab(tab);
    }
  }, [location]);
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handlePolicySelect = (policy) => {
    setSelectedPolicy(policy);
    setCurrentTab('applyClaim');
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'profile':
        return (
          <Profile
            onTabChange={setCurrentTab}
            onPolicySelect={handlePolicySelect}
          />
        );
      case 'addPolicy':
        return <AddPolicy />;
      case 'updatePolicy':
        return <UpdatePolicy />;
      case 'deletePolicy':
        return <DeletePolicy />;
      case 'applyClaim':
        return <FileClaim selectedPolicy={selectedPolicy} />;
      case 'viewClaim':
        return <ClaimStatus />;
      default:
        return (
          <Profile
            onTabChange={setCurrentTab}
            onPolicySelect={handlePolicySelect}
          />
        );
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage:
          'url(data:image/jpeg;base64,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)',
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
          maxWidth: 900,
          margin: 'auto',
          padding: 2,
          border: '1px solid #ccc',
          borderRadius: 8,
          boxShadow: 3,
          bgcolor: 'background.paper',
          mt: 2,
          mb: 2,
          backgroundColor: '#f0f0f0',
        }}>
        <Typography component="h1" variant="h4" gutterBottom>
          User Dashboard
        </Typography>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="dashboard navigation"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            width: '100%',
            '& .MuiTabs-flexContainer': {
              justifyContent: 'space-evenly',
            },
            '& .MuiTab-root': {
              flex: 1,
              maxWidth: 'none',
              minHeight: 48,
            },
          }}>
          <Tab label="Profile" value="profile" />
          <Tab label="Add Policy" value="addPolicy" />
          <Tab label="Update Policy" value="updatePolicy" />
          <Tab label="Delete Policy" value="deletePolicy" />
          <Tab label="Apply Claim" value="applyClaim" />
          <Tab label="View Claim" value="viewClaim" />
        </Tabs>
        {renderContent()}
        <Box sx={{ mt: 2 }}>
          <GeneratePDF />
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;
