import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaSpinner, FaTrash } from 'react-icons/fa';

// Helper function untuk format mata uang
const formatRupiah = (number) => {
  if (isNaN(number)) return "Harga tidak valid";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

const CartPage = () => {
  const { user } = useAuth(); // Untuk cek otentikasi
  const { cart, loading, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  // --- Pengaman ---
  // Jika user tidak sengaja sampai sini (misal, ketik URL)
  // padahal belum login, lempar ke Halaman Login.
  if (!user) {
    navigate('/login');
    return null; // Jangan render apapun
  }

  // --- Tampilan Loading ---
  // Ini adalah 'loading' global dari CartContext
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-600" size={40} />
        <span className="ml-3 text-lg text-gray-700">Memuat keranjang...</span>
      </div>
    );
  }

  // --- Tampilan Keranjang Kosong ---
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Keranjang Anda Kosong</h2>
        <p className="text-gray-600 mb-6">
          Sepertinya Anda belum menambahkan buku apa pun.
        </p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  // --- Tampilan Keranjang Berisi ---
  return (
    <div className="flex flex-col lg:flex-row gap-8">

      {/* Kolom Kiri: Daftar Item (70%) */}
      <div className="w-full lg:w-2/3">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>
          <div className="space-y-4">
            {/* Loop semua item di keranjang */}
            {cart.items.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row items-center gap-4 border-b pb-4">
                {/* Gambar */}
                <img 
                  src={item.book.cover_image || 'https://via.placeholder.com/100x150'} 
                  alt={item.book.title}
                  className="w-24 h-36 object-cover rounded"
                />
                {/* Info */}
                <div className="flex-1">
                  <Link to={`/book/${item.book.id}`} className="text-lg font-semibold hover:text-blue-600">
                    {item.book.title}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {item.book.authors?.map(a => a.name).join(', ') || 'Penulis'}
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {formatRupiah(item.book.price)}
                  </p>
                </div>
                {/* Aksi (Kuantitas & Hapus) */}
                <div className="flex items-center gap-4">
                  <input 
                    type="number"
                    min="1"
                    max={item.book.stock} // Batasi maks sesuai stok
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="w-16 text-center border rounded-md px-2 py-1"
                    aria-label="Kuantitas"
                  />
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Hapus item"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Ringkasan Pesanan (30%) */}
      <div className="w-full lg:w-1/3">
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            Ringkasan Pesanan
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Item</span>
              <span className="font-medium">{cart.total_items} buah</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatRupiah(cart.total_price)}</span>
            </div>
            {/* Tambahkan biaya kirim/diskon di sini jika ada */}
          </div>
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Harga</span>
              <span>{formatRupiah(cart.total_price)}</span>
            </div>
            <button 
              // Nanti ini akan mengarah ke Halaman Checkout
              onClick={() => navigate('/checkout')} 
              className="w-full bg-blue-600 text-white mt-6 py-3 rounded-lg font-semibold
                         hover:bg-blue-700"
            >
              Lanjut ke Checkout
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CartPage;