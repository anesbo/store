// src/hooks/useSuppliers.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import toast from 'react-hot-toast';

export function useSuppliers() {
  const suppliers = useLiveQuery(() => db.suppliers.orderBy('name').toArray(), []);

  const addSupplier = async (supplierData) => {
    try {
      await db.suppliers.add(supplierData);
      toast.success('Supplier added!');
    } catch (error) {
      console.error("Failed to add supplier:", error);
      // This toast will appear if the name already exists
      toast.error('Failed to add supplier. The name may already exist.');
    }
  };

  const updateSupplier = async (id, updates) => {
    try {
      await db.suppliers.update(id, updates);
      toast.success('Supplier updated!');
    } catch (error) {
      toast.error('Failed to update supplier.');
    }
  };

  const deleteSupplier = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await db.suppliers.delete(id);
        toast.success('Supplier deleted.');
      } catch (error) {
        toast.error('Failed to delete supplier.');
      }
    }
  };

  return { suppliers, addSupplier, updateSupplier, deleteSupplier };
}