// src/pages/CategoriesPage.jsx
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import styles from './CategoriesPage.module.css'; // Use the new stylesheet
import Button from '../components/ui/Button.jsx';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

function CategoriesPage() {
  const { t } = useTranslation();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { products } = useProducts();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categoryCounts = useMemo(() => {
    if (!products) return {};
    const counts = {};
    for (const product of products) {
      if (product.category) {
        counts[product.category] = (counts[product.category] || 0) + 1;
      }
    }
    return counts;
  }, [products]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    addCategory(newCategoryName);
    setNewCategoryName('');
  };

  const handleDeleteClick = (category) => {
    if (categoryCounts[category.name] > 0) {
      alert(t('categories.cannot_delete_tooltip'));
      return;
    }
    deleteCategory(category.id);
  };

  const handleEdit = (category) => { setEditingId(category.id); setEditingName(category.name); };
  const handleUpdate = (id) => { if (!editingName) return; updateCategory(id, editingName); setEditingId(null); setEditingName(''); };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>{t('categories.title')}</h1>

      <div className={styles.card}>
        <h2 className={styles.formTitle}>{t('categories.add_new')}</h2>
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder={t('categories.category_name')}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className={styles.formInput}
            style={{ flex: 1 }}
          />
          <Button type="submit" variant="save">{t('common.add')}</Button>
        </form>
      </div>

      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className={styles.formTitle}>{t('categories.existing')}</h2>
          <input
            type="text"
            placeholder={t('common.search_categories')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.formInput}
            style={{ maxWidth: '300px' }}
          />
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('categories.category_name')}</th>
                <th>{t('categories.products')}</th>
                <th style={{width: '180px'}}>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(category => (
                <tr key={category.id}>
                  {editingId === category.id ? (
                    <>
                      <td data-label={t('categories.category_name')}>
                        <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} className={styles.formInput} autoFocus />
                      </td>
                      <td data-label={t('categories.products')}>
                        {categoryCounts[category.name] || 0}
                      </td>
                      <td data-label={t('common.actions')}>
                        <div className={styles.actionsCell}>
                          <Button variant="save" onClick={() => handleUpdate(category.id)}><FaSave /></Button>
                          <Button variant="cancel" onClick={() => setEditingId(null)}><FaTimes /></Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td data-label={t('categories.category_name')}>
                        {category.name}
                      </td>
                      <td data-label={t('categories.products')}>
                        {categoryCounts[category.name] || 0}
                      </td>
                      <td data-label={t('common.actions')}>
                        <div className={styles.actionsCell}>
                          <Button variant="edit" onClick={() => handleEdit(category)}><FaEdit /></Button>
                          <Button
                            variant="delete"
                            onClick={() => handleDeleteClick(category)}
                            disabled={(categoryCounts[category.name] || 0) > 0}
                            title={(categoryCounts[category.name] || 0) > 0 ? t('categories.cannot_delete_tooltip') : t('categories.delete_tooltip')}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCategories.length === 0 && searchTerm && <p className={styles.emptyMessage}>{t('categories.no_match')}</p>}
        {categories?.length === 0 && !searchTerm && <p className={styles.emptyMessage}>{t('categories.no_categories_yet')}</p>}
      </div>
    </div>
  );
}

export default CategoriesPage;