import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './Components/Login';
import UserDashboard from './Components/UserDashboard';
import AdminDashboard from './Components/AdminDashboard';
import Register from './Components/Register';
import RegisterSuccess from './Components/RegistrationSuccess';
import FileClaim from './Components/FileClaim';

const App = () => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('jwt');
    return !!token;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registration-success" element={<RegisterSuccess />} />
        <Route
          path="/user"
          element={
            isAuthenticated() ? <UserDashboard /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/user/apply-claim"
          element={isAuthenticated() ? <FileClaim /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={
            isAuthenticated() ? <AdminDashboard /> : <Navigate to="/login" />
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
