import React, { useState, useEffect } from 'react';
import api from '../api';
import BookCard from '../components/BookCard.jsx';
import { FaSpinner, FaSearch } from 'react-icons/fa';

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(''); 

  // Mengambil daftar Kategori (1x)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data); 
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
      }
    };
    fetchCategories();
  }, []);

  // Debounce untuk Search Term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); 
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]); 

  // Mengambil Buku (setiap kali filter berubah)
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true); 
      setError(null);
      try {
        const response = await api.get('/books', {
          params: {
            search: debouncedSearchTerm,
            category_id: selectedCategory, 
          }
        });
        setBooks(response.data.data);
      } catch (err) {
        setError('Gagal memuat data buku.');
        console.error(err);
      }
      setIsLoading(false);
    };
    fetchBooks();
  }, [debouncedSearchTerm, selectedCategory]); // <-- Panggil ulang jika 2 state ini berubah

  // Tampilan Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-600" size={40} />
        <span className="ml-3 text-lg text-gray-700">Memuat buku...</span>
      </div>
    );
  }

  // Tampilan Utama
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 md:p-12 rounded-lg shadow-lg mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Temukan Buku Favoritmu
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mb-6">
          Jelajahi ribuan judul dari berbagai kategori terbaik.
        </p>
        <button className="bg-white text-blue-700 font-semibold px-6 py-2 rounded-full hover:bg-gray-100 transition-colors">
          Mulai Belanja
        </button>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 m-0 whitespace-nowrap">
          Rekomendasi Buku
        </h2>
        <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <input 
              type="text"
              placeholder="Cari judul buku..."
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 border rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {/* Dropdown Kategori */}
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-48 px-4 py-2 border rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tampilan Error (jika ada) */}
      {error && !isLoading && (
         <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg mb-4">
           {error}
         </div>
      )}

      {/* Grid Buku */}
      {!isLoading && books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        // Tampilan jika tidak ada buku
        !isLoading && !error && (
          <p className="text-center text-gray-500 py-10">
            {(debouncedSearchTerm || selectedCategory)
              ? `Buku tidak ditemukan.`
              : "Belum ada buku yang tersedia."
            }
          </p>
        )
      )}
    </div>
  );
};

export default HomePage;