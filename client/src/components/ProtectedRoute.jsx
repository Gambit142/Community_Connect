import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.login);
  const location = useLocation();

  if (!user) {
    // Redirect to signup with current location as state for return after login
    return <Navigate to="/auth/signup" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;