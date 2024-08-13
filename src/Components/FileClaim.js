import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Container,
  TextField,
  Grid,
} from '@mui/material';
import axios from 'axios';

const FileClaim = ({ selectedPolicy: initialSelectedPolicy }) => {
  const [userPolicies, setUserPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset selected policy and fetch user policies when component mounts
    setSelectedPolicy(null);
    fetchUserPolicies();
  }, []);

  useEffect(() => {
    // Update selected policy only if initialSelectedPolicy changes
    if (initialSelectedPolicy) {
      setSelectedPolicy(initialSelectedPolicy);
    }
  }, [initialSelectedPolicy]);

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
      console.log('User policies response:', response.data);
      const policies = response.data.policies || [];
      setUserPolicies(policies);
    } catch (error) {
      console.error('Error fetching user policies:', error);
      setError('Failed to fetch user policies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClaim = async () => {
    if (!selectedPolicy || amount === '') {
      setError('Please select a policy and enter a valid amount.');
      return;
    }

    if (parseFloat(amount) > parseFloat(selectedPolicy.left_amount)) {
      setError(
        `Amount cannot be greater than the left amount (${selectedPolicy.left_amount}).`
      );
      return;
    }

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
      const username = userResponse.data.username;

      await axios.post(
        'https://strapi-cms-backend-wtzq.onrender.com/api/claims',
        {
          data: {
            policyholder_id: username,
            policy_id: String(selectedPolicy.policy_id),
            amount: parseFloat(amount),
            status: 'pending',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Claim filed successfully!');
      setSelectedPolicy(null);
      setAmount('');
    } catch (error) {
      console.error('Error filing claim:', error);
      console.error('Error response:', error.response);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError('Failed to file claim. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    setSelectedPolicy(null);
    setAmount('');
    setError(null);
  };

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
      <Typography variant="h4" gutterBottom>
        {selectedPolicy ? 'File Claim' : 'Choose Policy'}
      </Typography>
      {userPolicies.length === 0 ? (
        <Typography>No policies found. Please add a policy first.</Typography>
      ) : !selectedPolicy ? (
        <Grid container spacing={2}>
          {userPolicies.map((policy, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  textAlign: 'center',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
                onClick={() => setSelectedPolicy(policy)}>
                <Typography variant="h6">{policy.policy_name}</Typography>
                <Typography>Sum Assured: {policy.sum_assured}</Typography>
                <Typography>Left Amount: {policy.left_amount}</Typography>
                <Typography>Premium: {policy.premium}</Typography>
                <Typography>Duration: {policy.duration}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box>
          <Button onClick={handleGoBack} sx={{ mb: 2 }}>
            Go Back
          </Button>
          <Typography variant="h6">Selected Policy Details:</Typography>
          <Typography>Name: {selectedPolicy.policy_name}</Typography>
          <Typography>Sum Assured: {selectedPolicy.sum_assured}</Typography>
          <Typography>Left Amount: {selectedPolicy.left_amount}</Typography>
          <Typography>Duration: {selectedPolicy.duration}</Typography>
          <Typography>Premium: {selectedPolicy.premium}</Typography>
          <Box mt={2}>
            <TextField
              label="Claim Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleFileClaim}>
              Submit Claim
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default FileClaim;
