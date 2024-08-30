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
  Alert,
} from '@mui/material';
import axios from 'axios';

const FileClaim = ({ selectedPolicy: initialSelectedPolicy }) => {
  const [userPolicies, setUserPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSelectedPolicy(null);
    fetchUserPolicies();
  }, []);
useEffect(() => {
  if (error) {
    const timer = setTimeout(() => {
      setError(null);
    }, 2000);

    return () => clearTimeout(timer);
  }
}, [error]);
useEffect(() => {
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

  const claimAmount = parseFloat(amount);
  if (isNaN(claimAmount) || claimAmount <= 0) {
    setError('Please enter a valid positive amount.');
    return;
  }

  if (claimAmount > parseFloat(selectedPolicy.left_amount)) {
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
          amount: claimAmount,
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
    setError(null);
  } catch (error) {
    console.error('Error filing claim:', error);
    console.error('Error response:', error.response);
    if (error.response && error.response.data && error.response.data.message) {
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

return (
  <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>
      {selectedPolicy ? 'File Claim' : 'Choose Policy'}
    </Typography>
    {error && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )}
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
                cursor: 'default',
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
            inputProps={{ min: 0 }}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleFileClaim}
            sx={{ mr: 2 }}>
            Submit Claim
          </Button>
        </Box>
      </Box>
    )}
  </Container>
);
};

export default FileClaim;
