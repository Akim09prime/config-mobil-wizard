
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['administrator', 'proiectant', 'client'],
  redirectTo = '/auth/login'
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-accent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} />;
  }
  
  // If user has the required role, render the children
  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }
  
  // If user doesn't have the required role, redirect based on role
  if (user.role === 'administrator') {
    return <Navigate to="/admin/dashboard" />;
  } else if (user.role === 'proiectant') {
    return <Navigate to="/projects" />;
  } else {
    return <Navigate to="/catalog" />;
  }
};

export default ProtectedRoute;
