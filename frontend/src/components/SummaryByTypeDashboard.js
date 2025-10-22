import React, { useState, useEffect } from 'react';
import api from '../api';

const summaryByTypeStyles = `
    .summary-by-type-card {
        background-color: #fff;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .summary-by-type-card h4 {
        margin-top: 0;
        margin-bottom: 1.5rem;
        color: #333;
    }
    /* --- PERUBAHAN DI SINI --- */
    .summary-by-type-grid {
        display: grid;
        /* Mengatur agar grid selalu memiliki 4 kolom, sehingga otomatis menjadi 2 baris */
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
    }
    .summary-item-card {
        text-align: center;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 6px;
    }
    .summary-item-value {
        font-size: 2rem;
        font-weight: bold;
        color: var(--primary-color);
        margin: 0;
    }
    .summary-item-label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #555;
        margin-top: 0.5rem;
    }
`;

function SummaryByTypeDashboard({ selectedYear }) {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/dashboard/summary/by-type?year=${selectedYear}`);
                setSummary(response.data.data);
            } catch (error) {
                console.error("Gagal mengambil data summary per jenis:", error);
                alert("Gagal memuat rincian dokumen per jenis.");
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [selectedYear]);

    if (loading) {
        return <p>Memuat rincian per jenis dokumen...</p>;
    }

    // Daftar jenis dokumen yang ingin ditampilkan kartunya
    const documentTypes = ['SPPL', 'UKLUPL', 'AMDAL', 'DELH', 'DPLH', 'RINTEK', 'PERTEK AIR LIMBAH', 'SLO'];
    
    // Fungsi untuk mendapatkan jumlah dari data summary
    const getCount = (docType) => {
        const item = summary.find(s => s._id === docType);
        return item ? item.count : 0;
    };

    return (
        <div className="summary-by-type-card">
            <style>{summaryByTypeStyles}</style>
            <h4>Rincian Jenis Dokumen Yang Masuk ke DLH</h4>
            {summary.length > 0 ? (
                <div className="summary-by-type-grid">
                    {documentTypes.map(type => (
                        <div className="summary-item-card" key={type}>
                            <p className="summary-item-value">{getCount(type)}</p>
                            <p className="summary-item-label">{type}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Belum ada rincian dokumen untuk tahun ini.</p>
            )}
        </div>
    );
}

export default SummaryByTypeDashboard;

