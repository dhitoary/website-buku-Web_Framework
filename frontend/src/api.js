import axios from 'axios';

// Konfigurasi instance Axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Arahkan ke /api di backend Laravel
  withCredentials: true, // WAJIB: Izinkan kirim/terima cookie (untuk login)
});

export default api;