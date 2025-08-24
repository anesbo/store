// src/pages/DashboardPage.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import { useSetting } from '../hooks/useSettings';
import { useExpenses } from '../hooks/useExpenses';
import { useSuppliers } from '../hooks/useSuppliers';
import { useCategories } from '../hooks/useCategories';
import styles from './DashboardPage.module.css';
import { useTranslation } from 'react-i18next';
import { FaDollarSign, FaRegCalendarAlt, FaRegCalendarCheck, FaRegClock, FaBoxes, FaChartPie, FaChartBar } from 'react-icons/fa';

const ITEMS_PER_PAGE = 5;

function StatCard({ icon, title, value, secondaryValue, color }) {
  return (
    <div className={styles.statCard} style={{ borderLeftColor: color }}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statInfo}>
        <p>{title}</p>
        <span>{value}</span>
        {secondaryValue && <small>{secondaryValue}</small>}
      </div>
    </div>
  );
}

function DashboardPage() {
  const { products } = useProducts();
  const { sales } = useSales();
  const { expenses } = useExpenses();
  const { suppliers } = useSuppliers();
  const { categories } = useCategories();
  const STALE_PRODUCT_DAYS = useSetting('staleDays', 20);

  const [salesPage, setSalesPage] = useState(1);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [stalePage, setStalePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState(null);
  const { t } = useTranslation();
  
  useEffect(() => {
    setHistoryPage(1);
  }, [startDate, endDate]);

  const dashboardData = useMemo(() => {
    if (!sales || !products || !expenses || !suppliers || !categories) {
      return { 
        sortedSales: [], lowStock: [], staleProducts: [], unpaidDebts: [], 
        todayRevenue: 0, weekRevenue: 0, monthRevenue: 0, yearRevenue: 0,
        todayProfit: 0, weekProfit: 0, monthProfit: 0, yearProfit: 0,
        totalCapitalPurchase: 0, totalCapitalSelling: 0,
        productCount: 0, categoryCount: 0
      };
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const staleThresholdDate = new Date();
    staleThresholdDate.setDate(staleThresholdDate.getDate() - STALE_PRODUCT_DAYS);

    let todayRevenue = 0, weekRevenue = 0, monthRevenue = 0, yearRevenue = 0;
    let todayCost = 0, weekCost = 0, monthCost = 0, yearCost = 0;
    let totalCapitalPurchase = 0, totalCapitalSelling = 0;
    const lastSaleDateByProductId = new Map();

    products.forEach(p => {
        totalCapitalPurchase += (p.purchasePrice || 0) * p.stock;
        totalCapitalSelling += (p.sellingPrice || 0) * p.stock;
    });

    sales.forEach(sale => {
      const saleTimestamp = new Date(sale.timestamp);
      let saleCost = 0;
      sale.items.forEach(item => {
        saleCost += (item.purchasePrice || 0) * item.quantity;
        lastSaleDateByProductId.set(item.id, saleTimestamp);
      });
      if (saleTimestamp >= startOfToday) { todayRevenue += sale.totalAmount; todayCost += saleCost; }
      if (saleTimestamp >= startOfWeek) { weekRevenue += sale.totalAmount; weekCost += saleCost; }
      if (saleTimestamp >= startOfMonth) { monthRevenue += sale.totalAmount; monthCost += saleCost; }
      if (saleTimestamp >= startOfYear) { yearRevenue += sale.totalAmount; yearCost += saleCost; }
    });

    const todayProfit = todayRevenue - todayCost;
    const weekProfit = weekRevenue - weekCost;
    const monthProfit = monthRevenue - monthCost;
    const yearProfit = yearRevenue - yearCost;
    const lowStock = products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock);
    const staleProducts = products.filter(p => {
      const lastSaleDate = lastSaleDateByProductId.get(p.id);
      return !lastSaleDate || lastSaleDate < staleThresholdDate;
    });
    const sortedSales = [...sales].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));
    const unpaidDebts = expenses.filter(e => e.status === 'Unpaid')
      .map(e => ({ ...e, supplierName: supplierMap.get(e.supplierId) || 'Unknown' }));

    return { 
        sortedSales, lowStock, staleProducts, unpaidDebts, 
        todayRevenue, weekRevenue, monthRevenue, yearRevenue,
        todayProfit, weekProfit, monthProfit, yearProfit,
        totalCapitalPurchase, totalCapitalSelling,
        productCount: products.length, categoryCount: categories.length
    };
  }, [sales, products, expenses, suppliers, categories, STALE_PRODUCT_DAYS]);

  const salesHistoryData = useMemo(() => {
    if (!dashboardData?.sortedSales) return { filteredSales: [], periodRevenue: 0, periodProfit: 0 };
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if(start) start.setHours(0, 0, 0, 0);
    if(end) end.setHours(23, 59, 59, 999);

    const filteredSales = dashboardData.sortedSales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      if (start && saleDate < start) return false;
      if (end && saleDate > end) return false;
      return true;
    });

    let periodRevenue = 0;
    let periodProfit = 0;
    filteredSales.forEach(sale => {
      periodRevenue += sale.totalAmount;
      const saleCost = sale.items.reduce((cost, item) => cost + (item.purchasePrice || 0) * item.quantity, 0);
      periodProfit += (sale.totalAmount - saleCost);
    });

    return { filteredSales, periodRevenue, periodProfit };
  }, [dashboardData?.sortedSales, startDate, endDate]);

  const handleToggleSaleDetails = (saleId) => setExpandedSaleId(prevId => (prevId === saleId ? null : saleId));

  const paginate = (items, page, perPage) => {
    const safeItems = items || [];
    const totalPages = Math.ceil(safeItems.length / perPage);
    const paginatedItems = safeItems.slice((page - 1) * perPage, page * perPage);
    return { paginatedItems, totalPages };
  };

  const recentSalesPagination = paginate(dashboardData.sortedSales, salesPage, ITEMS_PER_PAGE);
  const lowStockPagination = paginate(dashboardData.lowStock, lowStockPage, ITEMS_PER_PAGE);
  const stalePagination = paginate(dashboardData.staleProducts, stalePage, ITEMS_PER_PAGE);
  const historyPagination = paginate(salesHistoryData.filteredSales, historyPage, ITEMS_PER_PAGE);

  if (!sales || !products || !expenses || !suppliers || !categories) {
    return <div className={styles.pageContainer}>Loading Dashboard...</div>
  }

  const renderPaginationControls = (currentPage, totalPages, setCurrentPage) => (
    <div className={styles.pagination}>
      <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>&larr;</button>
      <span>Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
      <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages}>&rarr;</button>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>{t('dashboard.title')}</h1>
      
      <div className={styles.statsGrid}>
        <StatCard icon={<FaRegClock />} title={t('dashboard.revenue_today')} value={`$${dashboardData.todayRevenue.toFixed(2)}`} secondaryValue={`${t('common.profit')}: $${dashboardData.todayProfit.toFixed(2)}`} color="#22c55e" />
        <StatCard icon={<FaRegCalendarAlt />} title={t('dashboard.revenue_week')} value={`$${dashboardData.weekRevenue.toFixed(2)}`} secondaryValue={`${t('common.profit')}: $${dashboardData.weekProfit.toFixed(2)}`} color="#3b82f6" />
        <StatCard icon={<FaRegCalendarCheck />} title={t('dashboard.revenue_month')} value={`$${dashboardData.monthRevenue.toFixed(2)}`} secondaryValue={`${t('common.profit')}: $${dashboardData.monthProfit.toFixed(2)}`} color="#eab308" />
      </div>
      
      <div className={styles.statsGrid} style={{marginTop: '2rem'}}>
        <StatCard icon={<FaChartBar />} title={t('dashboard.income_year')} value={`$${dashboardData.yearRevenue.toFixed(2)}`} secondaryValue={`${t('common.profit')}: $${dashboardData.yearProfit.toFixed(2)}`} color="#8b5cf6" />
        <StatCard icon={<FaChartPie />} title={t('dashboard.inventory_value')} value={`$${dashboardData.totalCapitalSelling.toFixed(2)}`} secondaryValue={`${t('common.cost')}: $${dashboardData.totalCapitalPurchase.toFixed(2)}`} color="#ec4899" />
        <StatCard icon={<FaBoxes />} title={t('dashboard.product_count')} value={dashboardData.productCount} secondaryValue={t('dashboard.category_count', {count: dashboardData.categoryCount})} color="#6366f1" />
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t('dashboard.recent_sales')}</h2>
          <ul>{recentSalesPagination.paginatedItems.map(s => <li key={s.id} className={styles.listItem}><div><span>{t('dashboard.items_sold', {count: s.items.length})}</span><small style={{display:'block',color:'#666'}}>{new Date(s.timestamp).toLocaleDateString()}</small></div><strong>${s.totalAmount.toFixed(2)}</strong></li>)}</ul>
          {renderPaginationControls(salesPage, recentSalesPagination.totalPages, setSalesPage)}
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle} style={{color: '#ef4444'}}>{t('dashboard.low_stock_alerts')}</h2>
          <ul>{lowStockPagination.paginatedItems.map(p => <li key={p.id} className={styles.listItem}><span>{p.name}</span><strong style={{color: '#ef4444'}}>{t('dashboard.only_left', {count: p.stock})}</strong></li>)}</ul>
          {renderPaginationControls(lowStockPage, lowStockPagination.totalPages, setLowStockPage)}
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle} style={{color: '#f97316'}}>{t('dashboard.stale_products')}</h2>
          <p style={{fontSize: '0.8rem', marginTop: '-1rem', color: '#666'}}>{t('dashboard.not_sold_in_days', {count: STALE_PRODUCT_DAYS})}</p>
          <ul>{stalePagination.paginatedItems.map(p => <li key={p.id} className={styles.listItem}><span>{p.name}</span><small>No recent sales</small></li>)}</ul>
          {renderPaginationControls(stalePage, stalePagination.totalPages, setStalePage)}
        </div>
        <div className={styles.card}>
            <h2 className={styles.cardTitle} style={{ color: '#991b1b' }}>🚨 {t('dashboard.unpaid_expenses')}</h2>
            <p style={{fontSize: '0.8rem', marginTop: '-1rem', color: '#666'}}>{t('dashboard.all_outstanding_debts')}</p>
            <ul>
                {dashboardData.unpaidDebts.map(expense => (
                <li key={expense.id} className={styles.listItem}>
                    <div>
                    <span>{expense.description}</span>
                    <small style={{display:'block', color:'#666'}}>{expense.supplierName}</small>
                    </div>
                    <strong style={{color: '#991b1b'}}>${expense.amount.toFixed(2)}</strong>
                </li>
                ))}
            </ul>
        </div>
      </div>

      <div className={`${styles.card} ${styles.historyCard}`}>
        <h2 className={styles.cardTitle}>{t('dashboard.sales_history')}</h2>
        <div className={styles.dateFilter}>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <span>{t('common.to')}</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div className={styles.periodSummary}>
          {t('common.revenue')}: <strong>${salesHistoryData.periodRevenue.toFixed(2)}</strong> | 
          {t('common.profit')}: <strong>${salesHistoryData.periodProfit.toFixed(2)}</strong>
        </div>
        <div style={{overflowX: 'auto'}}>
          <table className={styles.historyTable}>
            <thead><tr><th>{t('common.date')}</th><th>{t('common.items')}</th><th>{t('common.total')}</th><th>{t('common.details')}</th></tr></thead>
            <tbody>
              {historyPagination.paginatedItems.map(sale => ([
                <tr key={sale.id}>
                  <td>{new Date(sale.timestamp).toLocaleDateString()}</td>
                  <td>{sale.items.length}</td>
                  <td>${sale.totalAmount.toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleToggleSaleDetails(sale.id)} className={styles.detailsButton}>
                      {expandedSaleId === sale.id ? t('common.hide') : t('common.show')}
                    </button>
                  </td>
                </tr>,
                expandedSaleId === sale.id && (
                  <tr key={`${sale.id}-details`} className={styles.detailsRow}>
                    <td colSpan="4">
                      <ul>
                        {sale.items.map((item, index) => (
                          <li key={index}>{item.quantity}x {item.name} @ ${item.sellingPrice.toFixed(2)} each</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )
              ]))}
            </tbody>
          </table>
        </div>
        {renderPaginationControls(historyPage, historyPagination.totalPages, setHistoryPage)}
      </div>
    </div>
  );
}

export default DashboardPage;