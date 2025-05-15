import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'administrator' | 'proiectant' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  checkUserRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real application, this would be a call to your API to validate the session
        const storedUser = localStorage.getItem('mobila_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, this would be a call to your API
      // Mock login for demonstration - in a real app, use NextAuth.js or a similar auth provider
      
      // For demo purposes - preset accounts based on email prefix
      let mockUser: User | null = null;
      
      if (email.startsWith('admin')) {
        mockUser = {
          id: '1',
          name: 'Administrator',
          email,
          role: 'administrator'
        };
      } else if (email.startsWith('proiectant')) {
        mockUser = {
          id: '2',
          name: 'Proiectant Demo',
          email,
          role: 'proiectant'
        };
      } else if (email.startsWith('client')) {
        mockUser = {
          id: '3',
          name: 'Client Demo',
          email,
          role: 'client'
        };
      } else {
        // Default to client role
        mockUser = {
          id: '4',
          name: 'Client',
          email,
          role: 'client'
        };
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(mockUser);
      localStorage.setItem('mobila_user', JSON.stringify(mockUser));
    } catch (err: any) {
      setError(err.message || 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'client') => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, this would be a call to your API
      // Mock registration for demonstration
      
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setUser(mockUser);
      localStorage.setItem('mobila_user', JSON.stringify(mockUser));
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear user data
      setUser(null);
      localStorage.removeItem('mobila_user');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Helper function to check if user has required role(s)
  const checkUserRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    checkUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
