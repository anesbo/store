// src/pages/SalesPage.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import styles from './SalesPage.module.css';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import { FaTimes } from 'react-icons/fa';

function SalesPage() {
  const { products } = useProducts();
  const { addSale } = useSales();

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stock > 0
    );
  }, [products, searchTerm]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.sellingPrice * item.quantity, 0);
  }, [cart]);

  const parentRef = useRef();
  const [containerWidth, setContainerWidth] = useState(0);

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
      <div className={styles.productGrid}>
        <input
          type="text"
          placeholder="🔎 Search for products..."
          className={styles.searchBar}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div ref={parentRef} className={styles.gridContainer}>
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: `${columnVirtualizer.getTotalSize()}px`, position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map(virtualRow => (
              <React.Fragment key={virtualRow.key}>
                {columnVirtualizer.getVirtualItems().map(virtualColumn => {
                  const index = virtualRow.index * columnCount + virtualColumn.index;
                  const product = filteredProducts[index];

                  if (!product) return null;

                  return (
                    <div
                      key={product.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${virtualColumn.size}px`,
                        height: `${virtualRow.size}px`,
                        transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                        padding: '0.5rem'
                      }}
                    >
                      <div className={styles.productCard}>
                        <div onClick={() => handleProductClick(product)} style={{cursor: 'pointer'}}>
                          <h3>{product.name}</h3>
                          <p>${product.sellingPrice.toFixed(2)}</p>
                          <p>Stock: {product.stock}</p>
                        </div>
                        <Button variant="edit" onClick={() => handleOpenQuantityModal(product)} style={{width:'100%', marginTop:'0.5rem'}}>Add Multiple</Button>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

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
                <button onClick={() => handleRemoveFromCart(item.id)} title="Remove item" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
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
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedProduct && (
            <div>
                <h2>{selectedProduct.name}</h2>
                <p>Available stock: {selectedProduct.stock}</p>
                <label htmlFor="quantity">Quantity:</label>
                <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className={styles.searchBar}
                    autoFocus
                />
                <Button variant="save" onClick={handleAddToCartFromModal} style={{width:'100%'}}>Add to Sale</Button>
            </div>
        )}
      </Modal>
    </div>
  );
}

export default SalesPage;