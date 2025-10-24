import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext'; // Kita butuh Auth untuk tahu siapa user-nya

// 1. Buat Konteks
const CartContext = createContext();

// 2. Buat "Provider" (Penyedia) Konteks
export const CartProvider = ({ children }) => {
  // 'cart' akan berisi data dari API (termasuk total_price, items, dll)
  const [cart, setCart] = useState(null); 
  const [loading, setLoading] = useState(false); // Untuk loading aksi (tambah/hapus)

  // Ambil status login dari AuthContext
  const { user } = useAuth();

  // 3. Fungsi untuk mengambil data keranjang dari backend
  const fetchCart = async () => {
    try {
      // Panggil API GET /api/cart yang sudah kita buat
      const response = await api.get('/cart');
      setCart(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil keranjang:', error);
      // Jika user baru login & belum punya keranjang, API mungkin 404
      // atau jika user logout, kita set null
      setCart(null);
    }
  };

  // 4. Ambil data keranjang saat user login, dan hapus saat user logout
  useEffect(() => {
    if (user) {
      // Jika user login, ambil keranjangnya
      fetchCart();
    } else {
      // Jika user logout, kosongkan keranjang di state
      setCart(null);
    }
  }, [user]); // Jalankan ulang setiap kali status 'user' berubah

  // --- Fungsi-fungsi Aksi ---

  // 5. Fungsi untuk MENAMBAH item ke keranjang
  const addToCart = async (bookId, quantity = 1) => {
    if (!user) {
  console.log("User belum login, abaikan penambahan keranjang.");
  return; // Hentikan fungsi secara diam-diam
}

    setLoading(true);
    try {
      // Panggil API POST /api/cart/items
      const response = await api.post('/cart/items', {
        book_id: bookId,
        quantity: quantity,
      });
      // Update state keranjang dengan data terbaru dari respons
      setCart(response.data.data); 
    } catch (error) {
      console.error('Gagal menambah ke keranjang:', error);
      alert('Gagal menambah ke keranjang.');
    }
    setLoading(false);
  };

  // 6. Fungsi untuk MENGHAPUS item dari keranjang
  const removeFromCart = async (itemId) => {
    setLoading(true);
    try {
      // Panggil API DELETE /api/cart/items/{itemId}
      const response = await api.delete(`/cart/items/${itemId}`);
      setCart(response.data.data); // Update state
    } catch (error) {
      console.error('Gagal menghapus item:', error);
      alert('Gagal menghapus item.');
    }
    setLoading(false);
  };

  // 7. Fungsi untuk MENGUBAH Kuantitas
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return removeFromCart(itemId); // Hapus jika qty 0

    setLoading(true);
    try {
      // Panggil API PUT /api/cart/items/{itemId}
      const response = await api.put(`/cart/items/${itemId}`, {
        quantity: quantity,
      });
      setCart(response.data.data); // Update state
    } catch (error) {
      console.error('Gagal mengubah kuantitas:', error);
      alert('Gagal mengubah kuantitas.');
    }
    setLoading(false);
  };

  // 8. Kirim semua state dan fungsi ke "children"
  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        loading,
        addToCart, 
        removeFromCart, 
        updateQuantity,
        fetchCart // Kita kirim ini juga untuk refresh manual
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 9. Buat "Hook" kustom agar gampang dipakai
export const useCart = () => {
  return useContext(CartContext);
};