// src/pages/ExpensesPage.jsx
import React, { useState, useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses.js';
import { useSuppliers } from '../hooks/useSuppliers.js';
import styles from './ExpensesPage.module.css';
import Button from '../components/ui/Button.jsx';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

const EXPENSE_TYPES = ['Salary', 'Rent', 'Utilities', 'Marketing', 'Supplies', 'Other'];

function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { suppliers } = useSuppliers();
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: '', dueDate: '', type: 'Other', supplierId: '', status: 'Paid' });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const handleNewExpenseChange = (e) => {
    setNewExpense({ ...newExpense, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.date) {
      return alert('Please fill out description, amount, and date.');
    }
    if (newExpense.status === 'Unpaid' && !newExpense.dueDate) {
        return alert('Please provide a due date for unpaid expenses.');
    }
    addExpense({ 
      ...newExpense, 
      amount: parseFloat(newExpense.amount),
      supplierId: newExpense.supplierId ? parseInt(newExpense.supplierId, 10) : null,
    });
    setNewExpense({ description: '', amount: '', date: '', dueDate: '', type: 'Other', supplierId: '', status: 'Paid' });
  };

  const handleEditClick = (expense) => {
    setEditingId(expense.id);
    const dateForInput = (fieldName) => expense[fieldName] ? new Date(expense[fieldName]).toISOString().split('T')[0] : '';
    setEditFormData({ ...expense, date: dateForInput('date'), dueDate: dateForInput('dueDate') });
  };
  
  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateClick = () => {
    const { id, description, amount, date, dueDate, type, supplierId, status } = editFormData;
    if (!description || !amount || !date) return alert('Fields cannot be empty.');
    if (status === 'Unpaid' && !dueDate) return alert('Please provide a due date for unpaid expenses.');
    
    updateExpense(id, { description, amount: parseFloat(amount), date, dueDate, type, supplierId: supplierId ? parseInt(supplierId, 10) : null, status });
    setEditingId(null);
  };
  
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Manage Expenses</h1>

      <div className={styles.card}>
        <h2 className={styles.formTitle}>Add New Expense</h2>
        <form onSubmit={handleAddSubmit} className={styles.formGrid}>
          <input name="description" type="text" placeholder="Description" value={newExpense.description} onChange={handleNewExpenseChange} className={styles.formInput} required />
          <input name="amount" type="number" placeholder="Amount ($)" value={newExpense.amount} onChange={handleNewExpenseChange} className={styles.formInput} required step="0.01"/>
          <select name="type" value={newExpense.type} onChange={handleNewExpenseChange} className={styles.formInput}>
            {EXPENSE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <select name="supplierId" value={newExpense.supplierId} onChange={handleNewExpenseChange} className={styles.formInput}>
            <option value="">-- No Supplier --</option>
            {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input name="date" type="date" title="Payment Date" value={newExpense.date} onChange={handleNewExpenseChange} className={styles.formInput} required />
          <input name="dueDate" type="date" title="Due Date" value={newExpense.dueDate} onChange={handleNewExpenseChange} className={styles.formInput} />
          <select name="status" value={newExpense.status} onChange={handleNewExpenseChange} className={styles.formInput}>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid (Creates Debt)</option>
          </select>
          <Button type="submit" variant="save"><FaPlus /> Add Expense</Button>
        </form>
      </div>

      <div className={styles.card}>
        <h2 className={styles.formTitle}>Expense History</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses?.map(expense => (
                <tr key={expense.id}>
                  {editingId === expense.id ? (
                    <>
                      <td><input type="date" name="date" value={editFormData.date} onChange={handleEditFormChange} className={styles.formInput} /></td>
                      <td><input type="text" name="description" value={editFormData.description} onChange={handleEditFormChange} className={styles.formInput} /></td>
                      <td>
                        <select name="type" value={editFormData.type} onChange={handleEditFormChange} className={styles.formInput}>
                          {EXPENSE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </td>
                       <td>
                        <select name="status" value={editFormData.status} onChange={handleEditFormChange} className={styles.formInput}>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>
                      </td>
                      <td><input type="number" name="amount" value={editFormData.amount} onChange={handleEditFormChange} className={styles.formInput} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8' }}>
                          <Button variant="save" onClick={handleUpdateClick}><FaSave /></Button>
                          <Button variant="cancel" onClick={() => setEditingId(null)}><FaTimes /></Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                      <td>{expense.description}</td>
                      <td>{expense.type}</td>
                      <td style={{fontWeight: 'bold', color: expense.status === 'Unpaid' ? 'red' : 'green'}}>{expense.status}</td>
                      <td>${expense.amount.toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8' }}>
                          <Button variant="edit" onClick={() => handleEditClick(expense)}><FaEdit /></Button>
                          <Button variant="delete" onClick={() => deleteExpense(expense.id)}><FaTrash /></Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {expenses?.length === 0 && <p className={styles.emptyMessage}>No expenses recorded yet.</p>}
        </div>
      </div>
    </div>
  );
}

export default ExpensesPage;