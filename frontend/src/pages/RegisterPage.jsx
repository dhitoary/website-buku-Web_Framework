import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Link untuk navigasi

const RegisterPage = () => {
  // Panggil hook Auth kita
  const { register } = useAuth();
  const navigate = useNavigate(); // Untuk redirect setelah berhasil

  // State untuk formulir
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // State untuk error handling
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah form reload halaman
    setLoading(true);
    setErrors(null);

    try {
      // Panggil fungsi register dari AuthContext
      await register(name, email, password, passwordConfirmation);

      // Jika berhasil, arahkan ke halaman utama
      navigate('/');
    } catch (err) {
      setLoading(false);
      // Tangani error validasi dari Laravel (422)
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: ['Terjadi kesalahan. Silakan coba lagi.'] });
      }
    }
  };

  // Helper untuk menampilkan error
  const getError = (field) => {
    if (errors && errors[field]) {
      return (
        <p className="text-red-500 text-sm mt-1">{errors[field][0]}</p>
      );
    }
    return null;
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Buat Akun Baru
        </h2>

        {/* Tampilkan error general (non-form) */}
        {getError('general')}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-gray-700"
            >
              Nama Lengkap
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {getError('name')}
          </div>

          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Alamat Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {getError('email')}
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {getError('password')}
          </div>

          <div>
            <label 
              htmlFor="password_confirmation" 
              className="block text-sm font-medium text-gray-700"
            >
              Konfirmasi Password
            </label>
            <input
              type="password"
              id="password_confirmation"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;