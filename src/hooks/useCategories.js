// src/hooks/useCategories.js

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export function useCategories() {
  // Get a live list of all categories, sorted by name
  const categories = useLiveQuery(() => db.categories.orderBy('name').toArray(), []);

  // Function to add a new category
  const addCategory = async (name) => {
    try {
      await db.categories.add({ name });
    } catch (error) {
      console.error("Failed to add category:", error);
      alert("A category with this name may already exist.");
    }
  };

  // Function to update an existing category's name
  const updateCategory = async (id, newName) => {
    try {
      await db.categories.update(id, { name: newName });
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };
  
  // Function to delete a category
  const deleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await db.categories.delete(id);
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };

  return { categories, addCategory, updateCategory, deleteCategory };
}