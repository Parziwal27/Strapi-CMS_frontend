import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import axios from 'axios';

const DeletePolicy = () => {
  const [userPolicies, setUserPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    fetchUserPolicies();
  }, []);

  const fetchUserPolicies = async () => {
    const token = localStorage.getItem('jwt');
    setIsLoading(true);
    try {
      const response = await axios.get(
        'https://strapi-cms-backend-wtzq.onrender.com/api/users/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const policies = response.data.policies || [];
      setUserPolicies(policies);
    } catch (error) {
      console.error('Error fetching user policies:', error);
      setError('Failed to fetch user policies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePolicy = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const userResponse = await axios.get(
        'https://strapi-cms-backend-wtzq.onrender.com/api/users/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userId = userResponse.data.id;
      const currentPolicies = userResponse.data.policies || [];
      const updatedPolicies = currentPolicies.filter(
        (policy) => policy.policy_id !== selectedPolicy.policy_id
      );

      await axios.put(
        `https://strapi-cms-backend-wtzq.onrender.com/api/users/${userId}`,
        {
          policies: updatedPolicies,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Policy deleted successfully!');
      setSelectedPolicy(null);
      setOpenConfirm(false);
      fetchUserPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      setError('Failed to delete policy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenConfirm = (policy) => {
    setSelectedPolicy(policy);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const PolicyBox = ({ policy, onClick }) => (
    <Paper
      elevation={3}
      sx={{ p: 2, m: 1, cursor: 'pointer', textAlign: 'center' }}
      onClick={() => onClick(policy)}>
      <Typography variant="h6">{policy.policy_name}</Typography>
      <Typography>Sum Assured: {policy.sum_assured}</Typography>
      <Typography>Duration: {policy.duration}</Typography>
      <Typography>Premium: {policy.premium}</Typography>
    </Paper>
  );

  if (isLoading) {
    return (
      <Container>
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>
        Choose
      </Typography>
      {userPolicies.length === 0 ? (
        <Typography>No policies found.</Typography>
      ) : (
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          sx={{
            maxHeight: 250,
            overflowY: 'auto',
            paddingRight: 2,
          }}>
          {userPolicies.map((policy, index) => (
            <PolicyBox
              key={index}
              policy={policy}
              onClick={handleOpenConfirm}
            />
          ))}
        </Box>
      )}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the policy "
            {selectedPolicy?.policy_name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button
            onClick={handleDeletePolicy}
            color="secondary"
            variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeletePolicy;
