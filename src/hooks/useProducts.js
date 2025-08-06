// src/hooks/useProducts.js

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import toast from 'react-hot-toast'; 

export function useProducts() {
  const products = useLiveQuery(() => db.products.toArray(), []);

  const addProduct = async (productData) => {
    try {
      await db.products.add(productData);
      toast.success('Product added successfully!'); // Success feedback
    } catch (error) {
      console.error("Failed to add product:", error);
      toast.error('Failed to add product.'); // Error feedback
    }
  };

  // NEW: Function to update an existing product
  const updateProduct = async (id, updates) => {
    try {
      await db.products.update(id, updates);
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  // NEW: Function to delete a product
  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await db.products.delete(id);
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  // EXPORT the new functions
  return { products, addProduct, updateProduct, deleteProduct };
}