import axios from 'axios';

// Logika ini akan secara otomatis memilih alamat backend yang benar:
// - Saat aplikasi berjalan di Vercel (lingkungan 'production'),
//   ia akan menggunakan alamat relatif '/api'. Vercel kemudian akan
//   meneruskan permintaan ini ke backend Anda.
// - Saat aplikasi berjalan di komputer lokal Anda (lingkungan 'development'),
//   ia akan menggunakan alamat lengkap 'http://localhost:3001/api'.
const API_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:3001/api';

// Membuat sebuah instance axios yang sudah terkonfigurasi
// dengan alamat dasar yang benar.
const api = axios.create({
  baseURL: API_URL,
});

// Mengekspor instance ini agar bisa digunakan di komponen lain.
export default api;