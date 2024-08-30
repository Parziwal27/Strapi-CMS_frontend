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
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fields, setFields] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    let timer;
    if (errorMessage || successMessage) {
      timer = setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [errorMessage, successMessage]);

  const fetchFields = async () => {
    try {
      const response = await axios.get(
        'https://strapi-cms-backend-wtzq.onrender.com/api/user-fields'
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
      setErrorMessage('Error fetching registration fields');
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

    if (formData.age) {
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
    setSuccessMessage('');

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
      setSuccessMessage('Registration successful. Please log in.');
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Registration successful. Please log in.' },
        });
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage(
        err.response?.data?.error?.message ||
          'An error occurred during registration'
      );
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
              Register for Claims Management
            </Typography>
            <Box
              component="form"
              onSubmit={handleRegister}
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
                Register
              </Button>
              {errorMessage && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  {errorMessage}
                </Alert>
              )}
              {successMessage && (
                <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
                  {successMessage}
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
