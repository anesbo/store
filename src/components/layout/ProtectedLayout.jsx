// src/components/layout/ProtectedLayout.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSettings, useSetting } from '../../hooks/useSettings';
import { Outlet } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import toast from 'react-hot-toast';
import styles from './ProtectedLayout.module.css'; // 1. Import the stylesheet

function LoginScreen() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  
  const [isRecovery, setIsRecovery] = useState(false);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const { resetPasswordWithRecovery } = useSettings();
  const secretQuestion = useSetting('secretQuestion', '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRecovery) {
        const success = await resetPasswordWithRecovery(recoveryAnswer);
        if (success) {
            toast.success('Password reset! The page will now reload.');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            setError(t('login.incorrect_answer'));
        }
    } else {
        const success = await login(password);
        if (!success) {
            setError(t('login.incorrect_password'));
        }
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>
            {isRecovery ? t('settings.recovery_title') : t('login.enter_password')}
        </h2>

        {isRecovery ? (
            <>
                <p className={styles.questionText}>{secretQuestion || t('login.no_recovery_question')}</p>
                <input 
                  type="text" 
                  placeholder={t('login.secret_answer_placeholder')}
                  value={recoveryAnswer} 
                  onChange={e => setRecoveryAnswer(e.target.value)} 
                  className={styles.input}
                  disabled={!secretQuestion}
                />
                <Button type="submit" variant="save" disabled={!secretQuestion}>{t('login.reset_password')}</Button>
            </>
        ) : (
            <>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className={styles.input} 
              />
              <Button type="submit" variant="edit">{t('login.login_button')}</Button>
            </>
        )}
        
        {error && <p className={styles.errorText}>{error}</p>}
        
        <button type="button" onClick={() => { setIsRecovery(!isRecovery); setError(''); }} className={styles.toggleButton}>
            {isRecovery ? t('login.back_to_login') : t('login.forgot_password')}
        </button>
      </form>
    </div>
  );
}

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();
  
  const passwordIsSet = settings?.some(s => s.key === 'passwordHash');

  if (settings === undefined) {
    return <div>Loading...</div>;
  }

  if (!passwordIsSet || isAuthenticated) {
    return <Outlet />;
  }

  return <LoginScreen />;
}