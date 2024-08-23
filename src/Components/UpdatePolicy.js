import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Container,
} from '@mui/material';
import axios from 'axios';

const UpdatePolicy = () => {
  const [userPolicies, setUserPolicies] = useState([]);
  const [allPolicies, setAllPolicies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserPolicies();
    fetchAllPolicies();
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
      const uniqueCategories = [
        ...new Set(policies.map((policy) => policy.category)),
      ];
      setCategories(
        uniqueCategories.filter((category) => category !== undefined)
      );
      console.log('Categories:', uniqueCategories);
    } catch (error) {
      console.error('Error fetching user policies:', error);
      setError('Failed to fetch user policies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllPolicies = async () => {
    const token = localStorage.getItem('jwt');
    setIsLoading(true);
    try {
      let allPolicies = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await axios.get(
          'https://strapi-cms-backend-wtzq.onrender.com/api/policies',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
            params: {
              pagination: {
                page: page,
                pageSize: 100,
              },
            },
          }
        );

        allPolicies = [...allPolicies, ...response.data.data];

        if (response.data.meta.pagination.pageCount > page) {
          page++;
        } else {
          hasMorePages = false;
        }
      }

      console.log('All policies response:', allPolicies);
      setAllPolicies(allPolicies);
    } catch (error) {
      console.error('Error fetching all policies:', error);
      setError('Failed to fetch all policies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const getAvailablePlans = (policyName) => {
    const matchingPolicies = allPolicies.filter(
      (policy) => policy.attributes.name === policyName
    );
    return matchingPolicies.flatMap(
      (policy) => policy.attributes.premium_plans
    );
  };

  const handleUpdatePolicy = async () => {
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

      const updatedPolicies = currentPolicies.map((policy) =>
        policy.policy_id === selectedPolicy.policy_id
          ? {
              ...policy,
              duration: selectedPlan.duration,
              premium: selectedPlan.premium,
            }
          : policy
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

      alert('Policy updated successfully!');
      setSelectedPolicy(null);
      setSelectedPlan(null);
      fetchUserPolicies();
    } catch (error) {
      console.error('Error updating policy:', error);
      setError('Failed to update policy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (selectedPlan) {
      setSelectedPlan(null);
    } else if (selectedPolicy) {
      setSelectedPolicy(null);
    }
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

  const PremiumPlanBox = ({ plan, onClick }) => (
    <Paper
      elevation={3}
      sx={{ p: 2, m: 1, cursor: 'pointer', textAlign: 'center' }}
      onClick={() => onClick(plan)}>
      <Typography variant="h6">{plan.duration}</Typography>
      <Typography>Premium: {plan.premium}</Typography>
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
        <Typography>No policies found. Please add a policy first.</Typography>
      ) : !selectedPolicy ? (
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          sx={{
            maxHeight: 250, // Set a fixed height for the policies section
            overflowY: 'auto', // Enable vertical scrolling
            paddingRight: 2, // Optional: Add padding for better aesthetics
          }}>
          {userPolicies.map((policy, index) => (
            <PolicyBox
              key={index}
              policy={policy}
              onClick={(policy) => setSelectedPolicy(policy)}
            />
          ))}
        </Box>
      ) : !selectedPlan ? (
        <Box>
          <Button onClick={handleGoBack} sx={{ mb: 2 }}>
            Go Back
          </Button>
          <Typography variant="h6">Current Policy Details:</Typography>
          <Typography>Name: {selectedPolicy.policy_name}</Typography>
          <Typography>Sum Assured: {selectedPolicy.sum_assured}</Typography>
          <Typography>Duration: {selectedPolicy.duration}</Typography>
          <Typography>Premium: {selectedPolicy.premium}</Typography>
          <Typography variant="h6" mt={2}>
            Available Plans:
          </Typography>
          <Box display="flex" flexWrap="wrap" justifyContent="center">
            {getAvailablePlans(selectedPolicy.policy_name).map(
              (plan, index) => (
                <PremiumPlanBox
                  key={index}
                  plan={plan}
                  onClick={(plan) => setSelectedPlan(plan)}
                />
              )
            )}
          </Box>
        </Box>
      ) : (
        <Box>
          <Button onClick={handleGoBack} sx={{ mb: 2 }}>
            Go Back
          </Button>
          <Typography variant="h6">New Plan Details:</Typography>
          <Typography>Duration: {selectedPlan.duration}</Typography>
          <Typography>Premium: {selectedPlan.premium}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdatePolicy}
            sx={{ mt: 2 }}>
            Confirm Update
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default UpdatePolicy;
