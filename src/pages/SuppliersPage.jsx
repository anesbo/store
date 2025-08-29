import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSuppliers } from '../hooks/useSuppliers';
import { useExpenses } from '../hooks/useExpenses';
import styles from './SuppliersPage.module.css';
import Button from '../components/ui/Button.jsx';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';

function SuppliersPage() {
  const { t } = useTranslation();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const { expenses, updateExpense, clearSupplierDebt } = useExpenses();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', phone: '' });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [expandedSupplierId, setExpandedSupplierId] = useState(null);

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
  
  const handleNewSupplierChange = (e) => {
    setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSupplier.name) {
      return alert("Supplier name cannot be empty.");
    }
    addSupplier(newSupplier);
    setNewSupplier({ name: '', contact: '', phone: '' });
  };
  
  const handleEditClick = (supplier) => {
    setEditingId(supplier.id);
    setEditFormData({ ...supplier });
  };
  
  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateClick = () => {
    updateSupplier(editFormData.id, editFormData);
    setEditingId(null);
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>{t('suppliers.title')}</h1>

      <div className={styles.card}>
        <h2 className={styles.formTitle}>{t('suppliers.add_new')}</h2>
        <form onSubmit={handleAddSubmit} className={styles.formGrid}>
          <input name="name" type="text" placeholder={t('common.supplier_name')} value={newSupplier.name} onChange={handleNewSupplierChange} className={styles.formInput} required />
          <input name="contact" type="text" placeholder={t('common.contact_person_optional')} value={newSupplier.contact} onChange={handleNewSupplierChange} className={styles.formInput} />
          <input name="phone" type="tel" placeholder={t('common.phone_number_optional')} value={newSupplier.phone} onChange={handleNewSupplierChange} className={styles.formInput} />
          <Button type="submit" variant="save"><FaPlus /> {t('suppliers.add_button')}</Button>
        </form>
      </div>

      <div className={styles.card}>
        <h2 className={styles.formTitle}>{t('suppliers.list_title')}</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('common.supplier_name')}</th>
                <th>{t('suppliers.current_debt')}</th>
                <th>{t('common.contact_person')}</th>
                <th>{t('common.phone_number')}</th>
                <th style={{ width: '320px' }}>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {suppliers?.map(supplier => {
                const debt = supplierDebts[supplier.id] || 0;
                const unpaidExpenses = unpaidExpensesBySupplier[supplier.id] || [];
                const isExpanded = expandedSupplierId === supplier.id;

                return ([
                  <tr key={supplier.id} className={editingId === supplier.id ? styles.editingRow : ''}>
                    {editingId === supplier.id ? (
                      <>
                        <td data-label={t('common.supplier_name')}><input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className={styles.formInput} /></td>
                        <td data-label={t('suppliers.current_debt')}>${debt.toFixed(2)}</td>
                        <td data-label={t('common.contact_person')}><input type="text" name="contact" value={editFormData.contact} onChange={handleEditFormChange} className={styles.formInput} /></td>
                        <td data-label={t('common.phone_number')}><input type="tel" name="phone" value={editFormData.phone} onChange={handleEditFormChange} className={styles.formInput} /></td>
                        <td data-label={t('common.actions')}>
                          <div className={styles.actionsCell}>
                            <Button variant="save" onClick={handleUpdateClick}><FaSave /> {t('common.save')}</Button>
                            <Button variant="cancel" onClick={() => setEditingId(null)}><FaTimes /> {t('common.cancel')}</Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td data-label={t('common.supplier_name')}>{supplier.name}</td>
                        <td data-label={t('suppliers.current_debt')} style={debt > 0 ? { color: 'red', fontWeight: 'bold' } : {}}>${debt.toFixed(2)}</td>
                        <td data-label={t('common.contact_person')}>{supplier.contact || '---'}</td>
                        <td data-label={t('common.phone_number')}>{supplier.phone || '---'}</td>
                        <td data-label={t('common.actions')}>
                      <div className={styles.actionsCell}>
                        {/* 3. Conditionally render button text */}
                        <Button variant="edit" onClick={() => handleToggleDetails(supplier.id)} disabled={debt === 0}>
                          {isExpanded ? <FaChevronUp/> : <FaChevronDown/>} {!isMobile && t('common.details')}
                        </Button>
                        <Button variant="save" onClick={() => clearSupplierDebt(supplier.id)} disabled={debt === 0}>
                          {!isMobile ? t('suppliers.clear_all_debt') : '✔️'}
                        </Button>
                        <Button variant="edit" onClick={() => handleEditClick(supplier)}>
                          <FaEdit /> {!isMobile && t('common.edit')}
                        </Button>
                        <Button variant="delete" onClick={() => deleteSupplier(supplier.id)}>
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                      </>
                    )}
                  </tr>,
                  isExpanded && (
                    <tr key={`${supplier.id}-details`} className={styles.detailsRow}>
                      <td colSpan="5">
                        <h4 className={styles.detailsTitle}>{t('suppliers.unpaid_expenses')}</h4>
                        {unpaidExpenses.length > 0 ? (
                            unpaidExpenses.map(expense => (
                                <div key={expense.id} className={styles.detailsItem}>
                                    <div>
                                    <span>{expense.description}</span>
                                    <small>{t('common.due')}: {new Date(expense.dueDate).toLocaleDateString()}</small>
                                    </div>
                                    <div className={styles.detailsActions}>
                                    <span>${expense.amount.toFixed(2)}</span>
                                    <Button variant="save" onClick={() => handleMarkAsPaid(expense.id)}>{t('suppliers.mark_as_paid')}</Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>{t('suppliers.no_unpaid_expenses')}</p>
                        )}
                      </td>
                    </tr>
                  )
                ]);
              })}
            </tbody>
          </table>
          {suppliers?.length === 0 && <p className={styles.emptyMessage}>{t('suppliers.no_suppliers_yet')}</p>}
        </div>
      </div>
    </div>
  );
}

export default SuppliersPage;