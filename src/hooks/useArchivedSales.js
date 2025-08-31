// src/hooks/useArchivedSales.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export function useArchivedSales() {
  const archivedSales = useLiveQuery(() => db.sales_archive.toArray(), []);
  return { archivedSales };
}