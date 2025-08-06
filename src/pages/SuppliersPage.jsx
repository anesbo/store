// src/pages/SuppliersPage.jsx
import React, { useState, useMemo } from 'react';
import { useSuppliers } from '../hooks/useSuppliers';
import { useExpenses } from '../hooks/useExpenses';
import styles from './SuppliersPage.module.css';
import Button from '../components/ui/Button.jsx';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';

function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const { expenses, updateExpense, clearSupplierDebt } = useExpenses();
  
  // State for the "Add Supplier" form (no debtAmount)
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', phone: '' });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [expandedSupplierId, setExpandedSupplierId] = useState(null);

  // Calculate total debt for each supplier from unpaid expenses
  const supplierDebts = useMemo(() => {
    if (!expenses) return {};
    const debts = {};
    expenses.forEach(expense => {
      if (expense.status === 'Unpaid' && expense.supplierId) {
        debts[expense.supplierId] = (debts[expense.supplierId] || 0) + expense.amount;
      }
    });
    return debts;
  }, [expenses]);

  // Group unpaid expenses by supplier for the details view
  const unpaidExpensesBySupplier = useMemo(() => {
    if (!expenses) return {};
    const grouped = {};
    expenses.forEach(expense => {
        if (expense.status === 'Unpaid' && expense.supplierId) {
            if (!grouped[expense.supplierId]) {
                grouped[expense.supplierId] = [];
            }
            grouped[expense.supplierId].push(expense);
        }
    });
    return grouped;
  }, [expenses]);
  
  const handleToggleDetails = (supplierId) => {
    setExpandedSupplierId(prevId => (prevId === supplierId ? null : supplierId));
  };

  const handleMarkAsPaid = (expenseId) => {
    updateExpense(expenseId, { status: 'Paid', date: new Date() });
  };
  
  const handleNewSupplierChange = (e) => setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value });
  
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSupplier.name) return alert("Supplier name cannot be empty.");
    addSupplier(newSupplier);
    setNewSupplier({ name: '', contact: '', phone: '' });
  };
  
  const handleEditClick = (supplier) => {
    setEditingId(supplier.id);
    setEditFormData({ ...supplier });
  };
  
  const handleEditFormChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const handleUpdateClick = () => {
    updateSupplier(editFormData.id, editFormData);
    setEditingId(null);
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Manage Suppliers</h1>

      <div className={styles.card}>
        <h2 className={styles.formTitle}>Add New Supplier</h2>
        <form onSubmit={handleAddSubmit} className={styles.formGrid}>
          <input name="name" type="text" placeholder="Supplier Name" value={newSupplier.name} onChange={handleNewSupplierChange} className={styles.formInput} required />
          <input name="contact" type="text" placeholder="Contact Person (Optional)" value={newSupplier.contact} onChange={handleNewSupplierChange} className={styles.formInput} />
          <input name="phone" type="tel" placeholder="Phone Number (Optional)" value={newSupplier.phone} onChange={handleNewSupplierChange} className={styles.formInput} />
          <Button type="submit" variant="save"><FaPlus /> Add Supplier</Button>
        </form>
      </div>

      <div className={styles.card}>
        <h2 className={styles.formTitle}>Supplier List</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Current Debt</th>
                <th>Contact Person</th>
                <th style={{ width: '250px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers?.map(supplier => {
                const debt = supplierDebts[supplier.id] || 0;
                const unpaidExpenses = unpaidExpensesBySupplier[supplier.id] || [];
                const isExpanded = expandedSupplierId === supplier.id;

                return ([
                  <tr key={supplier.id}>
                    {editingId === supplier.id ? (
                      <>
                        <td><input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className={styles.formInput} /></td>
                        <td>${debt.toFixed(2)}</td>
                        <td><input type="text" name="contact" value={editFormData.contact} onChange={handleEditFormChange} className={styles.formInput} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button variant="save" onClick={handleUpdateClick}><FaSave /></Button>
                            <Button variant="cancel" onClick={() => setEditingId(null)}><FaTimes /></Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{supplier.name}</td>
                        <td style={debt > 0 ? { color: 'red', fontWeight: 'bold' } : {}}>${debt.toFixed(2)}</td>
                        <td>{supplier.contact || '---'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button variant="edit" onClick={() => handleToggleDetails(supplier.id)} disabled={debt === 0}>
                              {isExpanded ? <FaChevronUp/> : <FaChevronDown/>} Details
                            </Button>
                            <Button variant="save" onClick={() => clearSupplierDebt(supplier.id)} disabled={debt === 0}>Clear All</Button>
                            <Button variant="delete" onClick={() => deleteSupplier(supplier.id)}><FaTrash /></Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>,
                  isExpanded && (
                    <tr key={`${supplier.id}-details`} className={styles.detailsRow}>
                      <td colSpan="4">
                        <h4 className={styles.detailsTitle}>Unpaid Expenses</h4>
                        {unpaidExpenses.map(expense => (
                          <div key={expense.id} className={styles.detailsItem}>
                            <div>
                              <span>{expense.description}</span>
                              <small>Due: {new Date(expense.dueDate).toLocaleDateString()}</small>
                            </div>
                            <div className={styles.detailsActions}>
                              <span>${expense.amount.toFixed(2)}</span>
                              <Button variant="save" onClick={() => handleMarkAsPaid(expense.id)}>Mark as Paid</Button>
                            </div>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )
                ]);
              })}
            </tbody>
          </table>
          {suppliers?.length === 0 && <p className={styles.emptyMessage}>No suppliers added yet.</p>}
        </div>
      </div>
    </div>
  );
}

export default SuppliersPage;