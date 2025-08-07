// src/lib/db.js

import Dexie from 'dexie';

export const db = new Dexie('clothingStoreDB');

// We are upgrading to version 2 to add the new categories table.
db.version(2).stores({
  products: '++id, name, category', 
  sales: '++id, timestamp',
  expenses: '++id, date',
  employees: '++id, name',
  categories: '++id, &name',
  settings: 'key',
});
db.version(3).stores({
  products: '++id, name, category', 
  sales: '++id, timestamp',
  // ADD dueDate and status indexes for fast searching
  expenses: '++id, date, dueDate, status', 
  employees: '++id, name',
  categories: '++id, &name',
});
// src/lib/db.js
// ... (previous versions)

db.version(4).stores({
  products: '++id, name, category', 
  sales: '++id, timestamp',
  expenses: '++id, date, dueDate, status', 
  employees: '++id, name',
  categories: '++id, &name',
  settings: 'key', // <-- ADD THIS TABLE (key will be 'staleDays', 'passwordHash', etc.)
});
// src/lib/db.js
// ... (previous versions)

db.version(5).stores({
  products: '++id, name, category', 
  sales: '++id, timestamp',
  // ADD supplierId index to expenses
  expenses: '++id, date, dueDate, status, supplierId', 
  employees: '++id, name',
  categories: '++id, &name',
  settings: 'key',
  // NEW: suppliers table
  suppliers: '++id, &name', 
});
// src/lib/db.js
// ... (previous versions)

db.version(6).stores({
  products: '++id, name, category', 
  sales: '++id, timestamp',
  expenses: '++id, date, dueDate, status, supplierId', 
  employees: '++id, name',
  categories: '++id, &name',
  settings: 'key',
  // ADD debtAmount to the suppliers table
  suppliers: '++id, &name, debtAmount', 
});
// src/lib/db.js
db.version(7).stores({
  // ... your existing tables
  products: '++id, name, category',
  sales: '++id, timestamp',
  expenses: '++id, date',

  // NEW: Archive tables
  sales_archive: '++id, timestamp',
  expenses_archive: '++id, date',
});