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
    // ... (your existing archive logic)
  };

  // The new auto-backup function, placed inside the hook
  const runAutoBackup = async () => {
    const settingsArray = await db.settings.toArray();
    const lastBackupSetting = settingsArray.find(s => s.key === 'lastBackupTime');
    const lastBackupTime = lastBackupSetting ? new Date(lastBackupSetting.value) : null;
    
    const now = new Date();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (!lastBackupTime || (now - lastBackupTime > twentyFourHours)) {
      console.log("Starting automatic backup to Supabase Storage...");
      
      try {
        const allData = {
          products: await db.products.toArray(),
          categories: await db.categories.toArray(),
          sales: await db.sales.toArray(),
          expenses: await db.expenses.toArray(),
          suppliers: await db.suppliers.toArray(),
        };

        const backupFile = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const fileName = `anes store-${new Date().toISOString().split('T')[0]}.json`;

        const SUPABASE_URL = 'https://sbkzctzbwifuzudfnshh.supabase.co'; // <-- PASTE YOUR URL HERE
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNia3pjdHpid2lmdXp1ZGZuc2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzIzNDYsImV4cCI6MjA3MDE0ODM0Nn0.98UzaQKW59u_d2Z9H1BYluofjWBxVWBCY4pq5G7Hvek';   // <-- PASTE YOUR KEY HERE
        
        const response = await fetch(`${SUPABASE_URL}/storage/v1/object/backups/${fileName}`, {
          method: 'POST',
          body: backupFile,
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) throw new Error('Backup failed to upload.');

        await db.settings.put({ key: 'lastBackupTime', value: now.toISOString() });
        toast.success('Automatic backup completed!');

      } catch (error) {
        console.error("Auto-backup failed:", error);
        toast.error('Automatic backup failed.');
      }
    } else {
      console.log("No need to backup yet. Last backup was recent.");
    }
  };

  // Add the new function to the return object
  return { settings, updateSetting, setPassword, hashPassword, archiveOldData, runAutoBackup };
}