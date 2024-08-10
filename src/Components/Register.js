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
    username: '',
    email: '',
    password: '',
    age: '',
  });
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
      [name]: '',
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      email: '',
      password: '',
      age: '',
    };

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    const age = parseInt(formData.age, 10);
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
      isValid = false;
    } else if (isNaN(age) || age < 28 || age > 100) {
      newErrors.age = 'Age must be between 28 and 100';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
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
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage =
        err.response?.data?.error?.message ||
        'An error occurred during registration';
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: errorMessage,
      }));
    }
  };

  return (
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
                error={!!errors.username}
                helperText={errors.username}
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
                error={!!errors.email}
                helperText={errors.email}
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
                error={!!errors.password}
                helperText={errors.password}
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
                label="Age (28-100)"
                type="number"
                id="age"
                value={formData.age}
                onChange={handleChange}
                error={!!errors.age}
                helperText={errors.age}
                inputProps={{ min: 28, max: 100 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}>
                Register
              </Button>
              {errors.general && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  {errors.general}
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
  );
};

export default Register;
