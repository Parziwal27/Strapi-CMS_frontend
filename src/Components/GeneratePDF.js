import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import {
  Button,
  CircularProgress,
  Typography,
  Container,
  Snackbar,
} from '@mui/material';
import axios from 'axios';

const GeneratePDF = () => {
  const [userData, setUserData] = useState(null);
  const [claims, setClaims] = useState([]);
  const [userPolicies, setUserPolicies] = useState([]);
  const [allPolicies, setAllPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      fetchClaims();
      fetchPolicies();
    }
  }, [userData]);

  const fetchUserData = async () => {
    const token = localStorage.getItem('jwt');
    try {
      const response = await axios.get(
        'https://strapi-cms-backend-wtzq.onrender.com/api/users/me',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData(response.data);
      const policies = response.data.policies || [];
      setUserPolicies(policies);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClaims = async () => {
    const token = localStorage.getItem('jwt');
    try {
      const response = await axios.get(
        'https://strapi-cms-backend-wtzq.onrender.com/api/claims',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (Array.isArray(response.data.data)) {
        setClaims(response.data.data);
      } else {
        throw new Error('Unexpected response format for claims');
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      setError('Failed to fetch claims. Please try again.');
    }
  };

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

      setAllPolicies(allPolicies);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError(
        err.response?.data?.error?.message ||
          'An error occurred while fetching policies'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPolicyName = (policyId) => {
    const policy = allPolicies.find((p) => p.id === parseInt(policyId));
    return policy ? policy.attributes.name : 'Unknown Policy';
  };

  const generatePDF = () => {
    if (!userData) {
      setSnackbarMessage('User data is not available. Please try again.');
      setSnackbarOpen(true);
      return;
    }

    const doc = new jsPDF();
    let yOffset = 20;

    const addKeyValuePair = (key, value, fontSize = 12, indent = 0) => {
      doc.setFontSize(fontSize);
      doc.text(`${key}: ${value}`, 20 + indent, yOffset);
      yOffset += fontSize / 2 + 5;
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    };

    const addSection = (title) => {
      doc.setDrawColor(0);
      doc.setFillColor(200, 220, 255);
      doc.rect(15, yOffset - 5, 180, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text(title, 20, yOffset);
      yOffset += 10;
    };

    // Add heading
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text('Claims Management System', 105, yOffset, { align: 'center' });
    yOffset += 20;

    // Profile Section
    addSection('User Profile');
    addKeyValuePair('Username', userData.username);
    addKeyValuePair('Email', userData.email);
    addKeyValuePair('Provider', userData.provider || 'N/A');
    addKeyValuePair(
      'Created At',
      new Date(userData.createdAt).toLocaleString()
    );
    addKeyValuePair(
      'Updated At',
      new Date(userData.updatedAt).toLocaleString()
    );
    yOffset += 10;

    // Policies Section
    addSection('Current Policies');
    if (userPolicies.length === 0) {
      addKeyValuePair('Info', 'No policies found for this user.');
    } else {
      userPolicies.forEach((policy, index) => {
        addKeyValuePair(`Policy ${index + 1}`, policy.policy_name, 14);
        addKeyValuePair('Sum Assured', policy.sum_assured, 12, 10);
        addKeyValuePair('Premium', policy.premium, 12, 10);
        addKeyValuePair('Duration', policy.duration, 12, 10);
      });
    }
    yOffset += 10;

    // Claims Section
    addSection('Claims');
    const filteredClaims = claims.filter(
      (claim) => claim.attributes.policyholder_id === userData.username
    );
    if (filteredClaims.length === 0) {
      addKeyValuePair('Info', 'No claims found for this user.');
    } else {
      const sortedClaims = filteredClaims.sort((a, b) => {
        if (
          a.attributes.status === 'pending' &&
          b.attributes.status !== 'pending'
        )
          return -1;
        if (
          a.attributes.status !== 'pending' &&
          b.attributes.status === 'pending'
        )
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

      sortedClaims.forEach((claim, index) => {
        addKeyValuePair(`Claim ${index + 1}`, '', 14);
        addKeyValuePair(
          'Policy',
          getPolicyName(claim.attributes.policy_id),
          12,
          10
        );
        addKeyValuePair('Amount', claim.attributes.amount, 12, 10);
        addKeyValuePair('Status', claim.attributes.status, 12, 10);
      });
    }

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text('Generated by Parziwal27', 105, 290, { align: 'center' });

    // Open PDF in a new tab
    window.open(doc.output('bloburl'), '_blank');
  };

  if (isLoading) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 2 }}>
      <Button
        variant="contained"
        onClick={generatePDF}
        disabled={isLoading || !userData}
        sx={{
          backgroundColor: '#4CAF50',
          '&:hover': {
            backgroundColor: '#45a049',
          },
        }}>
        Download PDF
      </Button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default GeneratePDF;
