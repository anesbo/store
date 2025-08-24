// src/components/layout/Navbar.jsx

import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../hooks/useSettings';
import { useTranslation } from 'react-i18next';

import { 
  FaTachometerAlt, FaBoxOpen, FaTags, FaShoppingCart, 
  FaFileInvoiceDollar, FaChartBar, FaCog, FaTruck 
} from 'react-icons/fa';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { settings } = useSettings();
  const passwordIsSet = settings?.some(s => s.key === 'passwordHash');
  const { t } = useTranslation();

  return (
    <nav className={styles.navbar}>
      <div className={styles.header}>
        <h1 className={styles.title}>👕 {t('nav.app_title')}</h1>
      </div>

      <ul className={styles.navList}>
        <li><Link to="/" className={styles.navLink}><FaTachometerAlt /> {t('nav.dashboard')}</Link></li>
        <li><Link to="/inventory" className={styles.navLink}><FaBoxOpen /> {t('nav.inventory')}</Link></li>
        <li><Link to="/categories" className={styles.navLink}><FaTags /> {t('nav.categories')}</Link></li>
        <li><Link to="/sales" className={styles.navLink}><FaShoppingCart /> {t('nav.sales')}</Link></li>
        <li><Link to="/expenses" className={styles.navLink}><FaFileInvoiceDollar /> {t('nav.expenses')}</Link></li>
        <li><Link to="/suppliers" className={styles.navLink}><FaTruck /> {t('nav.suppliers')}</Link></li>
        <li><Link to="/reports" className={styles.navLink}><FaChartBar /> {t('nav.reports')}</Link></li>
        <li><Link to="/settings" className={styles.navLink}><FaCog /> {t('nav.settings')}</Link></li>
      </ul>

      <div className={styles.footer}>
        {passwordIsSet && isAuthenticated && (
          <button onClick={logout} className={styles.logoutButton}>
            {t('nav.logout')}
          </button>
        )}
        <p>Version 0.1.0</p>
        <p>© 2025</p>
      </div>
    </nav>
  );
}

export default Navbar;