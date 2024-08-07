import React from 'react';
import { Typography, Box, Container, Paper, Avatar } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

const RegistrationSuccess = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
          }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <EmailIcon />
          </Avatar>
          <Typography component="h1" variant="h5" gutterBottom>
            Registration Successful
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center' }}>
            A confirmation email has been sent to your email address. Please
            check your inbox and click on the link to confirm your registration.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegistrationSuccess;
