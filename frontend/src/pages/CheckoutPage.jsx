import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { FaSpinner } from 'react-icons/fa';

// Helper formatRupiah
const formatRupiah = (number) => {
  if (isNaN(number)) return "Harga tidak valid";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, loading: cartLoading, fetchCart } = useCart();
  const navigate = useNavigate();

  // State untuk alamat
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // State untuk metode pembayaran
  const [paymentMethod, setPaymentMethod] = useState('');

  // State untuk proses checkout
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- Pengaman & Pengambilan Data ---
  useEffect(() => {
    // 1. Cek jika tidak login
    if (!user) {
      navigate('/login');
      return;
    }

    // 2. Ambil alamat user
    const fetchAddresses = async () => {
      try {
        const response = await api.get('/addresses');
        setAddresses(response.data.data);
        // Otomatis pilih alamat pertama jika ada
        if (response.data.data.length > 0) {
          setSelectedAddressId(response.data.data[0].id);
        }
      } catch (err) {
        console.error(err);
        setError('Gagal memuat alamat.');
      }
      setLoadingAddresses(false);
    };

    fetchAddresses();
  }, [user, navigate]);

  // --- Handler untuk Proses Checkout ---
  const handleCheckout = async (e) => {
    e.preventDefault();
    setError(null);

    // Validasi
    if (!selectedAddressId) {
      setError('Silakan pilih alamat pengiriman.');
      return;
    }
    if (!paymentMethod) {
      setError('Silakan pilih metode pembayaran.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Panggil API POST /api/checkout
      const response = await api.post('/checkout', {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
      });

      // Jika berhasil:
      alert('Checkout berhasil! Pesanan Anda sedang diproses.');

      // Kosongkan keranjang di frontend (backend sudah melakukannya)
      await fetchCart(); 

      // Arahkan ke Halaman Riwayat Pembelian (yang belum kita buat)
      // Untuk sekarang, kita arahkan ke Halaman Profile
      navigate('/profile'); 

    } catch (err) {
      console.error(err);
      // Tangani error (misal: keranjang kosong, stok habis, dll)
      setError(err.response?.data?.message || 'Terjadi kesalahan saat checkout.');
    }
    setIsSubmitting(false);
  };

  // --- Tampilan Loading / Error ---
  if (cartLoading || loadingAddresses) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // --- Tampilan Jika Keranjang Kosong ---
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Keranjang Anda Kosong</h2>
        <p className="text-gray-600 mb-6">
          Anda tidak bisa checkout dengan keranjang kosong.
        </p>
        <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
          Kembali Belanja
        </Link>
      </div>
    );
  }

  // --- Tampilan Jika User Belum Punya Alamat ---
  if (addresses.length === 0) {
    return (
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Alamat Pengiriman Dibutuhkan</h2>
        <p className="text-gray-600 mb-6">
          Anda harus menambahkan alamat di profil Anda sebelum bisa checkout.
        </p>
        <Link to="/profile" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
          Pergi ke Halaman Profile
        </Link>
      </div>
    );
  }

  // --- Tampilan Checkout Utama ---
  return (
    <form onSubmit={handleCheckout} className="flex flex-col lg:flex-row gap-8">

      {/* Kolom Kiri: Alamat & Pembayaran */}
      <div className="w-full lg:w-2/3">
        {/* Bagian Alamat */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">1. Pilih Alamat Pengiriman</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {addresses.map((addr) => (
              <label key={addr.id} className="flex items-center p-3 border rounded-lg cursor-pointer">
                <input 
                  type="radio" 
                  name="address"
                  value={addr.id}
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  className="mr-3"
                />
                <div>
                  <span className="font-semibold">{addr.label}</span>
                  <p className="text-sm">{addr.recipient_name}, {addr.phone_number}</p>
                  <p className="text-sm text-gray-600">{addr.address_line1}, {addr.city}</p>
                </div>
              </label>
            ))}
          </div>
          <Link to="/profile" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            + Kelola Alamat
          </Link>
        </div>

        {/* Bagian Metode Pembayaran */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">2. Pilih Metode Pembayaran</h2>
          <div className="space-y-3">
            {/* (Ini bisa di-fetch dari API nanti, untuk sekarang kita hardcode) */}
            <label className="flex items-center p-3 border rounded-lg cursor-pointer">
              <input 
                type="radio" 
                name="payment"
                value="manual_transfer"
                checked={paymentMethod === 'manual_transfer'}
                onChange={() => setPaymentMethod('manual_transfer')}
                className="mr-3"
              />
              <span>Transfer Bank (Manual)</span>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer">
              <input 
                type="radio" 
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="mr-3"
              />
              <span>Cash on Delivery (COD)</span>
            </label>
            {/* (Tambahkan Payment Gateway di sini) */}
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Ringkasan Pesanan (Detail Pembelian) */}
      <div className="w-full lg:w-1/3">
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            Ringkasan Pesanan
          </h2>
          {/* Detail Buku */}
          <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
            {cart.items.map(item => (
              <div key={item.id} className="flex gap-3">
                <img 
                  src={item.book.cover_image} 
                  alt={item.book.title} 
                  className="w-16 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold line-clamp-2">{item.book.title}</p>
                  <p className="text-xs text-gray-500">Jumlah: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{formatRupiah(item.book.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Jumlah Buku</span>
              <span className="font-medium">{cart.total_items} buah</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total Harga</span>
              <span>{formatRupiah(cart.total_price)}</span>
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white mt-4 py-3 rounded-lg font-semibold
                         hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Memproses Pesanan...' : 'Bayar Sekarang'}
            </button>
          </div>
        </div>
      </div>

    </form>
  );
};

export default CheckoutPage;