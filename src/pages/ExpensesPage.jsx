// src/pages/ExpensesPage.jsx
import React, { useState, useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses.js';
import { useSuppliers } from '../hooks/useSuppliers.js';
import styles from './ExpensesPage.module.css';
import Button from '../components/ui/Button.jsx';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

const EXPENSE_TYPES = ['Salary', 'Rent', 'Utilities', 'Marketing', 'Supplies', 'Other'];

function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { suppliers } = useSuppliers();
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: '', dueDate: '', type: 'Other', supplierId: '', status: 'Paid' });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const { t } = useTranslation();
  const expenseTypes = t('expense_types', { returnObjects: true });

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
      <h1 className={styles.title}>{t('expenses.title')}</h1>

      <div className={styles.card}>
        <h2 className={styles.formTitle}>{t('expenses.add_new')}</h2>
        <form onSubmit={handleAddSubmit} className={styles.formGrid}>
          <input name="description" type="text" placeholder={t('common.description')} value={newExpense.description} onChange={handleNewExpenseChange} className={styles.formInput} required />
          <input name="amount" type="number" placeholder={t('common.amount')} value={newExpense.amount} onChange={handleNewExpenseChange} className={styles.formInput} required step="0.01"/>
          <select name="type" value={newExpense.type} onChange={handleNewExpenseChange} className={styles.formInput}>
            {Object.entries(expenseTypes).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
          </select>
          <select name="supplierId" value={newExpense.supplierId} onChange={handleNewExpenseChange} className={styles.formInput}>
            <option value="">{t('expenses.no_supplier')}</option>
            {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input name="date" type="date" title={t('expenses.payment_date')} value={newExpense.date} onChange={handleNewExpenseChange} className={styles.formInput} required />
          <input name="dueDate" type="date" title={t('common.due_date')} value={newExpense.dueDate} onChange={handleNewExpenseChange} className={styles.formInput} />
          <select name="status" value={newExpense.status} onChange={handleNewExpenseChange} className={styles.formInput}>
            <option value="Paid">{t('expenses.status_paid')}</option>
            <option value="Unpaid">{t('expenses.status_unpaid')}</option>
          </select>
          <Button type="submit" variant="save"><FaPlus /> {t('expenses.add_button')}</Button>
        </form>
      </div>

      <div className={styles.card}>
        <h2 className={styles.formTitle}>{t('expenses.history')}</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('common.date')}</th>
                <th>{t('common.description')}</th>
                <th>{t('common.type')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.amount')}</th>
                <th style={{ width: '150px' }}>{t('common.actions')}</th>
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
                          {Object.entries(expenseTypes).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                        </select>
                      </td>
                       <td>
                        <select name="status" value={editFormData.status} onChange={handleEditFormChange} className={styles.formInput}>
                            <option value="Paid">{t('expenses.status_paid')}</option>
                            <option value="Unpaid">{t('expenses.status_unpaid_short')}</option>
                        </select>
                      </td>
                      <td><input type="number" name="amount" value={editFormData.amount} onChange={handleEditFormChange} className={styles.formInput} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button variant="save" onClick={handleUpdateClick}><FaSave /></Button>
                          <Button variant="cancel" onClick={() => setEditingId(null)}><FaTimes /></Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                    <td data-label={t('common.date')}>{new Date(expense.date).toLocaleDateString()}</td>
                    <td data-label={t('common.description')}>{expense.description}</td>
                    <td data-label={t('common.type')}>{t(`expense_types.${expense.type}`, expense.type)}</td>
                    <td data-label={t('common.status')} style={{fontWeight: 'bold', color: expense.status === 'Unpaid' ? 'red' : 'green'}}>
                      {t(`expenses.status_${expense.status.toLowerCase()}`)}
                    </td>
                    <td data-label={t('common.amount')}>${expense.amount.toFixed(2)}</td>
                    <td data-label={t('common.actions')}>
                      <div style={{ display: 'flex', gap: '8px' }}>
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
          {expenses?.length === 0 && <p className={styles.emptyMessage}>{t('expenses.no_expenses_yet')}</p>}
        </div>
      </div>
    </div>
  );
}

export default ExpensesPage;