// src/hooks/useSales.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import toast from 'react-hot-toast';

export function useSales() {
  const sales = useLiveQuery(() => db.sales.toArray(), []);

  const addSale = async (saleData) => {
    const { items, totalAmount } = saleData;

    try {
      // Use a transaction to ensure both operations succeed or fail together
      await db.transaction('rw', db.sales, db.products, async () => {
        // 1. Add the new sale record
        await db.sales.add({
          items,
          totalAmount,
          timestamp: new Date(),
        });

        // 2. Update the stock for each product sold
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

  return { sales, addSale };
}