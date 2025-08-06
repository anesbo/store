// src/hooks/useExpenses.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import toast from 'react-hot-toast';

export function useExpenses() {
  const expenses = useLiveQuery(() => db.expenses.orderBy('date').reverse().toArray(), []);

  const addExpense = async (expenseData) => {
    try {
      await db.expenses.add({
        ...expenseData,
        date: new Date(expenseData.date),
      });
      toast.success('Expense added successfully!');
    } catch (error) {
      console.error("Failed to add expense:", error);
      toast.error('Failed to add expense.');
    }
  };

  const updateExpense = async (id, updates) => {
    try {
      await db.expenses.update(id, {
        ...updates,
        date: new Date(updates.date),
      });
      toast.success('Expense updated!');
    } catch (error) {
      console.error("Failed to update expense:", error);
      toast.error('Failed to update expense.');
    }
  };

  const deleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await db.expenses.delete(id);
        toast.success('Expense deleted.');
      } catch (error) {
        console.error("Failed to delete expense:", error);
        toast.error('Failed to delete expense.');
      }
    }
  };

  // This function was merged from the duplicate block
  const clearSupplierDebt = async (supplierId) => {
    if (!window.confirm("Are you sure you want to mark all unpaid expenses for this supplier as 'Paid'?")) {
      return;
    }
    try {
      await db.expenses
        .where({ supplierId: supplierId, status: 'Unpaid' })
        .modify({ status: 'Paid', date: new Date() }); // Set the payment date to today
      toast.success("Supplier's debt cleared!");
    } catch (error) {
      toast.error("Failed to clear debt.");
    }
  };

  // The return statement now includes all functions
  return { expenses, addExpense, updateExpense, deleteExpense, clearSupplierDebt };
}