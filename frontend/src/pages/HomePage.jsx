import React, { useState, useEffect } from 'react';
import api from '../api'; // Kurir API yang kita buat di Tahap 3.5
import BookCard from '../components/BookCard.jsx'; // Kartu buku kita
import { FaSpinner } from 'react-icons/fa'; // Ikon untuk loading

const HomePage = () => {
  // Siapkan "wadah" untuk menyimpan data buku
  const [books, setBooks] = useState([]);
  // Status untuk loading & error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gunakan useEffect untuk mengambil data TEPAT SAAT halaman dibuka
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Panggil API backend kita
        const response = await api.get('/books');

        // Simpan data buku (responsnya ada di dalam response.data.data)
        setBooks(response.data.data);
        setIsLoading(false);
      } catch (err) {
        // Tangani jika terjadi error
        setError('Gagal memuat data buku.');
        console.error(err);
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []); // Array kosong berarti "jalankan ini 1x saja saat komponen dimuat"

  // --- Tampilan Kondisional ---

  // 1. Tampilan saat LOADING
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-600" size={40} />
        <span className="ml-3 text-lg text-gray-700">Memuat buku...</span>
      </div>
    );
  }

  // 2. Tampilan saat ERROR
  if (error) {
    return (
      <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  // 3. Tampilan SUKSES (data didapat)
  return (
    <div>
      {/* Ini adalah Hero Section (seperti di gambar Anda) */}
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

      {/* Judul Grid */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Rekomendasi Buku
      </h2>

      {/* Grid Buku */}
      {books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          Belum ada buku yang tersedia.
        </p>
      )}
    </div>
  );
};

export default HomePage;