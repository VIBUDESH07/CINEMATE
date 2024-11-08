// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn'); // Check if the user is logged in

  return isLoggedIn ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
