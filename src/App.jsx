// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedLayout from './components/layout/ProtectedLayout.jsx';
import Navbar from './components/layout/Navbar.jsx';
import styles from './App.module.css';

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
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className={styles.appContainer}>
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