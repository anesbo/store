// src/hooks/useArchivedExpenses.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export function useArchivedExpenses() {
  const archivedExpenses = useLiveQuery(() => db.expenses_archive.toArray(), []);
  return { archivedExpenses };
}