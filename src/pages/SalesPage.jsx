// src/pages/SalesPage.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import styles from './SalesPage.module.css';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import { FaTimes,FaShoppingCart } from 'react-icons/fa';

function SalesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { saleId } = useParams(); // Get the saleId from the URL
  const { products } = useProducts();
  const { sales, addSale, updateSale } = useSales();

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const parentRef = useRef();
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (saleId && sales) {
      const saleToEdit = sales.find(s => s.id === parseInt(saleId, 10));
      if (saleToEdit && Array.isArray(saleToEdit.items)) {
        setCart(saleToEdit.items);
      }
    } else {
      setCart([]); // Clear cart if it's a new sale
    }
  }, [saleId, sales]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stock > 0
    );
  }, [products, searchTerm]);

  const cartTotal = useMemo(() => {
    if (!cart) return 0;
    return cart.reduce((total, item) => total + (item.sellingPrice || 0) * item.quantity, 0);
  }, [cart]);
  
  const columnCount = containerWidth > 0 ? Math.max(1, Math.floor(containerWidth / 170)) : 1;
  const rowCount = Math.ceil(filteredProducts.length / columnCount);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 160,
    overscan: 5,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columnCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 170,
    overscan: 5,
  });

  if (products === undefined) {
    return <div style={{padding: '2rem'}}>Loading products...</div>;
  }

  const handleProductClick = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    if (currentQuantityInCart < product.stock) {
        setCart(currentCart => {
            if (existingItem) {
                return currentCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...currentCart, { ...product, quantity: 1 }];
            }
        });
    }
  };
  
  const handleOpenQuantityModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsModalOpen(true);
  };
  
  const handleAddToCartFromModal = () => {
    const qty = parseInt(quantity, 10);
    if (!selectedProduct || !qty || qty <= 0) return;
    const existingItem = cart.find(item => item.id === selectedProduct.id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    if (qty + currentQuantityInCart > selectedProduct.stock) {
        alert(`Cannot add ${qty} items. Only ${selectedProduct.stock - currentQuantityInCart} available.`);
        return;
    }
    setCart(currentCart => {
        if (existingItem) {
            return currentCart.map(item =>
                item.id === selectedProduct.id ? { ...item, quantity: item.quantity + qty } : item
            );
        } else {
            return [...currentCart, { ...selectedProduct, quantity: qty }];
        }
    });
    setIsModalOpen(false);
  };

  const handleRemoveFromCart = (productId) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) return alert("Cart is empty.");

    if (saleId) {
      updateSale(parseInt(saleId, 10), cart, cartTotal);
      setCart([]);
      navigate('/');
    } else {
      const saleData = { items: cart, totalAmount: cartTotal };
      addSale(saleData);
      setCart([]);
    }
  };

  return (
    <>
    <div className={styles.pageContainer}>
      <div className={styles.productGrid}>
        <input
          type="text"
          placeholder={t('sales.search_products')}
          className={styles.searchBar}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className={styles.gridContainer}>
          {filteredProducts.map(product => (
            <div key={product.id} className={styles.productCard}>
              <div onClick={() => handleProductClick(product)} style={{ cursor: 'pointer' }}>
                <h3>{product.name}</h3>
                <p>${(product.sellingPrice || 0).toFixed(2)}</p>
                <p>{t('common.stock')}: {product.stock}</p>
              </div>
              <Button variant="edit" onClick={() => handleOpenQuantityModal(product)} style={{ width: '100%', marginTop: '0.5rem' }}>
                {t('sales.add_multiple')}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div id='cart-section' className={styles.cart}>
        <h2 className={styles.cartTitle}>{saleId ? t('sales.edit_sale') : t('sales.current_sale')}</h2>
        <ul className={styles.cartList}>
          {cart.map(item => (
            <li key={item.id} className={styles.cartItem}>
              <div>
                <span>{item.name}</span>
                <p>{t('common.quantity')}: {item.quantity} x ${(item.sellingPrice || 0).toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <strong>${((item.quantity || 0) * (item.sellingPrice || 0)).toFixed(2)}</strong>
                <button onClick={() => handleRemoveFromCart(item.id)} title={t('sales.remove_item_tooltip')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                  <FaTimes />
                </button>
              </div>
            </li>
          ))}
          {cart.length === 0 && <p>{saleId ? t('sales.edit_cart_message') : t('sales.empty_cart_message')}</p>}
        </ul>
        <div className={styles.cartTotal}>
          <div className={styles.totalRow}>
            <span>{t('common.total')}</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <button className={styles.checkoutButton} onClick={handleCompleteSale}>
            {saleId ? t('sales.update_sale') : t('sales.complete_sale')}
          </button>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedProduct && (
          <div>
            <h2>{selectedProduct.name}</h2>
            <p>{t('sales.available_stock')}: {selectedProduct.stock}</p>
            <label htmlFor="quantity">{t('common.quantity')}:</label>
            <input
            style={{marginLeft:'0.5rem',marginRight:'0.5rem'}}
              id="quantity"
              type="number"
              min="1"
              max={selectedProduct.stock}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className={styles.searchBar}
              autoFocus
            />
            <Button variant="save" onClick={handleAddToCartFromModal} style={{ width: '100%' }}>{t('sales.add_to_sale')}</Button>
          </div>
        )}
      </Modal>
    </div>
    {cart.length > 0 && (
      <a href="#cart-section" className={styles.goToCartButton}>
        <FaShoppingCart />
        <span className={styles.cartBadge}>{cart.length}</span>
      </a>
    )}
    </>
  );
}

export default SalesPage;