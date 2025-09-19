import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChecklistPage from './pages/ChecklistPage';
import CetakPenerimaanPage from './pages/CetakPenerimaanPage'; // Pastikan ini di-import
import ArsipPage from './pages/ArsipPage'; // Pastikan ini di-import
import DaftarArsipPage from './pages/DaftarArsipPage';
import NotaDinasPage from './pages/NotaDinasPage';
import SuratKeluarPage from './pages/SuratKeluarPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

// Komponen ini bertugas melindungi halaman agar tidak bisa diakses sebelum login
const PrivateRoute = ({ children }) => {
    const isLoggedIn = !!localStorage.getItem('userRole');
    return isLoggedIn ? children : <Navigate to="/" />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Rute untuk Halaman Login (Publik) */}
                <Route path="/" element={<LoginPage />} />

                {/* Rute yang Dilindungi (Hanya bisa diakses setelah login) */}
                <Route
                    path="/dashboard"
                    element={<PrivateRoute><DashboardPage /></PrivateRoute>}
                />
                <Route
                    path="/checklist/:noUrut"
                    element={<PrivateRoute><ChecklistPage /></PrivateRoute>}
                />
                <Route
                    path="/penerimaan/:noUrut"
                    element={<PrivateRoute><CetakPenerimaanPage /></PrivateRoute>}
                />
                <Route
                    path="/arsip/:noUrut"
                    element={<PrivateRoute><ArsipPage /></PrivateRoute>}
                />
                <Route 
                    path="/daftar-arsip" 
                    element={<PrivateRoute><DaftarArsipPage /></PrivateRoute>} 
                />
                <Route 
                    path="/nota-dinas" 
                    element={<PrivateRoute><NotaDinasPage /></PrivateRoute>} 
                />
                <Route 
                    path="/surat-keluar" 
                    element={<PrivateRoute><SuratKeluarPage /></PrivateRoute>} 
                />
                
                {/* Rute "Catch-All" untuk 404 - HARUS DITARUH PALING BAWAH */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}

export default App;