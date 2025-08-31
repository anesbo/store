// src/lib/db.js
import Dexie from 'dexie';

export const db = new Dexie('clothingStoreDB');

db.version(14).stores({ // Increased version number
  products: '++id, name, category',
  sales: '++id, timestamp',
  expenses: '++id, date, status, supplierId',
  suppliers: '++id, &name',
  categories: '++id, &name',
  settings: 'key',

  // Archive tables
  sales_archive: '++id, timestamp',
  expenses_archive: '++id, date',
});