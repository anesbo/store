// src/hooks/useSales.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import toast from 'react-hot-toast';

export function useSales() {
  const sales = useLiveQuery(() => db.sales.toArray(), []);

  const addSale = async (saleData) => {
    const { items, totalAmount } = saleData;
    try {
      await db.transaction('rw', db.sales, db.products, async () => {
        await db.sales.add({
          items,
          totalAmount,
          timestamp: new Date(),
        });
        for (const item of items) {
          await db.products.where('id').equals(item.id).modify(product => {
            product.stock -= item.quantity;
          });
        }
      });
      toast.success('Sale completed successfully!');
    } catch (error) {
      console.error("Failed to complete sale:", error);
      toast.error('Failed to complete sale. Stock not updated.');
    }
  };

  const deleteSale = async (saleId) => {
    if (!window.confirm("Are you sure? This will restore the stock of the items sold.")) {
      return;
    }
    try {
      await db.transaction('rw', db.sales, db.products, async () => {
        const saleToDelete = await db.sales.get(saleId);
        if (!saleToDelete) throw new Error("Sale not found.");
        for (const item of saleToDelete.items) {
          await db.products.where('id').equals(item.id).modify(product => {
            product.stock += item.quantity;
          });
        }
        await db.sales.delete(saleId);
      });
      toast.success('Sale deleted and stock restored!');
    } catch (error) {
      console.error("Failed to delete sale:", error);
      toast.error('Failed to delete sale.');
    }
  };

  const updateSale = async (saleId, updatedItems, newTotalAmount) => {
    try {
      await db.transaction('rw', db.sales, db.products, async () => {
        const originalSale = await db.sales.get(saleId);
        if (!originalSale) throw new Error("Original sale not found");

        for (const item of originalSale.items) {
          await db.products.where('id').equals(item.id).modify(p => { p.stock += item.quantity; });
        }

        for (const item of updatedItems) {
          await db.products.where('id').equals(item.id).modify(p => { p.stock -= item.quantity; });
        }
        
        await db.sales.update(saleId, {
          items: updatedItems,
          totalAmount: newTotalAmount
        });
      });
      toast.success('Sale updated successfully!');
    } catch (error) {
      console.error("Failed to update sale:", error);
      toast.error('Failed to update sale.');
    }
  };

  return { sales, addSale, deleteSale, updateSale };
}