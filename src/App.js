import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import Login from './Components/Login';
import UserDashboard from './Components/UserDashboard';
import AdminDashboard from './Components/AdminDashboard';
import Register from './Components/Register';
import RegisterSuccess from './Components/RegistrationSuccess';
const App = () => {
  const isAuthenticated = () => {
    // Check if the JWT token exists in local storage
    return !!localStorage.getItem('jwt');
  };

  const PrivateRoute = ({ children }) => {
    const location = useLocation();
    return isAuthenticated() ? (
      children
    ) : (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  };

  useEffect(() => {
    // Logout and redirect to login on window/tab close or reload
    const handleUnload = () => {
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />{' '}
        {/* Move this outside of PrivateRoute */}
        <Route path="/registration-success" element={<RegisterSuccess />} />
        <Route
          path="/user"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
