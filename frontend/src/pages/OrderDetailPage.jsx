import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FaSpinner } from 'react-icons/fa';

// --- Helper Functions (Kita copy dari halaman sebelumnya) ---
const formatRupiah = (number) => {
  if (isNaN(number)) return "Harga tidak valid";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
// --- Akhir Helper Functions ---

const OrderDetailPage = () => {
  const { id } = useParams(); // Ambil 'id' dari URL
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Pengaman & Pengambilan Data ---
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        // Panggil API GET /api/orders/{id}
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.data); // data tunggal
      } catch (err) {
        console.error(err);
        setError('Gagal memuat detail pesanan.');
      }
      setLoading(false);
    };

    fetchOrder();
  }, [id, user, navigate]); // Jalankan ulang jika ID atau user berubah


  // --- Tampilan Loading / Error ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 bg-red-100 p-6 rounded-lg">
        {error}
      </div>
    );
  }

  if (!order) {
    return <div className="text-center text-gray-500">Pesanan tidak ditemukan.</div>;
  }

  // Variabel helper untuk alamat (karena disimpan sebagai JSON)
  const shipping = order.shipping_address;

  // --- Tampilan Utama Detail Pesanan ---
  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <Link to="/profile/orders" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Kembali ke Riwayat Pesanan
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Detail Pesanan #{order.order_code}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Dipesan pada: {order.created_at}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Kolom Kiri: Rincian Item (70%) */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Rincian Item</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b pb-4">
                <img 
                  src={item.book.cover_image} 
                  alt={item.book.title}
                  className="w-20 h-28 object-cover rounded"
                />
                <div className="flex-1">
                  <Link 
                    to={`/book/${item.book.id}`} 
                    className="font-semibold text-gray-800 hover:text-blue-600"
                  >
                    {item.book.title}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {item.book.authors?.map(a => a.name).join(', ') || 'Penulis'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Jumlah: {item.quantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    Harga Satuan: {formatRupiah(item.price)}
                  </p>
                </div>
                <p className="font-medium text-lg">
                  {formatRupiah(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Status & Alamat (30%) */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner sticky top-24 space-y-6">

            {/* Ringkasan Total */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Total Pesanan</h2>
              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status Pesanan</span>
                  <span 
                    className={`px-3 py-1 text-xs font-semibold rounded-full capitalize
                               ${getStatusClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pembayaran</span>
                  <span 
                    className={`px-3 py-1 text-xs font-semibold rounded-full capitalize
                               ${getStatusClass(order.payment_status)}`}
                  >
                    {order.payment_status}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2">
                  <span>Total</span>
                  <span>{formatRupiah(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Alamat Pengiriman */}
            {shipping && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Alamat Pengiriman</h2>
                <div className="text-sm text-gray-700 border-t pt-3 space-y-1">
                  <p className="font-medium">{shipping.recipient_name}</p>
                  <p>{shipping.phone_number}</p>
                  <p>{shipping.address_line1}</p>
                  <p>{shipping.city}, {shipping.province} {shipping.postal_code}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;