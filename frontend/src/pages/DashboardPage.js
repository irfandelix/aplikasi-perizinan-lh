import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormTahapA from '../components/FormTahapA';
import FormKantorLH from '../components/FormKantorLH';
import FormTahapF from '../components/FormTahapF';
import RekapTabel from '../components/RekapTabel';
import CetakUlang from '../components/CetakUlang';
import DaftarArsipPage from './DaftarArsipPage';
import NotaDinasPage from './NotaDinasPage';
import SuratKeluarPage from './SuratKeluarPage';
import SummaryDashboard from '../components/SummaryDashboard';

// --- GAYA BARU DITAMBAHKAN DI SINI ---
// Gaya ini akan mengubah warna tombol dengan class "secondary" saat disentuh mouse
const dashboardStyles = `
    .secondary:hover {
        background-color: #1D6F42; /* Warna hijau Excel */
        color: white;
        border-color: #1D6F42;
    }
`;

function DashboardPage() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    
    // Fungsi cerdas untuk menentukan tab default saat login
    const getDefaultTab = () => {
        if (userRole === 'MPP') return 'A';
        if (userRole === 'Kantor LH') return 'Summary';
        if (userRole === 'Arsip') return 'ArsipDinamis'; // Default untuk role Arsip
        return ''; 
    };

    const [activeTab, setActiveTab] = useState(getDefaultTab());
    // --- PERBAIKAN 1: Tambahkan state untuk mengelola tahun yang dipilih ---
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/');
    };
    
    // --- PERBAIKAN 2: Komponen ini sekarang mengelola dan mengirimkan state 'selectedYear' ---
    const renderSummarySection = () => (
        <div style={{ marginBottom: '2.5rem' }}>
            {/* Kirim 'selectedYear' dan 'setSelectedYear' sebagai props */}
            <SummaryDashboard selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
            
            <div style={{ marginTop: '1.5rem' }}>
                {/* Kirim 'selectedYear' sebagai prop */}
                <SummaryByTypeDashboard selectedYear={selectedYear} />
            </div>
        </div>
    );

    // Tampilan untuk role MPP
    const renderMPPForms = () => (
        <div>
            <div className="tab-buttons">
                <button onClick={() => setActiveTab('A')} className={activeTab === 'A' ? 'active' : ''}>Registrasi Dokumen</button>
                <button onClick={() => setActiveTab('F')} className={activeTab === 'F' ? 'active' : ''}>Pengembalian Perbaikan Dokumen</button>
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
                <button onClick={() => setActiveTab('Summary')} className={activeTab === 'Summary' ? 'active' : ''}>Ringkasan Data</button>
                <button onClick={() => setActiveTab('Update')} className={activeTab === 'Update' ? 'active' : ''}>Update Dokumen</button>
                <button onClick={() => setActiveTab('Rekap')} className={activeTab === 'Rekap' ? 'active' : ''}>Rekap Data</button>
            </div>
            {activeTab === 'Summary' && <SummaryDashboard />}
            {activeTab === 'Update' && <FormKantorLH />}
            {activeTab === 'Rekap' && <RekapTabel />}
        </div>
    );

    // Tampilan untuk role Arsip
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
            {/* Menambahkan gaya kustom ke halaman ini */}
            <style>{dashboardStyles}</style>
            
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

