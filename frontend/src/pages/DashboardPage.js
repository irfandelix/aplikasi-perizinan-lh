import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormTahapA from '../components/FormTahapA';
import FormKantorLH from '../components/FormKantorLH';
import FormTahapF from '../components/FormTahapF';
import RekapTabel from '../components/RekapTabel'; 
import CetakUlang from '../components/CetakUlang';
import DaftarArsipPage from './DaftarArsipPage'; // Jalur import diperbaiki

function DashboardPage() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');

    const getDefaultTab = () => {
        if (userRole === 'MPP') return 'A';
        if (userRole === 'Kantor LH') return 'Update';
        return 'Daftar Arsip'; // Default untuk role lain seperti Arsip
    };

    const [activeTab, setActiveTab] = useState(getDefaultTab());

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/');
    };

     // --- RENDER UNTUK ROLE MPP DIPERBARUI DI SINI ---
    const renderMPPForms = () => (
        <div>
            <div className="tab-buttons">
                <button onClick={() => setActiveTab('A')} className={activeTab === 'A' ? 'active' : ''}>Tahap A: Registrasi</button>
                <button onClick={() => setActiveTab('F')} className={activeTab === 'F' ? 'active' : ''}>Tahap F: Penerimaan Perbaikan</button>
                <button onClick={() => setActiveTab('Rekap')} className={activeTab === 'Rekap' ? 'active' : ''}>Rekap Data</button>
                {/* 1. Tombol tab baru ditambahkan di sini */}
                <button onClick={() => setActiveTab('Cetak')} className={activeTab === 'Cetak' ? 'active' : ''}>Cetak Ulang</button>
            </div>
            
            {/* 2. Komponen ditampilkan secara kondisional */}
            {activeTab === 'A' && <FormTahapA />}
            {activeTab === 'F' && <FormTahapF />}
            {activeTab === 'Rekap' && <RekapTabel />}
            {activeTab === 'Cetak' && <CetakUlang />}

            {/* 3. Komponen yang ditampilkan permanen dihapus dari sini */}
        </div>
    );
    const renderDLHForms = () => (
       <div>
            <div className="tab-buttons">
                <button onClick={() => setActiveTab('Update')} className={activeTab === 'Update' ? 'active' : ''}>Update Dokumen</button>
                <button onClick={() => setActiveTab('Rekap')} className={activeTab === 'Rekap' ? 'active' : ''}>Rekap Data</button>
            </div>
            {activeTab === 'Update' && <FormKantorLH />}
            {activeTab === 'Rekap' && <RekapTabel />}
        </div>
    );

    return (
        <div className="container">
            <div className="dashboard-header">
                <h1>Dashboard {userRole}</h1>
                <button onClick={handleLogout} className="danger">Logout</button>
            </div>

            {userRole === 'MPP' && renderMPPForms()}
            {userRole === 'Kantor LH' && renderDLHForms()}
        </div>
    );

    // --- RENDER UNTUK ROLE ARSIP --- 
    const renderArsipDashboard = () => (
        <div>
            {/* Role Arsip sekarang melihat halaman daftar arsip dinamis */}
            <DaftarArsipPage />
        </div>
    );

    return (
        <div className="container">
            <div className="dashboard-header">
                <h1>Dashboard {userRole}</h1>
                <button onClick={handleLogout} className="danger">Logout</button>
            </div>
            
            {/* Logika untuk menampilkan dashboard yang sesuai */}
            {userRole === 'MPP' && renderMPPForms()}
            {userRole === 'Kantor LH' && renderDLHForms()}
            {userRole === 'Arsip' && renderArsipDashboard()}
        </div>
    );
}


export default DashboardPage;
