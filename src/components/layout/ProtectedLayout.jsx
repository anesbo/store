// src/components/layout/ProtectedLayout.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings, useSetting } from '../../hooks/useSettings';
import { Outlet } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import toast from 'react-hot-toast';

function LoginScreen() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  
  const [isRecovery, setIsRecovery] = useState(false);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const { resetPasswordWithRecovery } = useSettings();
  const secretQuestion = useSetting('secretQuestion', '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (isRecovery) {
        const success = await resetPasswordWithRecovery(recoveryAnswer);
        if (success) {
            toast.success('Password reset! The page will now reload.');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            setError('Incorrect answer.');
        }
    } else {
        const success = await login(password);
        if (!success) {
            setError('Incorrect password.');
        }
    }
  };

  return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'80vh'}}>
      <form onSubmit={handleSubmit} style={{padding: '2rem', /* ... */}}>
        <h2 style={{marginTop: 0}}>
            {isRecovery ? 'Password Recovery' : 'Enter Password'}
        </h2>

        {isRecovery ? (
            <>
                <p style={{fontWeight: 500}}>{secretQuestion || 'No recovery question has been set.'}</p>
                <input 
                  type="text" 
                  placeholder="Your secret answer" 
                  value={recoveryAnswer} 
                  onChange={e => setRecoveryAnswer(e.target.value)} 
                  style={{/*...*/}}
                  disabled={!secretQuestion}
                />
                <Button type="submit" variant="save" disabled={!secretQuestion}>Reset Password</Button>
            </>
        ) : (
            <>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{/*...*/}} />
              <Button type="submit" variant="edit">Login</Button>
            </>
        )}
        
        {error && <p style={{color:'red', marginTop: '1rem'}}>{error}</p>}
        
        <button type="button" onClick={() => { setIsRecovery(!isRecovery); setError(''); }} style={{background:'none', border:'none', cursor:'pointer', color:'blue', marginTop:'1rem', display:'block', width: '100%'}}>
            {isRecovery ? 'Back to Login' : 'Forgot Password?'}
        </button>
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