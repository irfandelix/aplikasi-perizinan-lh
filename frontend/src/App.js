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
import './App.css';

const PrivateRoute = ({ children }) => {
    const isLoggedIn = !!localStorage.getItem('userRole');
    return isLoggedIn ? children : <Navigate to="/" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route
                    path="/dashboard"
                    element={<PrivateRoute><DashboardPage /></PrivateRoute>}
                />
                <Route
                    path="/checklist/:noUrut"
                    element={<PrivateRoute><ChecklistPage /></PrivateRoute>}
                />
                {/* RUTE YANG MEMPERBAIKI MASALAH ANDA ADA DI SINI */}
                <Route
                    path="/penerimaan/:noUrut"
                    element={<PrivateRoute><CetakPenerimaanPage /></PrivateRoute>}
                />
                <Route
                    path="/arsip/:noUrut"
                    element={<PrivateRoute><ArsipPage /></PrivateRoute>}
                />
                {/* Rute baru untuk halaman arsip dinamis */}
                 {/* --- RUTE BARU UNTUK SETIAP MENU ARSIP --- */}
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
                ></Route>
            </Routes>
        </Router>
    );
}

export default App;
