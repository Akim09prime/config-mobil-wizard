
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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
  
  // Debug information
  useEffect(() => {
    console.log('Protected Route Status:', {
      isAuthenticated, 
      userRole: user?.role,
      allowedRoles,
      loading
    });
  }, [isAuthenticated, user, allowedRoles, loading]);
  
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
    // Using the toast to inform user that authentication is required
    toast({
      title: "Autentificare necesară",
      description: "Trebuie să vă autentificați pentru a accesa această pagină.",
      variant: "destructive",
    });
    return <Navigate to={redirectTo} />;
  }
  
  // Check if user has one of the allowed roles
  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }
  
  // If user doesn't have the required role, redirect based on role
  toast({
    title: "Acces restricționat",
    description: "Nu aveți permisiunea de a accesa această pagină.",
    variant: "destructive",
  });
  
  // Redirect to appropriate dashboard based on user role
  if (user.role === 'administrator') {
    return <Navigate to="/admin/dashboard" />;
  } else if (user.role === 'proiectant') {
    return <Navigate to="/projects" />;
  } else if (user.role === 'client') {
    return <Navigate to="/catalog" />;
  }
  
  // Default fallback to home
  return <Navigate to="/" />;
};

export default ProtectedRoute;
