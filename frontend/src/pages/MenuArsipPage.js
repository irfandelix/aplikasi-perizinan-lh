import React from 'react';
import { useNavigate } from 'react-router-dom';

const menuStyles = `
    .arsip-menu-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin-top: 2rem;
    }
    .arsip-menu-button {
        display: block;
        width: 100%;
        padding: 1.5rem 1rem;
        font-size: 1.2rem;
        text-align: left;
        border-radius: 8px;
        cursor: pointer;
        border: 1px solid var(--border-color);
        background-color: #fff;
        transition: all 0.2s ease-in-out;
    }
    .arsip-menu-button:hover {
        background-color: var(--light-gray);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
`;

function ArsipMenuPage() {
    const navigate = useNavigate();

    return (
        <div>
            <style>{menuStyles}</style>
            <h3>Menu Utama Arsip</h3>
            <div className="arsip-menu-container">
                <button 
                    onClick={() => navigate('/daftar-arsip')} 
                    className="arsip-menu-button"
                >
                    Arsip Dinamis Aktif
                </button>
                <button 
                    onClick={() => navigate('/nota-dinas')} 
                    className="arsip-menu-button"
                >
                    Nota Dinas
                </button>
                <button 
                    onClick={() => navigate('/surat-keluar')} 
                    className="arsip-menu-button"
                >
                    Surat Keluar
                </button>
            </div>
        </div>
    );
}

export default ArsipMenuPage;
