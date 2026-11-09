import React from 'react';
import { addCartItem, clearCart as clearRemoteCart, getCart, removeCartItem, updateCartItem } from '../services/cartService';
import { getAccessToken } from '../utils/authStorage';
import { useToast } from './ToastContext';
export const CartContext = React.createContext({ items: [], loading: false, addItem: () => {}, removeItem: () => {}, updateQuantity: () => {}, clear: () => {} });
export function CartProvider({ children }) {
  const [items, setItems] = React.useState(() => { try { return JSON.parse(localStorage.getItem('fresh-cart') || '[]'); } catch { return []; } });
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();
  const sync = React.useCallback((cart) => { const next = (cart?.items || []).map(({ product, quantity }) => ({ ...product, id: product._id, quantity })); setItems(next); return next; }, []);
  React.useEffect(() => { localStorage.setItem('fresh-cart', JSON.stringify(items)); }, [items]);
  React.useEffect(() => { if (!getAccessToken()) return undefined; let active = true; setLoading(true); getCart().then(({ data }) => { if (active) sync(data.data); }).catch(() => {}).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [sync]);
  const addItem = async (item) => { if (!getAccessToken()) return { requiresAuth: true }; setLoading(true); try { const { data } = await addCartItem({ product: item.id || item._id, quantity: item.quantity || 1 }); sync(data.data); toast.success('Đã thêm sản phẩm vào giỏ'); return data.data; } catch (error) { toast.error(error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ'); throw error; } finally { setLoading(false); } };
  const removeItem = async (id) => { setLoading(true); try { const { data } = await removeCartItem(id); sync(data.data); } finally { setLoading(false); } };
  const updateQuantity = async (id, quantity) => { if (quantity < 1) return removeItem(id); setLoading(true); try { const { data } = await updateCartItem({ product: id, quantity }); sync(data.data); } finally { setLoading(false); } };
  const clear = async () => { setLoading(true); try { const { data } = await clearRemoteCart(); sync(data.data); } finally { setLoading(false); } };
  return <CartContext.Provider value={{ items, loading, addItem, removeItem, updateQuantity, clear }}>{children}</CartContext.Provider>;
}
