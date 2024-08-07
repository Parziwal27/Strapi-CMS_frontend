import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Button, CircularProgress, Typography, Container } from '@mui/material';
import axios, { all } from 'axios';

const GeneratePDF = () => {
  const [userData, setUserData] = useState(null);
  const [claims, setClaims] = useState([]);
  const [userPolicies, setUserPolicies] = useState([]);
  const [allPolicies, setAllPolicies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const uniqueCategories = [
        ...new Set(policies.map((policy) => policy.category)),
      ];
      setCategories(
        uniqueCategories.filter((category) => category !== undefined)
      );
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
    const token = localStorage.getItem('jwt');
    try {
      const response = await axios.get(
        'https://strapi-cms-backend-wtzq.onrender.com/api/policies',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllPolicies(response.data.data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
      setError('Failed to fetch policies. Please try again.');
    }
  };

  const getPolicyName = (policyId) => {
    console.log(allPolicies);
    console.log(policyId, typeof policyId);
    const policy = allPolicies.find((p) => p.id === parseInt(policyId));
    return policy ? policy.attributes.name : 'Unknown Policy';
  };

  const generatePDF = () => {
    if (!userData || claims.length === 0 || userPolicies.length === 0) return;

    const doc = new jsPDF();
    let yOffset = 20;

    const addText = (text, fontSize = 12, indent = 0) => {
      doc.setFontSize(fontSize);
      doc.text(text, 20 + indent, yOffset);
      yOffset += fontSize / 2 + 5;
      if (yOffset > 270) {
        // If the content is too long, add a new page
        doc.addPage();
        yOffset = 20;
      }
    };

    const addSection = (title) => {
      doc.setDrawColor(0);
      doc.setFillColor(200, 220, 255);
      doc.rect(15, yOffset - 5, 180, 10, 'F');
      doc.setTextColor(0, 0, 0);
      addText(title, 14);
      yOffset += 5;
    };

    // Add heading
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text('Claims Management System', 105, yOffset, { align: 'center' });
    yOffset += 20;

    // Profile Section
    addSection('User Profile');
    addText(`Username: ${userData.username}`);
    addText(`Email: ${userData.email}`);
    addText(`Provider: ${userData.provider || 'N/A'}`);
    addText(`Created At: ${new Date(userData.createdAt).toLocaleString()}`);
    addText(`Updated At: ${new Date(userData.updatedAt).toLocaleString()}`);
    yOffset += 10;

    // Policies Section
    addSection('Current Policies');
    userPolicies.forEach((policy, index) => {
      addText(`Policy ${index + 1}: ${policy.policy_name}`, 14);
      addText(`Sum Assured: ${policy.sum_assured}`, 12, 10);
      addText(`Premium: ${policy.premium}`, 12, 10);
      addText(`Duration: ${policy.duration}`, 12, 10);
    });

    // Claims Section
    addSection('Claims');
    const filteredClaims = claims.filter(
      (claim) => claim.attributes.policyholder_id === userData.username
    );
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
      addText(`Claim ${index + 1}:`, 14);
      addText(`Policy: ${getPolicyName(claim.attributes.policy_id)}`, 12, 10);
      addText(`Amount: ${claim.attributes.amount}`, 12, 10);
      addText(`Status: ${claim.attributes.status}`, 12, 10);
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text('Generated by Parziwal27', 105, 290, {
      align: 'center',
    });

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
        sx={{
          backgroundColor: '#4CAF50',
          '&:hover': {
            backgroundColor: '#45a049',
          },
        }}>
        Download PDF
      </Button>
    </Container>
  );
};

export default GeneratePDF;
