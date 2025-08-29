// src/App.jsx
import React, { useEffect ,useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext.jsx';
import { useSettings } from './hooks/useSettings';
import Navbar from './components/layout/Navbar.jsx';
import ProtectedLayout from './components/layout/ProtectedLayout.jsx';
import styles from './App.module.css';
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
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    runAutoBackup();
    const intervalId = setInterval(() => {
      runAutoBackup();
    }, 900000); // 15 minutes
    return () => clearInterval(intervalId);
  }, [runAutoBackup]);
  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n, i18n.language]);
  return (
    <BrowserRouter>
      <AuthProvider>
          <div className={styles.appContainer}>
            <Toaster position="top-center" />
            <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`${styles.mainContent} ${isCollapsed ? styles.mainContentCollapsed : ''}`}>
              <Routes>
                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/sales/:saleId" element={<SalesPage />} />
                </Route>
                <Route path="/sales" element={<SalesPage />} /> {/* For a new sale */}
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
          </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;