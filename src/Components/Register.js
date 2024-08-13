import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Link,
  Container,
  CssBaseline,
  Paper,
  Avatar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: '',
  });
  const [errors, setErrors] = useState({
    username: false,
    email: false,
    password: false,
    age: false,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear the error for the field being changed
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: false,
    }));
  };

  const validateForm = () => {
    const newErrors = {
      username: !formData.username.trim(),
      email: !formData.email.trim(),
      password: !formData.password.trim(),
      age: !formData.age.trim(),
    };

    setErrors(newErrors);

    // Additional age validation
    if (formData.age.trim()) {
      const age = parseInt(formData.age, 10);
      if (isNaN(age) || age < 18 || age > 100) {
        newErrors.age = true;
        setErrorMessage('Age must be between 18 and 100');
      }
    }

    return !Object.values(newErrors).some(Boolean);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      setErrorMessage('Please fill in all required fields correctly.');
      return;
    }

    try {
      const payload = {
        ...formData,
        confirmed: false,
        blocked: false,
        role: 'Authenticated',
        isAdmin: false,
        policies: [],
      };

      const response = await axios.post(
        'https://strapi-cms-backend-wtzq.onrender.com/api/auth/local/register',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        }
      );

      console.log('Registration successful:', response.data);
      navigate('/login', {
        state: { message: 'Registration successful. Please log in.' },
      });
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage(
        err.response?.data?.error?.message ||
          'An error occurred during registration'
      );
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage:
          'url(data:image/jpeg;base64,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)',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
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
                <LockOutlinedIcon />
              </Avatar>
              <Typography
                component="h1"
                variant="h5"
                gutterBottom
                fontWeight="bold">
                Register for Claims Management
              </Typography>
              <Box
                component="form"
                onSubmit={handleRegister}
                noValidate
                sx={{ mt: 3, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  helperText={errors.username ? 'Username is required' : ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  helperText={errors.email ? 'Email is required' : ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  helperText={errors.password ? 'Password is required' : ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end">
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="age"
                  label="Age (18-100)"
                  type="number"
                  id="age"
                  value={formData.age}
                  onChange={handleChange}
                  error={errors.age}
                  helperText={
                    errors.age
                      ? 'Age is required and must be between 18 and 100'
                      : ''
                  }
                  inputProps={{ min: 18, max: 100 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}>
                  Register
                </Button>
                {errorMessage && (
                  <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                    {errorMessage}
                  </Alert>
                )}
                <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    color="secondary.main">
                    Login
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Container>
      </ThemeProvider>
    </Box>
  );
};

export default Register;
