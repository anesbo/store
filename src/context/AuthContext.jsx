// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { useSettings } from '../hooks/useSettings';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { settings, hashPassword } = useSettings();

  const login = async (password) => {
    const passwordSetting = settings?.find(s => s.key === 'passwordHash');
    const storedHash = passwordSetting ? passwordSetting.value : null;

    if (!storedHash) {
      setIsAuthenticated(true);
      return true;
    }
    
    const enteredHash = await hashPassword(password);
    if (enteredHash === storedHash) {
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  };

  // NEW: Logout function
  const logout = () => {
    setIsAuthenticated(false);
  };

  // Add logout to the context value
  const value = { isAuthenticated, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}