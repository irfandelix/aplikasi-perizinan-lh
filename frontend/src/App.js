// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChecklistPage from './pages/ChecklistPage';
import CetakPenerimaanPage from './pages/CetakPenerimaanPage'; // <-- IMPORT BARU
import ArsipPage from './pages/ArsipPage';
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
                {/* 👇 PERBAIKI BARIS INI 👇 */}
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
            </Routes>
        </Router>
    );
}

export default App;