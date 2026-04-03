// frontend/src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../api/client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const Ctx = createContext(null);

export function CartProvider({ children }) {
  const { user }            = useAuth();
  const [items,   setItems] = useState([]);
  const [loading, setLoad]  = useState(false);

  useEffect(() => {
    if (user) {
      setLoad(true);
      cartAPI.get()
        .then(r => setItems(r.data.items || []))
        .catch(() => setItems([]))
        .finally(() => setLoad(false));
    } else { setItems([]); }
  }, [user]);

  const cartCount = items.reduce((s, i) => s + i.qty, 0);
  const subtotal  = items.reduce((s, i) => s + parseFloat(i.unit_price) * i.qty, 0);
  const shipping  = subtotal >= 150 ? 0 : (subtotal > 0 ? 12 : 0);
  const total     = subtotal + shipping;

  const addItem = useCallback(async (productId, qty=1, size=null, colorHex=null) => {
    if (!user) { toast.error('Please sign in first'); return false; }
    try {
      const { data } = await cartAPI.addItem({ productId, qty, size, colorHex });
      setItems(data.items);
      toast.success('Added to cart! 🛒');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
      return false;
    }
  }, [user]);

  const updateItem = useCallback(async (itemId, qty) => {
    try { const { data } = await cartAPI.updateItem(itemId, { qty }); setItems(data.items); }
    catch { toast.error('Could not update cart'); }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try { const { data } = await cartAPI.removeItem(itemId); setItems(data.items); toast.success('Removed'); }
    catch { toast.error('Could not remove item'); }
  }, []);

  const clearCart = useCallback(async () => {
    try { await cartAPI.clear(); setItems([]); }
    catch { setItems([]); }
  }, []);

  return (
    <Ctx.Provider value={{
      items, loading, cartCount,
      subtotal: +subtotal.toFixed(2),
      shipping,
      total: +total.toFixed(2),
      addItem, updateItem, removeItem, clearCart,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => useContext(Ctx);
