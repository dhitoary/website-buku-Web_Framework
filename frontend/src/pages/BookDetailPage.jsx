import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { FaSpinner, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext';

// --- FUNGSI YANG HILANG (KITA KEMBALIKAN) ---
const formatRupiah = (number) => {
  if (isNaN(number)) return "Harga tidak valid";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};
// ---------------------------------------------

const BookDetailPage = () => {
  const { id } = useParams(); 
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, loading: isCartLoading } = useCart();
  const { user } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/books/${id}`);
        setBook(response.data.data); 
      } catch (err) {
        console.error(err);
        setError('Gagal memuat detail buku. Buku mungkin tidak ditemukan.');
      }
      setLoading(false);
    };
    fetchBook();
  }, [id]); 

  const handleAddToCartClick = () => {
    if (!user) {
      navigate('/login'); 
      return; 
    }
    addToCart(book.id);
  };

  // ... (Tampilan Loading, Error, !book tidak berubah) ...
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin text-blue-600" size={50} />
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
  if (!book) {
    return <div className="text-center text-gray-500">Buku tidak ditemukan.</div>;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 flex-shrink-0">
          <img
            src={book.cover_image || 'https://via.placeholder.com/400x600?text=No+Cover'}
            alt={book.title}
            className="w-full aspect-[3/4] object-cover rounded-lg shadow-md mb-4"
          />
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleAddToCartClick}
              disabled={isCartLoading || book.stock === 0}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2
                         disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FaShoppingCart />
              <span>
                {isCartLoading 
                  ? 'Menambahkan...' 
                  : book.stock === 0 
                    ? 'Stok Habis' 
                    : 'Tambah ke Keranjang'}
              </span>
            </button>
            <button className="text-gray-400 p-3 rounded-lg hover:bg-gray-100 hover:text-red-500 border">
              <FaHeart size={24} />
            </button>
          </div>
        </div>
        <div className="w-full md:w-2/3">
          <div className="mb-2">
            {book.categories?.map(cat => (
              <span key={cat.id} className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-3 py-1 rounded-full mr-2">
                {cat.name}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {book.title}
          </h1>
          <div className="text-lg text-gray-600 mb-4">
            oleh <span className="font-medium text-gray-800">
              {book.authors?.map(author => author.name).join(', ') || 'Penulis Tidak Diketahui'}
            </span>
          </div>
          {/* PANGGILAN FUNGSI YANG ERROR ADA DI SINI */}
          <div className="text-4xl font-bold text-blue-600 mb-6">
            {formatRupiah(book.price)}
          </div>
          {book.stock > 0 ? (
            <div className="text-green-600 font-medium mb-6">
              Stok tersedia ({book.stock} buah)
            </div>
          ) : (
            <div className="text-red-600 font-medium mb-6">
              Stok habis
            </div>
          )}
          <div className="border-t border-b border-gray-200 py-4 mb-6">
            <h3 className="text-xl font-semibold mb-3">Detail Buku</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Penerbit:</strong> {book.publisher?.name || '-'}</li>
              <li><strong>Tahun Terbit:</strong> {book.year_published || '-'}</li>
              <li><strong>ISBN:</strong> {book.isbn || '-'}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Deskripsi</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {book.description || 'Tidak ada deskripsi.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BookDetailPage;