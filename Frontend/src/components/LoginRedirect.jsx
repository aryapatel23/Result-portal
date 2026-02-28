import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * LoginRedirect - Redirects old login page URLs to home page with login query param.
 * The login is handled via the popup modal in Navbar, so separate login pages are removed.
 * This component catches any remaining links to /student/login, /teacher/login, /admin/login
 * and redirects them to "/?login=<role>" so the Navbar login modal auto-opens.
 */
const LoginRedirect = () => {
  const location = useLocation();

  // Extract role from the URL path (e.g., /teacher/login -> teacher)
  const pathParts = location.pathname.split('/');
  const role = pathParts[1] || 'student'; // student, teacher, or admin

  return <Navigate to={`/?login=${role}`} replace />;
};

export default LoginRedirect;
