import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Grid,
} from '@mui/material';
import axios from 'axios';
import { styled } from '@mui/system';

const BlockUser = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setError('No access token found. Please login again.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(
        'https://strapi-cms-backend-wtzq.onrender.com/api/users',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      // Filter out users who are admins
      const nonAdminUsers = response.data.filter((user) => !user.isAdmin);
      setUsers(nonAdminUsers);
    } catch (error) {
      setError(`Failed to fetch data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserBlockedStatus = async (userId, status) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('No access token found. Please login again.');
        return;
      }

      await axios.put(
        `https://strapi-cms-backend-wtzq.onrender.com/api/users/${userId}`,
        { blocked: status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      fetchUsers(); // Refresh the user list after blocking/unblocking
    } catch (error) {
      setError(`Failed to update user status: ${error.message}`);
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Manage Users
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{
          maxHeight: 200, // Set a fixed height for the policies section
          overflowY: 'auto', // Enable vertical scrolling
          paddingRight: 2, // Optional: Add padding for better aesthetics
        }}>
        {users.map((user) => {
          const { id, username, email, blocked } = user;

          const StyledPaper = styled(Paper)({
            backgroundColor: '#e3f2fd', // light blue
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: '#bbdefb', // darker blue on hover
              transform: 'translateY(-5px)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            },
            padding: '16px',
            borderRadius: '10px',
          });

          return (
            <Grid item xs={12} sm={6} md={4} key={id}>
              <StyledPaper elevation={3}>
                <Typography>Username: {username}</Typography>
                <Typography>Email: {email}</Typography>
                <Typography>
                  Status: {blocked ? 'Blocked' : 'Active'}
                </Typography>
                <Box mt={1}>
                  {blocked ? (
                    <Button
                      onClick={() => updateUserBlockedStatus(id, false)}
                      color="primary">
                      Unblock User
                    </Button>
                  ) : (
                    <Button
                      onClick={() => updateUserBlockedStatus(id, true)}
                      color="secondary">
                      Block User
                    </Button>
                  )}
                </Box>
              </StyledPaper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default BlockUser;
