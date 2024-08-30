import React, { useState, useEffect } from 'react';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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

const Login = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fields, setFields] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchFields();
    // Display message if redirected from registration
    const message = location.state?.message;
    if (message) {
      setErrorMessage(message);
    }
  }, [location]);

  const fetchFields = async () => {
    try {
      const response = await axios.get(
        'https://strapi-cms-backend-wtzq.onrender.com/api/login-fields'
      );
      const fetchedFields = response.data.fields;
      setFields(fetchedFields);
      const initialFormData = fetchedFields.reduce((acc, field) => {
        acc[field] = '';
        return acc;
      }, {});
      setFormData(initialFormData);
      const initialErrors = fetchedFields.reduce((acc, field) => {
        acc[field] = false;
        return acc;
      }, {});
      setErrors(initialErrors);
    } catch (error) {
      console.error('Error fetching fields:', error);
      setErrorMessage('Error fetching login fields');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: false,
    }));
  };

  const validateForm = () => {
    const newErrors = fields.reduce((acc, field) => {
      acc[field] = !formData[field].trim();
      return acc;
    }, {});

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      const response = await axios.post(
        'https://strapi-cms-backend-wtzq.onrender.com/api/validate-user',
        {
          identifier: formData.identifier,
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.data.success) {
        // If validation is successful, proceed with login
        const loginResponse = await axios.post(
          'https://strapi-cms-backend-wtzq.onrender.com/api/auth/local',
          {
            identifier: formData.identifier,
            password: formData.password,
          }
        );

        console.log('Login successful:', loginResponse.data);
        // Store the token or user data in local storage or state management
        localStorage.setItem('token', loginResponse.data.jwt);
        navigate('/dashboard'); // Navigate to dashboard or home page
      } else {
        // This else block is not necessary as the backend always throws an error for unsuccessful validations
        setErrorMessage('Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMessage(err.response.data.error);
      } else {
        setErrorMessage('An error occurred during login');
      }
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
            }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography
              component="h1"
              variant="h5"
              gutterBottom
              fontWeight="bold">
              Login to Claims Management
            </Typography>
            <Box
              component="form"
              onSubmit={handleLogin}
              noValidate
              sx={{ mt: 3, width: '100%' }}>
              {fields.map((field) => (
                <TextField
                  key={field}
                  margin="normal"
                  required
                  fullWidth
                  id={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={field}
                  autoComplete={field}
                  type={
                    field === 'password'
                      ? showPassword
                        ? 'text'
                        : 'password'
                      : 'text'
                  }
                  value={formData[field] || ''}
                  onChange={handleChange}
                  error={errors[field]}
                  helperText={errors[field] ? `${field} is required` : ''}
                  InputProps={
                    field === 'password'
                      ? {
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
                        }
                      : undefined
                  }
                />
              ))}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}>
                Login
              </Button>
              {errorMessage && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  {errorMessage}
                </Alert>
              )}
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  variant="body2"
                  color="secondary.main">
                  Register
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Login;
