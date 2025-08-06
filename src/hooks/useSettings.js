// src/hooks/useSettings.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import toast from 'react-hot-toast';

// This helper function is correct and does not need changes.
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * This is now the ONLY way to get a single, reactive setting value.
 * It's efficient and guaranteed to update when the database changes.
 */
export function useSetting(key, defaultValue) {
  const setting = useLiveQuery(
    () => db.settings.get(key),
    [key] // Dependency array: re-run query if the key changes
  );
  return setting ? setting.value : defaultValue;
}

/**
 * This hook is now for ACTIONS (updating, setting password) 
 * and for getting the WHOLE list of settings if needed elsewhere.
 */
export function useSettings() {
  const settings = useLiveQuery(() => db.settings.toArray(), []);

  // REMOVED: The old getSetting function. This prevents confusion and reactivity bugs.

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
  
  return { settings, updateSetting, setPassword, hashPassword };
}