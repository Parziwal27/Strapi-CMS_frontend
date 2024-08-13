import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
} from '@mui/material';
import axios from 'axios';

const CategoryBox = ({ category, onClick }) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      m: 2,
      cursor: 'pointer',
      textAlign: 'center',
      '&:hover': {
        backgroundColor: '#e0e0e0',
      },
    }}
    onClick={() => onClick(category)}>
    <Typography variant="h5">{category}</Typography>
  </Paper>
);

const PolicyBox = ({ policy, onClick }) => (
  <Paper
    elevation={3}
    sx={{ p: 2, m: 1, cursor: 'pointer', textAlign: 'center' }}
    onClick={() => onClick(policy.id)}>
    <Typography variant="h6">{policy.name}</Typography>
    <Typography>Sum Assured: {policy.sum_assured}</Typography>
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

const AddPolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPolicies, setUserPolicies] = useState([]);

  useEffect(() => {
    fetchPolicies();
    fetchUserPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem('jwt');
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
                pageSize: 100, // Adjust this value based on your API's maximum allowed page size
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

      setPolicies(allPolicies);
      const uniqueCategories = [
        ...new Set(allPolicies.map((policy) => policy.attributes.category)),
      ];
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError(
        err.response?.data?.error?.message ||
          'An error occurred while fetching policies'
      );
      setLoading(false);
    }
  };

  const fetchUserPolicies = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(
        'https://strapi-cms-backend-wtzq.onrender.com/api/users/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserPolicies(response.data.policies || []);
    } catch (err) {
      console.error('Error fetching user policies:', err);
      setError('Failed to fetch user policies. Please try again.');
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedPolicyId(null);
  };

  const handlePolicySelect = (policyId) => {
    if (userPolicies.some((policy) => policy.policy_id === policyId)) {
      setError('You already have this policy. You cannot add it again.');
    } else {
      setSelectedPolicyId(policyId);
      setError(null);
    }
  };

  const handlePremiumPlanSelect = async (plan) => {
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

      const policy = policies.find((p) => p.id === selectedPolicyId);

      // Check if the user already has this policy
      if (currentPolicies.some((p) => p.policy_id === selectedPolicyId)) {
        setError('You already have this policy. You cannot add it again.');
        return;
      }

      const newPolicy = {
        policy_id: selectedPolicyId,
        policy_name: policy.attributes.name,
        sum_assured: parseFloat(policy.attributes.sum_assured),
        premium: plan.premium,
        duration: plan.duration,
        left_amount: parseFloat(policy.attributes.sum_assured),
      };

      const updatedPolicies = [...currentPolicies, newPolicy];

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

      alert(`Successfully added the policy: ${newPolicy.policy_name}`);
      setSelectedCategory(null);
      setSelectedPolicyId(null);
      fetchUserPolicies(); // Refresh the user's policies
    } catch (err) {
      console.error('Error updating policies:', err);
      setError(
        err.response?.data?.error?.message ||
          'An error occurred while updating policies'
      );
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const getDistinctPolicies = (category) => {
    return policies
      .filter((policy) => policy.attributes.category === category)
      .reduce((acc, policy) => {
        if (!acc.find((p) => p.name === policy.attributes.name)) {
          acc.push({
            id: policy.id,
            name: policy.attributes.name,
            sum_assured: policy.attributes.sum_assured,
          });
        }
        return acc;
      }, []);
  };

  const getPremiumPlans = (policyId) => {
    const policy = policies.find((p) => p.id === policyId);
    if (!policy) return [];

    // Find all policies with the same name and category
    const relatedPolicies = policies.filter(
      (p) =>
        p.attributes.name === policy.attributes.name &&
        p.attributes.category === policy.attributes.category
    );

    // Extract all unique premium plans
    return relatedPolicies.map((p) => p.attributes.premium_plans);
  };

  return (
    <Box>
      <Typography variant="h5">Choose</Typography>
      {error && <Typography color="error">{error}</Typography>}
      {!selectedCategory ? (
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          sx={{
            maxHeight: 250, // Set a fixed height for the policies section
            overflowY: 'auto', // Enable vertical scrolling
            paddingRight: 2, // Optional: Add padding for better aesthetics
          }}>
          {categories.map((category, index) => (
            <CategoryBox
              key={index}
              category={category}
              onClick={handleCategorySelect}
            />
          ))}
        </Box>
      ) : !selectedPolicyId ? (
        <>
          <Button onClick={() => setSelectedCategory(null)} sx={{ mb: 2 }}>
            Go Back
          </Button>
          <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            sx={{
              maxHeight: 200,
              overflowY: 'auto',
              paddingRight: 2,
            }}>
            {getDistinctPolicies(selectedCategory).map((policy) => (
              <PolicyBox
                key={policy.id}
                policy={policy}
                onClick={handlePolicySelect}
              />
            ))}
          </Box>
        </>
      ) : (
        <>
          <Button onClick={() => setSelectedPolicyId(null)} sx={{ mb: 2 }}>
            Go Back
          </Button>
          <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            sx={{
              maxHeight: 200,
              overflowY: 'auto',
              paddingRight: 2,
            }}>
            {getPremiumPlans(selectedPolicyId).map((plan, index) => (
              <PremiumPlanBox
                key={index}
                plan={plan}
                onClick={() => handlePremiumPlanSelect(plan)}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default AddPolicy;
