import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Container,
} from '@mui/material';
import axios from 'axios';

const ClaimsStatus = () => {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
    fetchPolicies();
  }, []);

  const fetchClaims = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const storedUsername = localStorage.getItem('username');
      setUsername(storedUsername);

      const response = await axios.get(
        'https://strapi-cms-backend-wtzq.onrender.com/api/claims',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data.data)) {
        setClaims(response.data.data);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      setError('Failed to fetch claims. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem('jwt');
      let allPolicies = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await axios.get(
          `https://strapi-cms-backend-wtzq.onrender.com/api/policies?pagination[page]=${page}&pagination[pageSize]=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        allPolicies = [...allPolicies, ...(response.data.data || [])];
        hasMore =
          response.data.meta.pagination.page <
          response.data.meta.pagination.pageCount;
        page++;
      }

      setPolicies(allPolicies);
    } catch (error) {
      console.error('Error fetching policies:', error);
      setError('Failed to fetch all policies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClaims = claims.filter(
    (claim) => claim.attributes.policyholder_id === username
  );

  const sortedClaims = filteredClaims.sort((a, b) => {
    if (a.attributes.status === 'pending' && b.attributes.status !== 'pending')
      return -1;
    if (a.attributes.status !== 'pending' && b.attributes.status === 'pending')
      return 1;
    if (
      a.attributes.status === 'approved' &&
      b.attributes.status !== 'approved'
    )
      return -1;
    if (
      a.attributes.status !== 'approved' &&
      b.attributes.status === 'approved'
    )
      return 1;
    return 0;
  });

  const getPolicyName = (policyId) => {
    const policy = policies.find((p) => p.id === parseInt(policyId));
    return policy ? policy.attributes.name : 'Unknown Policy';
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
        Claims Status
      </Typography>
      {sortedClaims.length === 0 ? (
        <Typography>No claims found.</Typography>
      ) : (
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          sx={{
            maxHeight: 250, // Set a fixed height for the policies section
            overflowY: 'auto', // Enable vertical scrolling
            paddingRight: 2, // Optional: Add padding for better aesthetics
          }}>
          {sortedClaims.map((claim) => (
            <Paper
              key={claim.id}
              elevation={3}
              sx={{
                p: 2,
                m: 1,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'background-color 0.3s, transform 0.3s',
                '&:hover': {
                  backgroundColor:
                    claim.attributes.status === 'pending'
                      ? '#fbc02d' // Darker yellow
                      : claim.attributes.status === 'approved'
                      ? '#66bb6a' // Darker green
                      : '#e57373', // Darker red
                  transform: 'scale(1.05)',
                },
                backgroundColor:
                  claim.attributes.status === 'pending'
                    ? '#fff59d' // Lighter yellow
                    : claim.attributes.status === 'approved'
                    ? '#a5d6a7' // Lighter green
                    : '#ef9a9a', // Lighter red
              }}>
              <Typography variant="h6">
                {getPolicyName(claim.attributes.policy_id)}
              </Typography>
              <Typography>Amount: {claim.attributes.amount}</Typography>
              <Typography>Status: {claim.attributes.status}</Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default ClaimsStatus;
