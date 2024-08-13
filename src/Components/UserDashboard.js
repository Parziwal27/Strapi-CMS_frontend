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
          mt: 2, // Reduce top margin
          mb: 2, // Reduce bottom margin
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
              minHeight: 48, // Reduce tab height
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
          {' '}
          {/* Reduce top margin of this section */}
          <GeneratePDF />
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;
