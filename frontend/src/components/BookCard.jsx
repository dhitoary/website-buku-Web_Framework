import React, { useState } from 'react';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// --- FUNGSI YANG HILANG (KITA KEMBALIKAN) ---
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};
// ---------------------------------------------

const BookCard = ({ book }) => {
  const category = book.categories?.[0]?.name || 'Tanpa Kategori';
  const author = book.authors?.[0]?.name || 'Penulis Tidak Diketahui';

  const { addToCart, loading: isCartLoading } = useCart();
  const { user } = useAuth(); 
  const navigate = useNavigate(); 
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault(); 
    if (!user) {
      navigate('/login'); 
      return; 
    }
    setIsAdding(true); 
    try {
      await addToCart(book.id); 
    } catch (error) {
      console.error(error); 
    }
    setIsAdding(false); 
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col">
      <Link to={`/book/${book.id}`} className="flex flex-col flex-grow">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={book.cover_image || 'https://via.placeholder.com/300x400?text=No+Cover'}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 flex flex-col justify-between flex-grow">
          <div>
            <span className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
              {category}
            </span>
            <h3 className="text-md font-bold text-gray-800 line-clamp-2 mb-1">
              {book.title}
            </h3>
            <p className="text-sm text-gray-500 mb-2">{author}</p>
          </div>
          <div>
            {/* PANGGILAN FUNGSI YANG ERROR ADA DI SINI */}
            <p className="text-lg font-bold text-blue-600 mb-3">
              {formatRupiah(book.price)}
            </p>
          </div>
        </div>
      </Link>
      <div className="p-4 pt-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleAddToCart} 
            disabled={isAdding || isCartLoading || book.stock === 0} 
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center space-x-1
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaShoppingCart />
            <span>
              {isAdding 
                ? '...' 
                : book.stock === 0
                  ? 'Habis'
                  : 'Keranjang'}
            </span>
          </button>
          <button className="text-gray-400 p-2 rounded-md hover:bg-gray-100 hover:text-red-500">
            <FaHeart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;