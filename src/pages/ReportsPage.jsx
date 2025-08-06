// src/pages/ReportsPage.jsx
import React, { useState, useMemo } from 'react';
import { useSales } from '../hooks/useSales';
import { useExpenses } from '../hooks/useExpenses';
import styles from './ReportsPage.module.css';
import Button from '../components/ui/Button.jsx';

// Placeholder for a future setting
const UPCOMING_EXPENSE_DAYS = 3;

function ReportsPage() {
  const { sales } = useSales();
  const { expenses } = useExpenses();
  
  const [reportType, setReportType] = useState('profit_loss');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const reportData = useMemo(() => {
    if (!sales || !expenses) return null;

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

    return { totalRevenue, totalCOGS, totalExpenses, grossProfit, netProfit, salesByCategory, upcomingExpenses };
  }, [sales, expenses, startDate, endDate]);

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Reports</h1>

      <div className={styles.card}>
        <h2 className={styles.formTitle}>Report Controls</h2>
        <div className={styles.controls}>
          <select value={reportType} onChange={e => setReportType(e.target.value)} className={styles.formInput}>
            <option value="profit_loss">Profit & Loss</option>
            <option value="sales_by_category">Sales by Category</option>
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={styles.formInput} />
          <span>to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={styles.formInput} />
        </div>
      </div>

      {/* Report Display Area */}
      {reportData && (
        <div className={styles.reportDisplay}>
            {/* ALERT: Upcoming Expenses */}
            {reportData.upcomingExpenses.length > 0 && (
                <div className={styles.card} style={{borderColor: '#ef4444', borderLeftWidth: '5px'}}>
                    <h2 className={styles.reportTitle}>🚨 Upcoming Expense Alert ({reportData.upcomingExpenses.length})</h2>
                    <table className={styles.reportTable}>
                        <thead><tr><th>Due Date</th><th>Description</th><th>Amount</th></tr></thead>
                        <tbody>
                            {reportData.upcomingExpenses.map(e => (
                                <tr key={e.id}><td>{new Date(e.dueDate).toLocaleDateString()}</td><td>{e.description}</td><td>${e.amount.toFixed(2)}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Profit & Loss Report */}
            {reportType === 'profit_loss' && (
                <div className={styles.card}>
                    <h2 className={styles.reportTitle}>Profit & Loss Statement</h2>
                    <div className={styles.summaryGrid}>
                        <div className={styles.summaryItem}> <p>Total Revenue</p> <span>${reportData.totalRevenue.toFixed(2)}</span> </div>
                        <div className={styles.summaryItem}> <p>- Cost of Goods</p> <span>${reportData.totalCOGS.toFixed(2)}</span> </div>
                        <div className={styles.summaryItem}> <p>= Gross Profit</p> <span>${reportData.grossProfit.toFixed(2)}</span> </div>
                        <div className={styles.summaryItem}> <p>- Operating Expenses</p> <span>${reportData.totalExpenses.toFixed(2)}</span> </div>
                        <div className={styles.summaryItem} style={{backgroundColor: '#dcfce7'}}> <p>Net Profit</p> <span>${reportData.netProfit.toFixed(2)}</span> </div>
                    </div>
                </div>
            )}

            {/* Sales by Category Report */}
            {reportType === 'sales_by_category' && (
                <div className={styles.card}>
                    <h2 className={styles.reportTitle}>Sales by Category</h2>
                    <table className={styles.reportTable}>
                        <thead><tr><th>Category</th><th>Revenue</th></tr></thead>
                        <tbody>
                            {Object.entries(reportData.salesByCategory).sort(([,a],[,b]) => b-a).map(([category, revenue]) => (
                                <tr key={category}><td>{category}</td><td>${revenue.toFixed(2)}</td></tr>
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