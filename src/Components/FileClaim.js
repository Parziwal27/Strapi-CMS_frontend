import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Container,
  TextField,
} from '@mui/material';
import axios from 'axios';

const FileClaim = () => {
  const [userPolicies, setUserPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

    if (amount > selectedPolicy.left_amount) {
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
    if (selectedPolicy) {
      setSelectedPolicy(null);
      setAmount('');
      setError(null);
    }
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
        Choose
      </Typography>
      {userPolicies.length === 0 ? (
        <Typography>No policies found. Please add a policy first.</Typography>
      ) : !selectedPolicy ? (
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
            <Paper
              key={index}
              elevation={3}
              sx={{ p: 2, m: 1, cursor: 'pointer', textAlign: 'center' }}
              onClick={() => setSelectedPolicy(policy)}>
              <Typography variant="h6">{policy.policy_name}</Typography>
              <Typography>Sum Assured: {policy.sum_assured}</Typography>
              <Typography>Left Amount: {policy.left_amount}</Typography>
              <Typography>Premium: {policy.premium}</Typography>
              <Typography>Duration: {policy.duration}</Typography>
            </Paper>
          ))}
        </Box>
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
