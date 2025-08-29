// src/pages/InventoryPage.jsx

// 1. MAKE SURE you import your reusable Button component
import React, { useState, useMemo } from 'react';
import Button from '../components/ui/Button'; // Assuming this file exists from our previous discussion
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import styles from './InventoryPage.module.css';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

// 2. The Button component function has been REMOVED from here. It must be in its own file.

function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const { t } = useTranslation(); 

  const [newProduct, setNewProduct] = useState({ name: '', purchasePrice: '', sellingPrice: '', stock: '', category: '' });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 13;

  // --- Handlers remain the same ---
  const handleNewProductChange = (e) => setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const { name, purchasePrice, sellingPrice, stock, category } = newProduct;
    if (!name || !purchasePrice || !sellingPrice || !stock || !category) {
      alert('Please fill out all fields.');
      return;
    }
    addProduct({ name, purchasePrice: parseFloat(purchasePrice), sellingPrice: parseFloat(sellingPrice), stock: parseInt(stock, 10), category });
    setNewProduct({ name: '', purchasePrice: '', sellingPrice: '', stock: '', category: '' });
  };
  const handleEditClick = (product) => { setEditingId(product.id); setEditFormData({ ...product }); };
  const handleCancelClick = () => setEditingId(null);
  const handleEditFormChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  const handleUpdateClick = () => {
    const { id, name, purchasePrice, sellingPrice, stock, category } = editFormData;
    updateProduct(id, { name, purchasePrice: parseFloat(purchasePrice), sellingPrice: parseFloat(sellingPrice), stock: parseInt(stock, 10), category });
    setEditingId(null);
  };
  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };


  // 3. ROBUST: Made the filter logic safer
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product =>
      (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (product.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);


  
  if (products === undefined) {
    return <div>Loading inventory...</div>; // Or show a spinner component
  }
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>{t('inventory.title')}</h1>

      {/* Add Product Form */}
      <div className={styles.card}>
        <h2 className={styles.formTitle}>{t('inventory.add_product')}</h2>
        <form onSubmit={handleAddSubmit} className={styles.formGrid}>
          <input name="name" type="text" placeholder={t('inventory.product_name')} value={newProduct.name} onChange={handleNewProductChange} className={styles.formInput} />
          <input name="purchasePrice" type="number" placeholder={t('inventory.purchase_price')} value={newProduct.purchasePrice} onChange={handleNewProductChange} className={styles.formInput} />
          <input name="sellingPrice" type="number" placeholder={t('inventory.selling_price')} value={newProduct.sellingPrice} onChange={handleNewProductChange} className={styles.formInput} />
          <input name="stock" type="number" placeholder={t('inventory.stock_quantity')} value={newProduct.stock} onChange={handleNewProductChange} className={styles.formInput} />
          <select name="category" value={newProduct.category} onChange={handleNewProductChange} className={styles.formInput}>
            <option value="">-- {t('inventory.select_category')} --</option>
            {categories?.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
          </select>
          <Button type="submit" variant="save"><FaPlus /> {t('common.add')}</Button>
        </form>
      </div>

      {/* Product List */}
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className={styles.formTitle}>{t('inventory.product_list')}</h2>
          <input type="text" placeholder={t('common.search_by_cat')} value={searchTerm} onChange={handleSearchChange} className={styles.formInput} style={{ maxWidth: '300px' }}/>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('common.name')}</th>
                <th>{t('common.category')}</th>
                <th>{t('common.stock')}</th>
                <th>{t('inventory.purchase_price')}</th>
                <th>{t('inventory.selling_price')}</th>
                <th style={{ width: '220px' }}>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => (
                <tr key={product.id}>
                  {editingId === product.id ? (
                     <>
                     <td data-label={t('common.name')}>
                       <input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className={styles.formInput} />
                     </td>
                     <td data-label={t('common.category')}>
                       <select name="category" value={editFormData.category} onChange={handleEditFormChange} className={styles.formInput}>
                         {categories?.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
                       </select>
                     </td>
                     <td data-label={t('common.stock')}>
                       <input type="number" name="stock" value={editFormData.stock} onChange={handleEditFormChange} className={styles.formInput} />
                     </td>
                     <td data-label={t('inventory.purchase_price')}>
                       <input type="number" name="purchasePrice" value={editFormData.purchasePrice} onChange={handleEditFormChange} className={styles.formInput} />
                     </td>
                     <td data-label={t('inventory.selling_price')}>
                       <input type="number" name="sellingPrice" value={editFormData.sellingPrice} onChange={handleEditFormChange} className={styles.formInput} />
                     </td>
                     <td data-label={t('common.actions')}>
                       <div style={{ display: 'flex', gap: '8px' }}>
                         <Button variant="save" onClick={handleUpdateClick}><FaSave />{t('common.save')}</Button>
                         <Button variant="cancel" onClick={handleCancelClick}><FaTimes />{t('common.cancel')}</Button>
                       </div>
                     </td>
                   </>
                  ) : (
                    <>
                      {/* ADD data-label TO EACH CELL IN THE READ-ONLY ROW */}
                      <td data-label={t('common.name')}>{product.name}</td>
                      <td data-label={t('common.category')}>{product.category}</td>
                      <td data-label={t('common.stock')} style={product.stock <= 7 ? { color: 'red', fontWeight: 'bold' } : {}}>
                        {product.stock}
                      </td>
                      <td data-label={t('inventory.purchase_price')}>${product.purchasePrice?.toFixed(2)}</td>
                      <td data-label={t('inventory.selling_price')}>${product.sellingPrice?.toFixed(2)}</td>
                      <td data-label={t('common.actions')}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button variant="edit" onClick={() => handleEditClick(product)}><FaEdit /></Button>
                          <Button variant="delete" onClick={() => deleteProduct(product.id)}><FaTrash /></Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>{t('common.previous')}</button>
          <span>{t('common.page_of', {currentPage: currentPage, totalPages: totalPages > 0 ? totalPages : 1})}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage >= totalPages}>{t('common.next')}</button>
        </div>
        {filteredProducts.length === 0 && searchTerm && <p className={styles.emptyMessage}>{t('inventory.no_products_match')}</p>}
        {!products?.length && <p className={styles.emptyMessage}>{t('inventory.no_products_yet')}</p>}
      </div>
    </div>
  );
}

export default InventoryPage;