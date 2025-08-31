// src/pages/ReportsPage.jsx
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSales } from '../hooks/useSales';
import { useExpenses } from '../hooks/useExpenses';
import { useSuppliers } from '../hooks/useSuppliers';
import { useArchivedSales } from '../hooks/useArchivedSales';
import { useArchivedExpenses } from '../hooks/useArchivedExpenses';
import styles from './ReportsPage.module.css';
import Button from '../components/ui/Button.jsx';

const UPCOMING_EXPENSE_DAYS = 3;
const ITEMS_PER_PAGE = 10;

function ReportsPage() {
  const { t } = useTranslation();
  const { sales } = useSales();
  const { expenses } = useExpenses();
  const { suppliers } = useSuppliers();
  const { archivedSales } = useArchivedSales();
  const { archivedExpenses } = useArchivedExpenses();
  
  const [reportType, setReportType] = useState('profit_loss');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [archiveSalesPage, setArchiveSalesPage] = useState(1);
  const [archiveExpensesPage, setArchiveExpensesPage] = useState(1);

  const reportData = useMemo(() => {
    if (!sales || !expenses || !suppliers) return null;

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
    
    const upcomingThreshold = new Date();
    upcomingThreshold.setDate(upcomingThreshold.getDate() + UPCOMING_EXPENSE_DAYS);
    const now = new Date();
    const upcomingExpenses = expenses.filter(e => {
        const dueDate = new Date(e.dueDate);
        return e.status === 'Upcoming' && dueDate >= now && dueDate <= upcomingThreshold;
    });

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

  const paginate = (items, page, perPage) => {
    if (!items) return { paginatedItems: [], totalPages: 0 };
    const totalPages = Math.ceil(items.length / perPage);
    const paginatedItems = items.slice((page - 1) * perPage, page * perPage);
    return { paginatedItems, totalPages };
  };

  const paginatedArchivedSales = paginate(archivedSales, archiveSalesPage, ITEMS_PER_PAGE);
  const paginatedArchivedExpenses = paginate(archivedExpenses, archiveExpensesPage, ITEMS_PER_PAGE);

  const renderPaginationControls = (currentPage, totalPages, setCurrentPage) => (
    <div className={styles.pagination}>
      <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>{t('common.previous')}</button>
      <span>{t('common.page_of', {currentPage, totalPages: totalPages > 0 ? totalPages : 1})}</span>
      <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages}>{t('common.next')}</button>
    </div>
  );

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
            <option value="archive_summary">{t('reports.archive_summary')}</option>
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

            {reportType === 'archive_summary' && (
              <div className={styles.card}>
                  <h2 className={styles.reportTitle}>{t('reports.archive_summary')}</h2>
                  
                  <h3 className={styles.subTitle}>{t('reports.archived_sales', {count: archivedSales?.length || 0})}</h3>
                  <div className={styles.tableContainer}>
                      <table className={styles.reportTable}>
                          <thead><tr><th>{t('common.date')}</th><th>{t('common.items')}</th><th>{t('common.total')}</th></tr></thead>
                          <tbody>
                              {paginatedArchivedSales.paginatedItems.map(s => (
                                  <tr key={s.id}>
                                      <td>{new Date(s.timestamp).toLocaleDateString()}</td>
                                      <td>{s.items.length}</td>
                                      <td>${s.totalAmount.toFixed(2)}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
                  {renderPaginationControls(archiveSalesPage, paginatedArchivedSales.totalPages, setArchiveSalesPage)}

                  <h3 className={styles.subTitle} style={{marginTop: '2rem'}}>{t('reports.archived_expenses', {count: archivedExpenses?.length || 0})}</h3>
                  <div className={styles.tableContainer}>
                      <table className={styles.reportTable}>
                          <thead><tr><th>{t('common.date')}</th><th>{t('common.description')}</th><th>{t('common.amount')}</th></tr></thead>
                          <tbody>
                              {paginatedArchivedExpenses.paginatedItems.map(e => (
                                  <tr key={e.id}>
                                      <td>{new Date(e.date).toLocaleDateString()}</td>
                                      <td>{e.description}</td>
                                      <td>${e.amount.toFixed(2)}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
                  {renderPaginationControls(archiveExpensesPage, paginatedArchivedExpenses.totalPages, setArchiveExpensesPage)}
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default ReportsPage;