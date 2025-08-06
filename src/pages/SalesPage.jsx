// src/pages/SalesPage.jsx
import React, { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import styles from './SalesPage.module.css';
import { FaTimes } from 'react-icons/fa'; // 1. IMPORT: The 'X' icon for removing

function SalesPage() {
  const { products } = useProducts();
  const { addSale } = useSales();

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stock > 0
    );
  }, [products, searchTerm]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.sellingPrice * item.quantity, 0);
  }, [cart]);

  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // 2. NEW: Handler function to remove an item from the cart
  const handleRemoveFromCart = (productId) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      return alert("The cart is empty.");
    }
    const saleData = {
      items: cart,
      totalAmount: cartTotal,
    };
    addSale(saleData);
    setCart([]);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Left Panel: Product Grid (This part is unchanged) */}
      <div className={styles.productGrid}>
        <input
          type="text"
          placeholder="🔎 Search for products..."
          className={styles.searchBar}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className={styles.grid}>
          {filteredProducts.map(product => (
            <div key={product.id} className={styles.productCard} onClick={() => handleAddToCart(product)}>
              <h3>{product.name}</h3>
              <p>${product.sellingPrice.toFixed(2)}</p>
              <p>Stock: {product.stock}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Cart */}
      <div className={styles.cart}>
        <h2 className={styles.cartTitle}>Current Sale</h2>
        <ul className={styles.cartList}>
          {cart.map(item => (
            <li key={item.id} className={styles.cartItem}>
              <div>
                <span>{item.name}</span>
                <p>Qty: {item.quantity} x ${item.sellingPrice.toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <strong>${(item.quantity * item.sellingPrice).toFixed(2)}</strong>
                {/* 3. ADD: The remove button */}
                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  title="Remove item"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                >
                  <FaTimes />
                </button>
              </div>
            </li>
          ))}
          {cart.length === 0 && <p>Click on a product to add it to the sale.</p>}
        </ul>
        <div className={styles.cartTotal}>
          <div className={styles.totalRow}>
            <span>TOTAL</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <button className={styles.checkoutButton} onClick={handleCompleteSale}>
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
}

export default SalesPage;