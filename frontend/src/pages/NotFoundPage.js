import React from 'react';
import { useNavigate } from 'react-router-dom';

const notFoundStyles = `
    .not-found-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding-top: 4rem; /* Memberi jarak dari header */
        padding-bottom: 4rem;
    }
    .not-found-content h1 {
        font-size: 5rem;
        font-weight: bold;
        color: var(--primary-color);
        margin: 0;
    }
    .not-found-content p {
        font-size: 1.25rem;
        color: #6c757d;
        margin-top: 0.5rem;
        margin-bottom: 2rem;
    }
`;

function NotFoundPage() {
    const navigate = useNavigate();
    // Cek apakah pengguna sudah login atau belum
    const isLoggedIn = !!localStorage.getItem('userRole');

    // Tentukan tujuan tombol kembali berdasarkan status login
    const handleGoBack = () => {
        if (isLoggedIn) {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        // Menggunakan class "container" yang sama dengan dashboard
        <div className="container"> 
            <style>{notFoundStyles}</style>

            {/* Menambahkan header yang konsisten dengan dashboard */}
            <div className="dashboard-header">
                <h1>Aplikasi Perizinan</h1>
                {/* Tombol kembali menggantikan tombol logout */}
                <button onClick={handleGoBack} className="secondary">
                    Kembali
                </button>
            </div>

            <div className="not-found-content">
                <h1>404</h1>
                <p>Maaf, halaman yang Anda cari tidak ditemukan.</p>
                <button 
                    onClick={handleGoBack} 
                    className="primary"
                >
                    Kembali ke Halaman Utama
                </button>
            </div>
        </div>
    );
}

export default NotFoundPage;

