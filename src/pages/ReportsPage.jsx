// src/pages/ReportsPage.jsx
import React, { useState, useMemo } from 'react';
import { useSales } from '../hooks/useSales';
import { useTranslation } from 'react-i18next';
import { useExpenses } from '../hooks/useExpenses';
import { useSuppliers } from '../hooks/useSuppliers';
import styles from './ReportsPage.module.css';
import Button from '../components/ui/Button.jsx';

// Placeholder for a future setting
const UPCOMING_EXPENSE_DAYS = 3;

function ReportsPage() {
  const { t } = useTranslation();
  const { sales } = useSales();
  const { expenses } = useExpenses();
  const { suppliers } = useSuppliers();
  
  const [reportType, setReportType] = useState('profit_loss');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const reportData = useMemo(() => {
    if (!sales || !expenses || !suppliers) return null;

    // --- Date Filtering ---
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if(start) start.setHours(0, 0, 0, 0);
    if(end) end.setHours(23, 59, 59, 999);

    const filteredSales = sales.filter(s => {
      const saleDate = new Date(s.timestamp);
      return (!start || saleDate >= start) && (!end || saleDate <= end);
    });
    const filteredExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return e.status === 'Paid' && (!start || expenseDate >= start) && (!end || expenseDate <= end);
    });

    // --- Report Calculations ---
    let totalRevenue = 0, totalCOGS = 0, totalExpenses = 0;
    const salesByCategory = {};

    filteredSales.forEach(sale => {
      totalRevenue += sale.totalAmount;
      sale.items.forEach(item => {
        totalCOGS += (item.purchasePrice || 0) * item.quantity;
        salesByCategory[item.category] = (salesByCategory[item.category] || 0) + item.sellingPrice * item.quantity;
      });
    });
    
    filteredExpenses.forEach(expense => {
      totalExpenses += expense.amount;
    });

    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;
    
    // --- Upcoming Expense Alert Calculation ---
    const upcomingThreshold = new Date();
    upcomingThreshold.setDate(upcomingThreshold.getDate() + UPCOMING_EXPENSE_DAYS);
    const now = new Date();
    
    const upcomingExpenses = expenses.filter(e => {
        const dueDate = new Date(e.dueDate);
        return e.status === 'Upcoming' && dueDate >= now && dueDate <= upcomingThreshold;
    });

    // --- Supplier Debt Calculation ---
    const supplierDebts = {};
    expenses.forEach(expense => {
      if (expense.status === 'Unpaid' && expense.supplierId) {
        supplierDebts[expense.supplierId] = (supplierDebts[expense.supplierId] || 0) + expense.amount;
      }
    });
    const supplierDebtList = suppliers
      .map(s => ({ id: s.id, name: s.name, debt: supplierDebts[s.id] || 0 }))
      .filter(s => s.debt > 0)
      .sort((a, b) => b.debt - a.debt);
    const totalDebt = supplierDebtList.reduce((sum, s) => sum + s.debt, 0);

    return { totalRevenue, totalCOGS, totalExpenses, grossProfit, netProfit, salesByCategory, upcomingExpenses, supplierDebtList, totalDebt };
  }, [sales, expenses, suppliers, startDate, endDate]);

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>{t('reports.title')}</h1>

      <div className={styles.card}>
        <h2 className={styles.formTitle}>{t('reports.controls_title')}</h2>
        <div className={styles.controls}>
          <select value={reportType} onChange={e => setReportType(e.target.value)} className={styles.formInput}>
            <option value="profit_loss">{t('reports.profit_loss')}</option>
            <option value="sales_by_category">{t('reports.sales_by_category')}</option>
            <option value="supplier_debt">{t('reports.supplier_debt_report')}</option>
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={styles.formInput} />
          <span>{t('common.to')}</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={styles.formInput} />
        </div>
      </div>

      {reportData && (
        <div className={styles.reportDisplay}>
            {reportData.upcomingExpenses.length > 0 && (
                <div className={styles.card} style={{borderColor: '#ef4444', borderLeftWidth: '5px'}}>
                    <h2 className={styles.reportTitle}>{t('reports.upcoming_expense_alert', { count: reportData.upcomingExpenses.length })}</h2>
                    <table className={styles.reportTable}>
                        <thead><tr><th>{t('common.due_date')}</th><th>{t('common.description')}</th><th>{t('common.amount')}</th></tr></thead>
                        <tbody>
                            {reportData.upcomingExpenses.map(e => (
                                <tr key={e.id}><td>{new Date(e.dueDate).toLocaleDateString()}</td><td>{e.description}</td><td>${e.amount.toFixed(2)}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {reportType === 'profit_loss' && (
                <div className={styles.card}>
                    <h2 className={styles.reportTitle}>{t('reports.profit_loss_statement')}</h2>
                    <div className={styles.summaryGrid}>
                        <div className={styles.summaryItem}><p>{t('reports.total_revenue')}</p><span>${reportData.totalRevenue.toFixed(2)}</span></div>
                        <div className={styles.summaryItem}><p>{t('reports.cost_of_goods')}</p><span>${reportData.totalCOGS.toFixed(2)}</span></div>
                        <div className={styles.summaryItem}><p>{t('reports.gross_profit')}</p><span>${reportData.grossProfit.toFixed(2)}</span></div>
                        <div className={styles.summaryItem}><p>{t('reports.operating_expenses')}</p><span>${reportData.totalExpenses.toFixed(2)}</span></div>
                        <div className={styles.summaryItem} style={{backgroundColor: '#dcfce7'}}><p>{t('reports.net_profit')}</p><span>${reportData.netProfit.toFixed(2)}</span></div>
                    </div>
                </div>
            )}

            {reportType === 'sales_by_category' && (
                <div className={styles.card}>
                    <h2 className={styles.reportTitle}>{t('reports.sales_by_category')}</h2>
                    <table className={styles.reportTable}>
                        <thead><tr><th>{t('common.category')}</th><th>{t('common.revenue')}</th></tr></thead>
                        <tbody>
                            {Object.entries(reportData.salesByCategory).sort(([,a],[,b]) => b-a).map(([category, revenue]) => (
                                <tr key={category}><td>{category}</td><td>${revenue.toFixed(2)}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {reportType === 'supplier_debt' && (
                <div className={styles.card}>
                    <h2 className={styles.reportTitle}>{t('reports.supplier_debt_report')}</h2>
                    <div className={styles.summaryItem} style={{marginBottom: '1rem'}}>
                        <p>{t('reports.total_outstanding_debt')}</p>
                        <span style={{color: '#ef4444'}}>${reportData.totalDebt.toFixed(2)}</span>
                    </div>
                    <table className={styles.reportTable}>
                        <thead><tr><th>{t('common.supplier')}</th><th>{t('reports.total_debt')}</th></tr></thead>
                        <tbody>
                            {reportData.supplierDebtList.map(s => (
                                <tr key={s.id}><td>{s.name}</td><td>${s.debt.toFixed(2)}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      )}
    </div>
  );
}

export default ReportsPage;