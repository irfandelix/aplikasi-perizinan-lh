import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormTahapA from '../components/FormTahapA';
import FormKantorLH from '../components/FormKantorLH';
import FormTahapF from '../components/FormTahapF';
import RekapTabel from '../components/RekapTabel';
import CetakUlang from '../components/CetakUlang';
// Import semua halaman yang akan ditampilkan di tab
import DaftarArsipPage from './DaftarArsipPage';
import NotaDinasPage from './NotaDinasPage';
import SuratKeluarPage from './SuratKeluarPage';

function DashboardPage() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    
    // Fungsi cerdas untuk menentukan tab default saat login
    const getDefaultTab = () => {
        if (userRole === 'MPP') return 'A';
        if (userRole === 'Kantor LH') return 'Update';
        if (userRole === 'Arsip') return 'ArsipDinamis'; // Default untuk role Arsip
        return ''; 
    };
    const [activeTab, setActiveTab] = useState(getDefaultTab());

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/');
    };

    // Tampilan untuk role MPP
    const renderMPPForms = () => (
        <div>
            <div className="tab-buttons">
                <button onClick={() => setActiveTab('A')} className={activeTab === 'A' ? 'active' : ''}>Tahap A: Registrasi</button>
                <button onClick={() => setActiveTab('F')} className={activeTab === 'F' ? 'active' : ''}>Tahap F: Perbaikan</button>
                <button onClick={() => setActiveTab('Rekap')} className={activeTab === 'Rekap' ? 'active' : ''}>Rekap Data</button>
                <button onClick={() => setActiveTab('Cetak')} className={activeTab === 'Cetak' ? 'active' : ''}>Cetak Ulang</button>
            </div>
            {activeTab === 'A' && <FormTahapA />}
            {activeTab === 'F' && <FormTahapF />}
            {activeTab === 'Rekap' && <RekapTabel />}
            {activeTab === 'Cetak' && <CetakUlang />}
        </div>
    );

    // Tampilan untuk role Kantor LH
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

    // --- RENDER UNTUK ROLE ARSIP DIPERBARUI TOTAL MENJADI TAB ---
    const renderArsipDashboard = () => (
        <div>
            <div className="tab-buttons">
                <button onClick={() => setActiveTab('ArsipDinamis')} className={activeTab === 'ArsipDinamis' ? 'active' : ''}>Arsip Dinamis Aktif</button>
                <button onClick={() => setActiveTab('NotaDinas')} className={activeTab === 'NotaDinas' ? 'active' : ''}>Nota Dinas</button>
                <button onClick={() => setActiveTab('SuratKeluar')} className={activeTab === 'SuratKeluar' ? 'active' : ''}>Surat Keluar</button>
            </div>
            
            <div style={{marginTop: '2rem'}}>
                {activeTab === 'ArsipDinamis' && <DaftarArsipPage />}
                {activeTab === 'NotaDinas' && <NotaDinasPage />}
                {activeTab === 'SuratKeluar' && <SuratKeluarPage />}
            </div>
        </div>
    );

    return (
        <div className="container">
            <div className="dashboard-header">
                <h1>Dashboard {userRole}</h1>
                <button onClick={handleLogout} className="danger">Logout</button>
            </div>
            
            {/* Logika untuk menampilkan dashboard yang sesuai dengan role */}
            {userRole === 'MPP' && renderMPPForms()}
            {userRole === 'Kantor LH' && renderDLHForms()}
            {userRole === 'Arsip' && renderArsipDashboard()}
        </div>
    );
}

export default DashboardPage;

