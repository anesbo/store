// src/components/layout/Navbar.jsx

import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useAuth } from '../../context/AuthContext'; // 1. Import useAuth
import { useSettings } from '../../hooks/useSettings'; // Import useSettings

import { 
  FaTachometerAlt, FaBoxOpen, FaTags, FaShoppingCart, 
  FaFileInvoiceDollar, FaChartBar, FaCog ,FaTruck
} from 'react-icons/fa';

function Navbar() {
  const { isAuthenticated, logout } = useAuth(); // 2. Get auth state and logout function
  const { settings } = useSettings();
  const passwordIsSet = settings?.some(s => s.key === 'passwordHash');

  return (
    <nav className={styles.navbar}>
      <div className={styles.header}>
        <h1 className={styles.title}>Store App</h1>
      </div>

      <ul className={styles.navList}>
        <li><Link to="/" className={styles.navLink}><FaTachometerAlt />Dashboard</Link></li>
        <li><Link to="/inventory" className={styles.navLink}><FaBoxOpen />Inventory</Link></li>
        <li><Link to="/categories" className={styles.navLink}><FaTags />Categories</Link></li>
        <li><Link to="/sales" className={styles.navLink}><FaShoppingCart />Sales (POS)</Link></li>
        <li><Link to="/expenses" className={styles.navLink}><FaFileInvoiceDollar />Expenses</Link></li>
        <li><Link to="/suppliers" className={styles.navLink}><FaTruck />Suppliers</Link></li>
        <li><Link to="/reports" className={styles.navLink}><FaChartBar />Reports</Link></li>
        <li><Link to="/settings" className={styles.navLink}><FaCog />Settings</Link></li>
      </ul>

      <div className={styles.footer}>
        {/* 3. Conditionally render the logout button */}
        {passwordIsSet && isAuthenticated && (
          <button onClick={logout} className={styles.logoutButton}>
            Logout
          </button>
        )}
        <p>Version 0.1.0</p>
        <p>© 2025</p>
      </div>
    </nav>
  );
}

export default Navbar;