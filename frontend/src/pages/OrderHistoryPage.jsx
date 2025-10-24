import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { FaSpinner, FaEye } from 'react-icons/fa';

// Helper formatRupiah
const formatRupiah = (number) => {
  if (isNaN(number)) return "Harga tidak valid";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

// Helper untuk status pesanan
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

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Pengaman & Pengambilan Data ---
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Panggil API GET /api/orders
        const response = await api.get('/orders');
        setOrders(response.data.data); // data.data karena ini koleksi
      } catch (err) {
        console.error(err);
        setError('Gagal memuat riwayat pesanan.');
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user, navigate]);


  // --- Tampilan Loading ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // --- Tampilan Error ---
  if (error) {
    return (
      <div className="text-center text-red-500 bg-red-100 p-6 rounded-lg">
        {error}
      </div>
    );
  }

  // --- Tampilan Utama ---
  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Riwayat Pesanan Saya
      </h1>

      {/* Tampilan Jika Tidak Ada Pesanan */}
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg mb-4">Anda belum memiliki riwayat pesanan.</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        // Tampilan Tabel Riwayat Pesanan
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Pesanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Pembayaran
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">#{order.order_code}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.created_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatRupiah(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-3 py-1 inline-flex text-xs leading-5
                                 font-semibold rounded-full capitalize
                                 ${getStatusClass(order.payment_status)}`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Tombol ini akan link ke Halaman Detail Pesanan */}
                    <Link 
                      to={`/order/${order.id}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Lihat Detail"
                    >
                      <FaEye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;