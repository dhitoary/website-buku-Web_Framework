import React from 'react';
import { Outlet } from 'react-router-dom';

// Komponen Navbar (masih placeholder)
const Navbar = () => (
  <header className="bg-white shadow-md sticky top-0 z-50">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-gray-800">Bookstore</div>
      <div className="flex space-x-4">
        <a href="#" className="text-gray-600 hover:text-gray-800">Home</a>
        <a href="#" className="text-gray-600 hover:text-gray-800">Masuk</a>
        <a href="#" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Daftar
        </a>
      </div>
    </nav>
  </header>
);

// Komponen Footer (masih placeholder)
const Footer = () => (
  <footer className="bg-gray-100 mt-auto">
    <div className="container mx-auto px-6 py-4 text-center text-gray-600">
      © 2025 Bookstore. All rights reserved.
    </div>
  </footer>
);

// Layout Utama
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-6 py-8">
        {/* Halaman (seperti HomePage) akan dirender di sini */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;