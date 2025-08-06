// src/pages/InventoryPage.jsx

// 1. MAKE SURE you import your reusable Button component
import React, { useState, useMemo } from 'react';
import Button from '../components/ui/Button'; // Assuming this file exists from our previous discussion
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import styles from './InventoryPage.module.css';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

// 2. The Button component function has been REMOVED from here. It must be in its own file.

function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();

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
      <h1 className={styles.title}>Inventory Management</h1>

      {/* Add Product Form */}
      <div className={styles.card}>
        <h2 className={styles.formTitle}>Add New Product</h2>
        <form onSubmit={handleAddSubmit} className={styles.formGrid}>
          <input name="name" type="text" placeholder="Product Name" value={newProduct.name} onChange={handleNewProductChange} className={styles.formInput} />
          <input name="purchasePrice" type="number" placeholder="Purchase Price ($)" value={newProduct.purchasePrice} onChange={handleNewProductChange} className={styles.formInput} />
          <input name="sellingPrice" type="number" placeholder="Selling Price ($)" value={newProduct.sellingPrice} onChange={handleNewProductChange} className={styles.formInput} />
          <input name="stock" type="number" placeholder="Stock Quantity" value={newProduct.stock} onChange={handleNewProductChange} className={styles.formInput} />
          <select name="category" value={newProduct.category} onChange={handleNewProductChange} className={styles.formInput}>
            <option value="">-- Select a Category --</option>
            {categories?.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
          </select>
          {/* 4. FIXED: Use the reusable Button component */}
          <Button type="submit" variant="save"><FaPlus /> Add Product</Button>
        </form>
      </div>

      {/* Product List */}
      {/* 5. RESTRUCTURED: Removed the extra nested card */}
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className={styles.formTitle}>Product List</h2>
          <input type="text" placeholder="🔎 Search by name or category..." value={searchTerm} onChange={handleSearchChange} className={styles.formInput} style={{ maxWidth: '300px' }}/>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Purchase Price</th>
                <th>Selling Price</th>
                <th style={{ width: '220px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => (
                <tr key={product.id}>
                  {editingId === product.id ? (
                    <>
                      {/* Editing Row Inputs */}
                      <td><input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className={styles.formInput} /></td>
                      <td>
                        <select name="category" value={editFormData.category} onChange={handleEditFormChange} className={styles.formInput}>
                          {categories?.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
                        </select>
                      </td>
                      <td><input type="number" name="stock" value={editFormData.stock} onChange={handleEditFormChange} className={styles.formInput} style={{ maxWidth: '80px' }} /></td>
                      <td><input type="number" name="purchasePrice" value={editFormData.purchasePrice} onChange={handleEditFormChange} className={styles.formInput} style={{ maxWidth: '100px' }} /></td>
                      <td><input type="number" name="sellingPrice" value={editFormData.sellingPrice} onChange={handleEditFormChange} className={styles.formInput} style={{ maxWidth: '100px' }} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button variant="save" onClick={handleUpdateClick}><FaSave />Save</Button>
                          <Button variant="cancel" onClick={handleCancelClick}><FaTimes />Cancel</Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      {/* Read-Only Row Data */}
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td style={product.stock <= 7 ? { color: 'red', fontWeight: 'bold' } : {}}>{product.stock}</td>
                      <td>${product.purchasePrice?.toFixed(2)}</td>
                      <td>${product.sellingPrice?.toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button variant="edit" onClick={() => handleEditClick(product)}><FaEdit />Edit</Button>
                          <Button variant="delete" onClick={() => deleteProduct(product.id)}><FaTrash />Delete</Button>
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
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>&larr; Previous</button>
          <span>Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage >= totalPages}>Next &rarr;</button>
        </div>
        {filteredProducts.length === 0 && searchTerm && <p className={styles.emptyMessage}>No products match your search.</p>}
        {!products?.length && <p className={styles.emptyMessage}>No products yet. Add one above!</p>}
      </div>
    </div>
  );
}

export default InventoryPage;