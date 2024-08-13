import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/system';

const ConfirmClaim = () => {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingClaims, setLoadingClaims] = useState({});
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setError('No access token found. Please login again.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(
        'https://strapi-cms-backend-wtzq.onrender.com/api/claims',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      // Accessing the claims data from the response and sorting by status
      const allClaims = response.data.data;
      if (allClaims.length === 0) {
        setClaims([]);
      } else {
        const sortedClaims = allClaims.sort((a, b) => {
          if (a.attributes.status === 'pending') return -1;
          if (b.attributes.status === 'pending') return 1;
          if (a.attributes.status === 'approved') return -1;
          if (b.attributes.status === 'approved') return 1;
          return 0;
        });
        setClaims(sortedClaims);
      }
    } catch (error) {
      setError(`Failed to fetch data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateClaimStatus = async (claimId, newStatus) => {
    setLoadingClaims((prev) => ({ ...prev, [claimId]: true }));
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('No access token found. Please login again.');
        return;
      }

      console.log('Fetching claim details...');
      const claimResponse = await axios.get(
        `https://strapi-cms-backend-wtzq.onrender.com/api/claims/${claimId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      console.log('Claim response:', claimResponse.data);
      const claim = claimResponse.data.data;

      if (newStatus === 'approved') {
        console.log('Claim approval requested. Fetching user details...');
        const userResponse = await axios.get(
          `https://strapi-cms-backend-wtzq.onrender.com/api/users?filters[username]=${claim.attributes.policyholder_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        console.log('User response:', userResponse.data);
        const users = userResponse.data;

        if (!users || users.length === 0) {
          throw new Error('User data not found');
        }

        const user = users[0];

        if (!Array.isArray(user.policies)) {
          console.error('Unexpected policies format:', user.policies);
          throw new Error('User policies not found or in unexpected format');
        }

        const policy = user.policies.find(
          (p) => p.policy_id === parseInt(claim.attributes.policy_id)
        );

        if (!policy) {
          throw new Error('Matching policy not found');
        }

        const claimAmount = parseFloat(claim.attributes.amount);
        if (claimAmount > policy.left_amount) {
          setAlert(
            `Claim amount ($${claimAmount}) exceeds the remaining balance ($${policy.left_amount}). Claim cannot be approved.`
          );
          return;
        }

        // If we've passed the check, proceed with updating the claim status
        console.log('Updating claim status...');
        await axios.put(
          `https://strapi-cms-backend-wtzq.onrender.com/api/claims/${claimId}`,
          { data: { status: newStatus } },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        console.log('Updating policy left_amount...');
        const updatedPolicies = user.policies.map((p) => {
          if (p.policy_id === parseInt(claim.attributes.policy_id)) {
            return {
              ...p,
              left_amount: Math.max(0, p.left_amount - claimAmount),
            };
          }
          return p;
        });

        console.log('Updated policies:', updatedPolicies);

        console.log('Sending updated policies to server...');
        await axios.put(
          `https://strapi-cms-backend-wtzq.onrender.com/api/users/${user.id}`,
          { policies: updatedPolicies },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );
      } else {
        // If the status is not 'approved', just update the claim status
        console.log('Updating claim status...');
        await axios.put(
          `https://strapi-cms-backend-wtzq.onrender.com/api/claims/${claimId}`,
          { data: { status: newStatus } },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );
      }

      console.log('Fetching updated claims...');
      await fetchClaims();
    } catch (error) {
      console.error('Error in updateClaimStatus:', error);
      setError(`Failed to update claim: ${error.message}`);
    } finally {
      setLoadingClaims((prev) => ({ ...prev, [claimId]: false }));
    }
  };
  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Confirm Claims
      </Typography>
      {alert && (
        <Alert severity="warning" onClose={() => setAlert(null)} sx={{ mb: 2 }}>
          {alert}
        </Alert>
      )}

      {claims.length === 0 ? (
        <Typography>No claims found.</Typography>
      ) : (
        <Grid
          container
          spacing={2}
          sx={{
            maxHeight: 200,
            overflowY: 'auto',
            paddingRight: 2,
          }}>
          {claims.map((claim) => {
            const { id, attributes } = claim;
            let backgroundColor = '';
            let hoverColor = '';

            switch (attributes.status) {
              case 'pending':
                backgroundColor = '#fff9c4';
                hoverColor = '#ffe082';
                break;
              case 'approved':
                backgroundColor = '#c8e6c9';
                hoverColor = '#a5d6a7';
                break;
              case 'rejected':
                backgroundColor = '#ffcdd2';
                hoverColor = '#ef9a9a';
                break;
              default:
                break;
            }

            const StyledPaper = styled(Paper)({
              backgroundColor,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: hoverColor,
                transform: 'translateY(-5px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              },
              padding: '16px',
              borderRadius: '10px',
            });

            return (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <StyledPaper elevation={3}>
                  <Typography>
                    Policyholder ID: {attributes.policyholder_id}
                  </Typography>
                  <Typography>Policy ID: {attributes.policy_id}</Typography>
                  <Typography>Amount: {attributes.amount}</Typography>
                  <Typography>Status: {attributes.status}</Typography>
                  {attributes.status === 'pending' && (
                    <Box mt={1}>
                      <Button
                        startIcon={<CheckIcon />}
                        onClick={() => updateClaimStatus(id, 'approved')}
                        sx={{ mr: 1 }}>
                        Confirm
                      </Button>
                      <Button
                        startIcon={<CloseIcon />}
                        onClick={() => updateClaimStatus(id, 'rejected')}>
                        Reject
                      </Button>
                    </Box>
                  )}
                </StyledPaper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default ConfirmClaim;
