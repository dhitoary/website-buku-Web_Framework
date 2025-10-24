import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Impor CSS Tailwind
import './index.css';

// Impor Provider
import { AuthProvider } from './context/AuthContext.jsx'; 
import { CartProvider } from './context/CartContext.jsx';

// Impor Layout dan Halaman
import MainLayout from './layouts/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx'; 
import CartPage from './pages/CartPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx'; // <-- BARU

// Definisikan Rute/Halaman kita
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, 
    children: [
      {
        path: '/',
        element: <HomePage />, 
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/book/:id',
        element: <BookDetailPage />,
      },
      {
        path: '/cart',
        element: <CartPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/checkout', // <-- BARU
        element: <CheckoutPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);