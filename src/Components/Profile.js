import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';

const Profile = ({ onTabChange, onPolicySelect }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('jwt');
        console.log('Fetched JWT:', token); // Debugging log
        if (!token) {
          throw new Error('No JWT found, redirecting to login.');
        }

        const response = await axios.get(
          'https://strapi-cms-backend-wtzq.onrender.com/api/users/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProfileData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handlePolicyClick = (policy) => {
    console.log('Policy clicked:', policy);
    onPolicySelect(policy);
    onTabChange('applyClaim');
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ mt: 2, textAlign: 'left', width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Profile
      </Typography>
      <Typography>
        <strong>Username:</strong> {profileData.username}
      </Typography>
      <Typography>
        <strong>Email:</strong> {profileData.email}
      </Typography>
      <Typography>
        <strong>Age:</strong> {profileData.age}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Policies:
      </Typography>
      <Box
        sx={{
          maxHeight: 180,
          overflowY: 'auto',
          paddingRight: 2,
        }}>
        <Grid container spacing={3}>
          {profileData.policies && profileData.policies.length > 0 ? (
            profileData.policies.map((policy, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    maxWidth: 345,
                    backgroundColor: '#A1D9FF',
                    '&:hover': {
                      backgroundColor: '#0d47a1',
                      color: 'white',
                      boxShadow: 6,
                    },
                  }}>
                  <CardActionArea onClick={() => handlePolicyClick(policy)}>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {policy.policy_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Sum Assured:</strong> {policy.sum_assured}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Premium:</strong> {policy.premium}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Duration:</strong> {policy.duration}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Left Amount:</strong> {policy.left_amount}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                No policies found.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Profile;
