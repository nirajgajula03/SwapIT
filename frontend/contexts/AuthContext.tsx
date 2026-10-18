import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, UserProfile } from '../types';
import { apiGetMe, apiLogin, apiSignup, apiAddCoins, apiUpdateProfile } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  isLoading: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: Omit<User, 'avatarUrl' | 'location' | 'memberSince' | 'itemsListed' | 'swapsCompleted' | 'badge' | 'totalCoinsEarned' | 'coins' | 'email'>) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAndSetUser = useCallback(async () => {
    if (token) {
        try {
            const userProfile = await apiGetMe(token);
            setCurrentUser(userProfile);
        } catch (error) {
            console.error("Failed to fetch user profile", error);
            localStorage.removeItem('authToken');
            setToken(null);
            setCurrentUser(null);
        }
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    fetchAndSetUser();
  }, [fetchAndSetUser]);

  const login = useCallback(async (username: string, password: string) => {
    const { token: newToken } = await apiLogin(username, password);
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    // The useEffect will trigger a fetch and update the user
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setCurrentUser(null);
    navigate('/login');
  }, [navigate]);

  const signup = useCallback(async (userData: Omit<User, 'avatarUrl' | 'location' | 'memberSince' | 'itemsListed' | 'swapsCompleted' | 'badge' | 'totalCoinsEarned' | 'coins' | 'email'>) => {
    const { token: newToken } = await apiSignup(userData);
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
     // The useEffect will trigger a fetch and update the user
  }, []);

  const addCoins = useCallback(async (amount: number) => {
    if (!token) return;
    await apiAddCoins(amount, token);
    await fetchAndSetUser(); // Refresh user data to show new balance
  }, [token, fetchAndSetUser]);
  
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!token) throw new Error("No user is currently logged in.");
    try {
        const updatedProfile = await apiUpdateProfile(updates, token);
        setCurrentUser(updatedProfile);
    } catch (error) {
        console.error("Failed to update profile in context", error);
        throw error;
    }
  }, [token]);

  const value: AuthContextType = {
    isAuthenticated: !!currentUser,
    currentUser,
    isLoading,
    token,
    login,
    logout,
    signup,
    addCoins,
    refreshCurrentUser: fetchAndSetUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
