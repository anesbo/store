// src/pages/CategoriesPage.jsx
import React, { useState, useMemo } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts'; // 1. IMPORT: Get products to count them
import Button from '../components/ui/Button.jsx'; // Use our reusable button
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import styles from './InventoryPage.module.css';

function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { products } = useProducts(); // Get the full product list

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // 2. STATE: For the search filter

  // 3. LOGIC: Calculate how many products are in each category
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

  // 4. LOGIC: Filter categories based on the search term
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
    // Prevent deleting a category that has products
    if (categoryCounts[category.name] > 0) {
      alert("Cannot delete a category that contains products. Please reassign the products first.");
      return;
    }
    deleteCategory(category.id);
  };

  const handleEdit = (category) => { setEditingId(category.id); setEditingName(category.name); };
  const handleUpdate = (id) => { if (!editingName) return; updateCategory(id, editingName); setEditingId(null); setEditingName(''); };


  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Manage Categories</h1>

      {/* Add Category Form */}
      <div className={styles.card}>
        <h2 className={styles.formTitle}>Add New Category</h2>
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className={styles.formInput}
            style={{ flex: 1 }}
          />
          <Button type="submit" variant="save">Add</Button>
        </form>
      </div>

      {/* Category List */}
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className={styles.formTitle}>Existing Categories</h2>
            {/* 5. UI: Search input */}
            <input
              type="text"
              placeholder="🔎 Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.formInput}
              style={{ maxWidth: '300px' }}
            />
        </div>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {/* Header Row */}
          <li style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0', borderBottom: '2px solid #ccc', fontWeight: 'bold' }}>
            <span style={{ flex: 1 }}>Category Name</span>
            <span style={{ width: '100px' }}>Products</span>
            <span style={{ width: '180px', textAlign: 'center' }}>Actions</span>
          </li>

          {/* 6. UI: Map over the filtered list */}
          {filteredCategories.map(category => (
            <li key={category.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
              {editingId === category.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className={styles.formInput}
                  autoFocus
                  style={{ flex: 1 }}
                />
              ) : (
                <span style={{ flex: 1 }}>{category.name}</span>
              )}
              
              {/* 7. UI: Display the product count */}
              <span style={{ width: '100px', textAlign: 'center' }}>{categoryCounts[category.name] || 0}</span>

              <div style={{ display: 'flex', gap: '8px', width: '180px', justifyContent: 'center'}}>
                {editingId === category.id ? (
                  <>
                    <Button variant="save" onClick={() => handleUpdate(category.id)}><FaSave /></Button>
                    <Button variant="cancel" onClick={() => setEditingId(null)}><FaTimes /></Button>
                  </>
                ) : (
                  <>
                    <Button variant="edit" onClick={() => handleEdit(category)}><FaEdit /></Button>
                    {/* 8. UI: Disable delete button if category is in use */}
                    <Button
                      variant="delete"
                      onClick={() => handleDeleteClick(category)}
                      disabled={(categoryCounts[category.name] || 0) > 0}
                      title={(categoryCounts[category.name] || 0) > 0 ? "Cannot delete: category has products" : "Delete category"}
                    >
                      <FaTrash />
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
        {filteredCategories.length === 0 && <p className={styles.emptyMessage}>No categories match your search.</p>}
      </div>
    </div>
  );
}

export default CategoriesPage;