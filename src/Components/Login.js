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

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: false, password: false });
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({ username: false, password: false });
    setErrorMessage('');

    // Check for empty fields
    const newErrors = {
      username: username.trim() === '',
      password: password.trim() === '',
    };

    if (newErrors.username || newErrors.password) {
      setErrors(newErrors);
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      const response = await axios.post(
        'https://strapi-cms-backend-wtzq.onrender.com/api/auth/local',
        {
          identifier: username,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        }
      );

      const { jwt, user } = response.data;
      localStorage.setItem('jwt', jwt);
      localStorage.setItem('username', username);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      navigate(user.isAdmin ? '/admin' : '/user');
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage(
        err.response?.data?.error?.message || 'An error occurred during login'
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
              Claims Management System
            </Typography>
            <Box
              component="form"
              onSubmit={handleLogin}
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                New User?{' '}
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
