// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings, useSetting } from '../hooks/useSettings';
import { db } from '../lib/db';
import styles from './SettingsPage.module.css';
import Button from '../components/ui/Button.jsx';
import toast from 'react-hot-toast';

function SettingsPage() {
  // --- Hooks ---
  const { t, i18n } = useTranslation();
  const { updateSetting, setPassword, archiveOldData, runAutoBackup, setRecoveryInfo } = useSettings();
  const staleDaysSetting = useSetting('staleDays', 20);
  const secretQuestion = useSetting('secretQuestion', '');
  
  // --- State ---
  const [staleDays, setStaleDays] = useState(20);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [exportFileName, setExportFileName] = useState(`store-backup-${new Date().toISOString().split('T')[0]}`);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');

  // --- Effects ---
  useEffect(() => {
    setCurrentQuestion(secretQuestion);
  }, [secretQuestion]);

  useEffect(() => {
    setStaleDays(staleDaysSetting);
  }, [staleDaysSetting]);

  // --- Handlers ---
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleSetRecovery = () => {
    setRecoveryInfo(currentQuestion, recoveryAnswer);
    setRecoveryAnswer('');
  };

  const handleSaveStaleDays = () => {
    updateSetting('staleDays', parseInt(staleDays, 10));
  };
  
  const handleSetPassword = () => {
    if (newPassword !== confirmPassword) {
      return toast.error(t('toasts.passwords_no_match'));
    }
    setPassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleExport = async () => {
    const allData = {
      products: await db.products.toArray(),
      categories: await db.categories.toArray(),
      sales: await db.sales.toArray(),
      expenses: await db.expenses.toArray(),
      suppliers: await db.suppliers.toArray(),
      settings: await db.settings.toArray(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(allData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${exportFileName}.json`;
    link.click();
    toast.success(t('toasts.export_success'));
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!window.confirm(t('settings.warning_overwrite'))) {
      event.target.value = ''; 
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const expectedTables = ['products', 'categories', 'sales', 'expenses', 'settings', 'suppliers'];
        const tablesToImport = expectedTables.filter(t => db[t] && data[t]);
        await db.transaction('rw', tablesToImport, async () => {
          await Promise.all(tablesToImport.map(key => db[key].clear()));
          await Promise.all(tablesToImport.map(key => db[key].bulkAdd(data[key])));
        });
        toast.success(t('toasts.import_success'));
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        toast.error("Failed to import file. It may be corrupted.");
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>{t('settings.title')}</h1>
      
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{t('settings.general')}</h2>
        <div className={styles.settingItem}>
          <label htmlFor="staleDays" className={styles.label}>{t('settings.stale_duration')}</label>
          <input id="staleDays" type="number" value={staleDays} onChange={e => setStaleDays(e.target.value)} className={styles.input} />
        </div>
        <Button onClick={handleSaveStaleDays} variant="save">{t('settings.save_changes')}</Button>
      </div>
      
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{t('settings.language')}</h2>
        <div className={styles.settingItem}>
            <label className={styles.label}>{t('settings.select_language')}</label>
            <select className={styles.input} onChange={(e) => changeLanguage(e.target.value)} value={i18n.language}>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
            </select>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{t('settings.data_management')}</h2>
        <div className={styles.dataActions}>
          <div className={styles.settingItem}>
            <label htmlFor="exportFile" className={styles.label}>{t('settings.export_filename')}</label>
            <input id="exportFile" type="text" value={exportFileName} onChange={e => setExportFileName(e.target.value)} className={styles.input} />
          </div>
          <Button onClick={handleExport} variant="edit">{t('settings.export_button')}</Button>
          <div style={{marginTop: '1rem'}}>
            <label htmlFor="importFile" className={styles.label}>{t('settings.import_button')}</label>
            <p className={styles.warning}>{t('settings.warning_overwrite')}</p>
            <input id="importFile" type="file" accept=".json" onChange={handleImport} />
          </div>
          <div style={{marginTop: '1rem'}}>
            <label className={styles.label}>{t('settings.auto_backup')}</label>
            <p>{t('settings.auto_backup_desc')}</p>
            <Button onClick={() => runAutoBackup({ force: true })} variant="edit">{t('settings.run_backup_now')}</Button>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{t('settings.security')}</h2>
        <div className={styles.settingItem}>
          <label className={styles.label}>{t('settings.set_password')}</label>
          <input type="password" placeholder={t('settings.new_password')} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.settingItem}>
          <input type="password" placeholder={t('settings.confirm_password')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={styles.input} />
        </div>
        <Button onClick={handleSetPassword} variant="save">{t('settings.set_password_button')}</Button>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{t('settings.recovery_title')}</h2>
        <div className={styles.settingItem}>
          <label className={styles.label}>{t('settings.secret_question')}</label>
          <input 
            type="text" 
            placeholder={t('settings.secret_question_placeholder')}
            value={currentQuestion} 
            onChange={e => setCurrentQuestion(e.target.value)} 
            className={styles.input} 
          />
        </div>
        <div className={styles.settingItem}>
          <label className={styles.label}>{t('settings.secret_answer')}</label>
          <input 
            type="text" 
            placeholder={t('settings.secret_answer_placeholder')}
            value={recoveryAnswer} 
            onChange={e => setRecoveryAnswer(e.target.value)} 
            className={styles.input} 
          />
        </div>
        <Button onClick={handleSetRecovery} variant="save">{t('settings.save_recovery_info')}</Button>
      </div>
      
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{t('settings.archive_data')}</h2>
        <div className={styles.settingItem}>
          <p className={styles.label}>{t('settings.archive_desc')}</p>
          <Button onClick={archiveOldData} variant="delete">{t('settings.archive_button_text')}</Button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;