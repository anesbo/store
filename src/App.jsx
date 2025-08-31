// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { useSettings } from './hooks/useSettings';
import Navbar from './components/layout/Navbar.jsx';
import ProtectedLayout from './components/layout/ProtectedLayout.jsx';
import styles from './App.module.css'; // Make sure this is imported
import DashboardPage from './pages/DashboardPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import SalesPage from './pages/SalesPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import './i18n';
function App() {
  const { i18n } = useTranslation();
  const { runAutoBackup } = useSettings();

  useEffect(() => {
    runAutoBackup();
    const intervalId = setInterval(() => runAutoBackup(), 900000);
    return () => clearInterval(intervalId);
  }, [runAutoBackup]);

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n, i18n.language]);

  return (
    <BrowserRouter>
      <AuthProvider>
          <Toaster position="top-center" />
          <Navbar />
          <main className={styles.mainContent}>
          <Routes>
                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/sales/:saleId" element={<SalesPage />} />
                </Route>
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
          </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;