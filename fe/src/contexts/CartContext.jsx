import React from 'react';
export const CartContext = React.createContext({ items: [], addItem: () => {}, removeItem: () => {}, updateQuantity: () => {} });
export function CartProvider({ children }) {
  const [items, setItems] = React.useState(() => { try { return JSON.parse(localStorage.getItem('fresh-cart') || '[]'); } catch { return []; } });
  React.useEffect(() => localStorage.setItem('fresh-cart', JSON.stringify(items)), [items]);
  const addItem = (item) => setItems((current) => { const found = current.find((entry) => entry.id === item.id); return found ? current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + (item.quantity || 1) } : entry) : [...current, { ...item, quantity: item.quantity || 1 }]; });
  const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id));
  const updateQuantity = (id, quantity) => setItems((current) => quantity > 0 ? current.map((item) => item.id === id ? { ...item, quantity } : item) : current.filter((item) => item.id !== id));
  return <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity }}>{children}</CartContext.Provider>;
}
