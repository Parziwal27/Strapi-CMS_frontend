import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Button } from '@mui/material';
import Profile from './Profile';
import AddPolicy from './AddPolicy';
import UpdatePolicy from './UpdatePolicy';
import DeletePolicy from './DeletePolicy';
import FileClaim from './FileClaim';
import ClaimStatus from './ClaimsStatus';
import GeneratePDF from './GeneratePDF';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [currentTab, setCurrentTab] = useState('profile');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const navigate = useNavigate();

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
        backgroundImage:
          'url(data:image/jpeg;base64,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)',
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
