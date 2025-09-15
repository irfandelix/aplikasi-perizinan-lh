import axios from 'axios';

// Logika ini akan secara otomatis memilih alamat API yang benar:
//
// 1. Saat di Vercel (lingkungan 'production'):
//    Frontend (misal: https://aplikasi-Anda.vercel.app) akan mengirim permintaan
//    ke '/api/login'. Vercel akan meneruskannya ke backend di alamat yang sama.
//    (misal: https://aplikasi-Anda.vercel.app/api/login)
//
// 2. Saat di komputer lokal (lingkungan 'development'):
//    Frontend (http://localhost:3000) akan mengirim permintaan
//    ke alamat backend lokal (http://localhost:3001/api/login).

const API_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:3001/api';

// Membuat instance axios dengan alamat dasar yang sudah ditentukan.
// Semua komponen lain akan menggunakan 'api' ini, bukan 'axios' langsung.
const api = axios.create({
  baseURL: API_URL,
});

export default api;
