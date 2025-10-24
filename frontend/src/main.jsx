import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Impor CSS Tailwind
import './index.css';

// Impor Layout dan Halaman
import MainLayout from './layouts/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';

// Definisikan Rute/Halaman kita
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, // Layout ini akan membungkus semua halaman
    children: [
      {
        path: '/',
        element: <HomePage />, // Ini adalah Halaman Utama (Landing Page)
      },
      // Nanti kita akan tambahkan halaman lain di sini
      // { path: '/login', element: <LoginPage /> },
      // { path: '/book/:id', element: <DetailPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Gunakan RouterProvider, bukan <App /> lagi */}
    <RouterProvider router={router} />
  </React.StrictMode>
);