// src/hooks/useSettings.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import toast from 'react-hot-toast';

// Helper function to hash a password
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hook for a single, reactive setting value
export function useSetting(key, defaultValue) {
  const setting = useLiveQuery(() => db.settings.get(key), [key]);
  return setting ? setting.value : defaultValue;
}

// Main hook for settings actions
export function useSettings() {
  const settings = useLiveQuery(() => db.settings.toArray(), []);

  const updateSetting = async (key, value) => {
    try {
      await db.settings.put({ key, value });
      toast.success('Setting saved!');
    } catch (error) {
      toast.error('Failed to save setting.');
    }
  };

  const setPassword = async (newPassword) => {
    if (newPassword.length < 4) {
      return toast.error("Password must be at least 4 characters long.");
    }
    const passwordHash = await hashPassword(newPassword);
    await updateSetting('passwordHash', passwordHash);
  };
  
  const archiveOldData = async () => {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
    if (!window.confirm("This will move all sales and expenses older than one year to an archive. This cannot be undone. Continue?")) {
        return;
    }
    toast.promise(
      db.transaction('rw', db.sales, db.sales_archive, db.expenses, db.expenses_archive, async () => {
        const oldSales = await db.sales.where('timestamp').below(cutoffDate).toArray();
        if (oldSales.length > 0) {
          await db.sales_archive.bulkAdd(oldSales);
          await db.sales.where('timestamp').below(cutoffDate).delete();
        }
        const oldExpenses = await db.expenses.where('date').below(cutoffDate).toArray();
        if (oldExpenses.length > 0) {
            await db.expenses_archive.bulkAdd(oldExpenses);
            await db.expenses.where('date').below(cutoffDate).delete();
        }
      }), { loading: 'Archiving old records...', success: 'Archiving complete!', error: 'Archiving failed.' }
    );
  };

  const runAutoBackup = async ({ force = false } = {}) => {
    const settingsArray = await db.settings.toArray();
    const lastBackupSetting = settingsArray.find(s => s.key === 'lastBackupTime');
    const lastBackupTime = lastBackupSetting ? new Date(lastBackupSetting.value) : null;
    const now = new Date();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (force || !lastBackupTime || (now - lastBackupTime > twentyFourHours)) {
      const toastId = toast.loading('Starting backup to Supabase...');
      try {
        const allData = {
          products: await db.products.toArray(),
          categories: await db.categories.toArray(),
          sales: await db.sales.toArray(),
          expenses: await db.expenses.toArray(),
          suppliers: await db.suppliers.toArray(),
        };
        const backupFile = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const nowForFilename = new Date();
        const timestamp = `${nowForFilename.getFullYear()}-${String(nowForFilename.getMonth() + 1).padStart(2, '0')}-${String(nowForFilename.getDate()).padStart(2, '0')}_${String(nowForFilename.getHours()).padStart(2, '0')}-${String(nowForFilename.getMinutes()).padStart(2, '0')}-${String(nowForFilename.getSeconds()).padStart(2, '0')}`;
        const fileName = `anes-store-backup-${timestamp}.json`;
        const SUPABASE_URL = 'https://sbkzctzbwifuzudfnshh.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNia3pjdHpid2lmdXp1ZGZuc2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzIzNDYsImV4cCI6MjA3MDE0ODM0Nn0.98UzaQKW59u_d2Z9H1BYluofjWBxVWBCY4pq5G7Hvek';
        const response = await fetch(`${SUPABASE_URL}/storage/v1/object/backups/${fileName}`, {
          method: 'POST',
          body: backupFile,
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Backup failed to upload.');
        }
        await db.settings.put({ key: 'lastBackupTime', value: now.toISOString() });
        toast.success('Backup completed!', { id: toastId });
      } catch (error) {
        console.error("Backup failed:", error);
        toast.error(`Backup failed: ${error.message}`, { id: toastId });
      }
    } else {
      console.log("No need to backup yet. Last backup was recent.");
      if (force) {
          toast.success('No backup needed, already backed up within 24 hours.');
      }
    }
  };

  // MOVED: These functions are now at the correct level
  const setRecoveryInfo = async (question, answer) => {
    if (!question || !answer) {
      return toast.error("Question and answer cannot be empty.");
    }
    const answerHash = await hashPassword(answer.toLowerCase().trim());
    await db.settings.put({ key: 'secretQuestion', value: question });
    await db.settings.put({ key: 'secretAnswerHash', value: answerHash });
    toast.success('Recovery information saved!');
  };

  const resetPasswordWithRecovery = async (answer) => {
    const storedHash = settings?.find(s => s.key === 'secretAnswerHash')?.value;
    if (!storedHash) return false;
    const enteredAnswerHash = await hashPassword(answer.toLowerCase().trim());
    if (enteredAnswerHash === storedHash) {
      await db.settings.delete('passwordHash');
      return true;
    }
    return false;
  };

  // This is now the single, correct return statement
  return { 
    settings, 
    updateSetting, 
    setPassword, 
    hashPassword, 
    archiveOldData, 
    runAutoBackup,
    setRecoveryInfo,
    resetPasswordWithRecovery
  };
}