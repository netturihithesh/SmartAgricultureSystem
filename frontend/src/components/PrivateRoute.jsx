import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Wraps any route that requires authentication.
 * If session is null (unauthenticated), redirects to /login.
 * Usage in App.jsx: <Route path="/dashboard" element={<PrivateRoute session={session}><ActionHome /></PrivateRoute>} />
 */
const PrivateRoute = ({ session, children }) => {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;
