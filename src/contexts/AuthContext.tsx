import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isPuntor: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setProfile(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen to storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rentcar_current_user') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Start login process
      const loginPromise = authService.signIn(email, password);
      
      // Add minimum delay for smooth transition (500ms)
      const delayPromise = new Promise(resolve => setTimeout(resolve, 500));
      
      // Wait for both login and minimum delay
      const result = await Promise.all([loginPromise, delayPromise]);
      const { user: loggedInUser, profile: userProfile } = result[0];
      
      // Smooth transition before setting user (300ms)
      await new Promise(resolve => setTimeout(resolve, 300));
      setUser(loggedInUser);
      setProfile(userProfile);
      
      // Additional delay for smooth exit (200ms)
      await new Promise(resolve => setTimeout(resolve, 200));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Smooth transition before logout
      await new Promise(resolve => setTimeout(resolve, 300));
      await authService.signOut();
      
      // Smooth transition after logout
      await new Promise(resolve => setTimeout(resolve, 300));
      setUser(null);
      setProfile(null);
    } catch (error) {
      throw error;
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await authService.getUserProfile(user.id);
      setUser(userProfile);
      setProfile(userProfile);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    isAdmin: profile?.role === 'admin',
    isPuntor: profile?.role === 'puntor',
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

