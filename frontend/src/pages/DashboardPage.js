import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormTahapA from '../components/FormTahapA';
import FormKantorLH from '../components/FormKantorLH';
import FormTahapF from '../components/FormTahapF';
import RekapTabel from '../components/RekapTabel';
import CetakUlang from '../components/CetakUlang';
import ArsipMenuPage from './ArsipMenuPage'; // <-- Import halaman menu baru


function DashboardPage() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    
 // State default untuk tab aktif disesuaikan
    const [activeTab, setActiveTab] = useState(userRole === 'MPP' ? 'A' : 'Update');

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/');
    };

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

        // --- RENDER UNTUK ROLE ARSIP DIPERBARUI TOTAL ---
    const renderArsipDashboard = () => (
        // Role Arsip sekarang melihat Halaman Menu, bukan tab
        <ArsipMenuPage />
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