// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import ProtectedLayout from './components/layout/ProtectedLayout.jsx';
import Navbar from './components/layout/Navbar.jsx';
import styles from './App.module.css';
import { useEffect } from 'react';
import { useSettings } from './hooks/useSettings';
import { useTranslation } from 'react-i18next';

// Import all your pages
import DashboardPage from './pages/DashboardPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import SalesPage from './pages/SalesPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';


function App() {
  const { i18n } = useTranslation();
    const { runAutoBackup } = useSettings();
  
    useEffect(() => {
      // 1. Run once on initial load
      runAutoBackup();
  
      // 2. Then, set up an interval to check again periodically
      const intervalId = setInterval(() => {
        console.log("Running periodic backup check...");
        runAutoBackup();
      }, 900000); // Checks every 60 seconds (60 * 1000 ms)
  
      // 3. Clean up the interval when the app closes to prevent memory leaks
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
          <Navbar />
          <main className={styles.mainContent}>
            <Routes>
              {/* PROTECTED ROUTES */}
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
              </Route>

              {/* PUBLIC ROUTES (No password needed) */}
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;