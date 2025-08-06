// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
// 1. IMPORT both hooks: useSettings for actions, useSetting for reactive values
import { useSettings, useSetting } from '../hooks/useSettings';
import { db } from '../lib/db';
import styles from './SettingsPage.module.css';
import Button from '../components/ui/Button.jsx';

function SettingsPage() {
  // Use the 'action' hook for saving data
  const { updateSetting, setPassword } = useSettings();
  // 2. Use the new, reactive hook to GET the live value from the database
  const staleDaysSetting = useSetting('staleDays', 20);
  
  // Local state for the form inputs
  const [staleDays, setStaleDays] = useState(20);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 3. This useEffect now syncs the local form state with the reactive value from the DB
  useEffect(() => {
    setStaleDays(staleDaysSetting);
  }, [staleDaysSetting]);

  const handleSaveStaleDays = () => {
    updateSetting('staleDays', parseInt(staleDays, 10));
  };
  
  const handleSetPassword = () => {
    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match.");
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
      settings: await db.settings.toArray(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(allData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `store-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!window.confirm("WARNING: Importing a file will overwrite ALL existing data. Are you sure?")) {
      event.target.value = ''; // Reset the file input
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        await db.transaction('rw', db.products, db.categories, db.sales, db.expenses, db.settings, async () => {
          await Promise.all(Object.keys(data).map(key => db[key]?.clear()));
          await Promise.all(Object.keys(data).map(key => db[key]?.bulkAdd(data[key])));
        });
        alert("Data imported successfully! The page will now reload.");
        window.location.reload();
      } catch (error) {
        alert("Failed to import file. It may be corrupted.");
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input after selection
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Settings</h1>
      
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>General</h2>
        <div className={styles.settingItem}>
          <label htmlFor="staleDays" className={styles.label}>Stale Product Duration (days)</label>
          <input id="staleDays" type="number" value={staleDays} onChange={e => setStaleDays(e.target.value)} className={styles.input} />
        </div>
        <Button onClick={handleSaveStaleDays} variant="save">Save Changes</Button>
      </div>
      
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Data Management</h2>
        <div className={styles.dataActions}>
          <Button onClick={handleExport} variant="edit">Export Data to JSON</Button>
          <div>
            <label htmlFor="importFile" className={styles.label}>Import Data from JSON</label>
            <p className={styles.warning}>Warning: This will overwrite ALL existing data.</p>
            <input id="importFile" type="file" accept=".json" onChange={handleImport} />
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Security</h2>
        <div className={styles.settingItem}>
          <label className={styles.label}>Set or Change Password</label>
          <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.settingItem}>
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={styles.input} />
        </div>
        <Button onClick={handleSetPassword} variant="save">Set Password</Button>
      </div>
    </div>
  );
}

export default SettingsPage;