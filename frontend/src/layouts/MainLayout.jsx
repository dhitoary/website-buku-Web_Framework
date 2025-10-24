import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { FaUserCircle, FaSignOutAlt, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext'; 

// --- 1. KOMPONEN NAVBAR (YANG SUDAH KITA UPDATE) ---
const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart(); 
  const navigate = useNavigate(); 
  
  const handleLogout = async () => {
    try {
      await logout(); 
      navigate('/'); 
    } catch (error) {
      console.error('Gagal logout:', error);
    }
  };

  const totalItems = (user && cart?.total_items) ? cart.total_items : 0;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        <Link to="/" className="text-2xl font-bold text-gray-800">
          Bookstore
        </Link>
        
        <div className="flex items-center space-x-4 md:space-x-6">
          
          <Link to="/" className="text-gray-600 hover:text-gray-800">
            Home
          </Link>
          
          <Link 
            to={user ? "/cart" : "/login"} 
            className="relative text-gray-600 hover:text-gray-800"
            aria-label="Keranjang Belanja"
          >
            <FaShoppingCart size={22} />
            {user && totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white
                               text-xs font-bold w-5 h-5 
                               rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          
          {user ? (
            // --- TAMPILAN JIKA SUDAH LOGIN ---
            <>
              <Link 
                to="/profile" 
                className="text-gray-700 items-center flex hover:text-blue-600"
                title="Kelola Profile"
              > 
                <FaUserCircle className="mr-2" />
                <span className="hidden sm:inline">Halo, </span>{user.name}
              </Link>
              
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                <FaSignOutAlt className="mr-1" />
                Keluar
              </button>
            </>
          ) : (
            // --- TAMPILAN JIKA BELUM LOGIN (GUEST) ---
            <>
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-800"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

// --- 2. KOMPONEN FOOTER (INI KODE LENGKAPNYA) ---
const Footer = () => (
  <footer className="bg-gray-100 mt-auto">
    <div className="container mx-auto px-6 py-4 text-center text-gray-600">
      © 2025 Bookstore. All rights reserved.
    </div>
  </footer>
);

// --- 3. KOMPONEN LAYOUT UTAMA (INI KODE LENGKAPNYA) ---
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-6 py-8">
        {/* Halaman Anda (HomePage, CartPage, dll.) akan dirender di sini */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// --- 4. EXPORT (PENTING) ---
export default MainLayout;