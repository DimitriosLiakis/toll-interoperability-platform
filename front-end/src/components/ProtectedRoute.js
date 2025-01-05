import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('token'); // Check if the user is logged in

  if (!isLoggedIn) {
    // Redirect to the home page (or login page) if not logged in
    return <Navigate to="/" replace />;
  }

  // Render the requested component if logged in
  return children;
};

export default ProtectedRoute;