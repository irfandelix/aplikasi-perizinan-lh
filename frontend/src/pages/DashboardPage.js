import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormTahapA from '../components/FormTahapA';
import FormKantorLH from '../components/FormKantorLH';
import FormTahapF from '../components/FormTahapF';
import RekapTabel from '../components/RekapTabel'; // <-- IMPORT BARU

function DashboardPage() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    const [activeTab, setActiveTab] = useState(userRole === 'MPP' ? 'A' : 'Update');

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
            </div>
            {activeTab === 'A' && <FormTahapA />}
            {activeTab === 'F' && <FormTahapF />}
            {activeTab === 'Rekap' && <RekapTabel />}
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
}


export default DashboardPage;
