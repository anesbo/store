// src/components/layout/ProtectedLayout.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../hooks/useSettings';
import { Outlet } from 'react-router-dom';
import Button from '../ui/Button.jsx';

function LoginScreen() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(password);
    if (!success) {
      setError('Incorrect password.');
    }
  };

  return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'80vh'}}>
      <form onSubmit={handleSubmit} style={{padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}>
        <h2 style={{marginTop: 0}}>Enter Password</h2>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          style={{padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', width: '100%', marginBottom: '1rem'}}
        />
        <Button type="submit" variant="edit">Login</Button>
        {error && <p style={{color:'red', marginTop: '1rem'}}>{error}</p>}
      </form>
    </div>
  );
}

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();
  
  const passwordIsSet = settings?.some(s => s.key === 'passwordHash');

  // If the settings are still loading, you might want to show a loading indicator
  if (settings === undefined) {
    return <div>Loading...</div>;
  }

  // If no password is set in the DB, or if the user is authenticated, show the page.
  if (!passwordIsSet || isAuthenticated) {
    return <Outlet />; // This renders the actual page (Dashboard, Inventory, etc.)
  }

  // Otherwise, show the login screen.
  return <LoginScreen />;
}