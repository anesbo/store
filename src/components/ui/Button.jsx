// src/components/ui/Button.jsx
import React from 'react';
import styles from './Button.module.css';

function Button({ onClick, children, type = 'button', variant = 'primary' }) {
  // Map variant names to CSS module classes
  const variantStyles = {
    save: styles.btnSave,
    edit: styles.btnEdit,
    delete: styles.btnDelete,
    cancel: styles.btnCancel,
  };

  // Combine the base .btn class with the specific variant class
  const buttonClass = `${styles.btn} ${variantStyles[variant] || ''}`;

  return (
    <button type={type} onClick={onClick} className={buttonClass}>
      {children}
    </button>
  );
}

export default Button;