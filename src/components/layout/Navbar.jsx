// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { 
  FaTachometerAlt, FaBoxOpen, FaTags, FaShoppingCart, 
  FaFileInvoiceDollar, FaChartBar, FaCog, FaTruck,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { settings } = useSettings();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navbarRef = useRef();
  const passwordIsSet = settings?.some(s => s.key === 'passwordHash');

  useEffect(() => {
    const newWidth = isCollapsed ? '80px' : '250px';
    document.documentElement.style.setProperty('--navbar-width', newWidth);
  }, [isCollapsed]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isCollapsed && navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsCollapsed(true);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCollapsed]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <nav ref={navbarRef} className={`${styles.navbar} ${isCollapsed ? styles.navbarCollapsed : ''}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>akram store</h1>
        <button className={styles.toggleButton} onClick={toggleCollapse}>
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
      <ul className={styles.navList}>
        <li><Link to="/" className={styles.navLink} title={t('nav.dashboard')}><FaTachometerAlt /> <span className={styles.navLinkText}>{t('nav.dashboard')}</span></Link></li>
        <li><Link to="/inventory" className={styles.navLink} title={t('nav.inventory')}><FaBoxOpen /> <span className={styles.navLinkText}>{t('nav.inventory')}</span></Link></li>
        <li><Link to="/categories" className={styles.navLink} title={t('nav.categories')}><FaTags /> <span className={styles.navLinkText}>{t('nav.categories')}</span></Link></li>
        <li><Link to="/sales" className={styles.navLink} title={t('nav.sales')}><FaShoppingCart /> <span className={styles.navLinkText}>{t('nav.sales')}</span></Link></li>
        <li><Link to="/expenses" className={styles.navLink} title={t('nav.expenses')}><FaFileInvoiceDollar /> <span className={styles.navLinkText}>{t('nav.expenses')}</span></Link></li>
        <li><Link to="/suppliers" className={styles.navLink} title={t('nav.suppliers')}><FaTruck /> <span className={styles.navLinkText}>{t('nav.suppliers')}</span></Link></li>
        <li><Link to="/reports" className={styles.navLink} title={t('nav.reports')}><FaChartBar /> <span className={styles.navLinkText}>{t('nav.reports')}</span></Link></li>
        <li><Link to="/settings" className={styles.navLink} title={t('nav.settings')}><FaCog /> <span className={styles.navLinkText}>{t('nav.settings')}</span></Link></li>
      </ul>
      <div className={styles.footer}>
        <p>Version 0.1.0</p>
        <p>© 2025</p>
      </div>
    </nav>
  );
}

export default Navbar;