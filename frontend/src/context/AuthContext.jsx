import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api'; // Kurir API kita

// 1. Buat Konteks-nya
const AuthContext = createContext();

// 2. Buat "Provider" (Penyedia) Konteks
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Penyimpan data user
  const [loading, setLoading] = useState(true); // Status loading awal

  // 3. Fungsi untuk Cek User Saat Pertama Kali Buka Web
  // Ini akan cek ke backend /api/user, jika berhasil (ada cookie),
  // maka user akan otomatis login.
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await api.get('/user');
        setUser(response.data);
      } catch (error) {
        setUser(null); // Jika error (tidak login), set user ke null
      }
      setLoading(false); // Selesai loading
    };
    checkUser();
  }, []);

  // 4. Fungsi-fungsi Helper untuk Login/Register/Logout

  const login = async (email, password) => {
    // Hapus cookie lama (CSRF)
    await api.get('/sanctum/csrf-cookie');

    // Panggil API Login
    const response = await api.post('/login', { email, password });

    // Ambil data user dan simpan di state
    const userResponse = await api.get('/user');
    setUser(userResponse.data);
  };

  const register = async (name, email, password, password_confirmation) => {
    await api.get('/sanctum/csrf-cookie');

    await api.post('/register', { 
      name, 
      email, 
      password, 
      password_confirmation 
    });

    // Setelah register, langsung login
    await login(email, password);
  };

  const logout = async () => {
    await api.post('/logout');
    setUser(null); // Hapus user dari state
  };

  // 5. Kirim semua state dan fungsi ke "children"
  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {/* Jangan render aplikasi sebelum kita selesai cek user */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 6. Buat "Hook" kustom agar gampang dipakai
export const useAuth = () => {
  return useContext(AuthContext);
};