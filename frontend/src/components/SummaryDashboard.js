import React, { useState, useEffect } from 'react';
import api from '../api';

const summaryStyles = `
    .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
    }
    .summary-card {
        background-color: #fff;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .summary-card-value {
        font-size: 2.5rem; /* Ukuran font disesuaikan agar muat */
        font-weight: bold;
        color: var(--primary-color);
        margin: 0;
    }
    .summary-card-label {
        font-size: 0.9rem;
        color: #6c757d;
        margin-top: 0.5rem;
    }
    .year-filter-wrapper {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1.5rem;
    }
    .year-filter {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
`;

function SummaryDashboard({ selectedYear, setSelectedYear }) {
    const [summary, setSummary] = useState(null);
    const [summaryByType, setSummaryByType] = useState([]); // State baru untuk data per jenis
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummaryData = async () => {
            setLoading(true);
            try {
                // Mengambil kedua data summary secara bersamaan
                const [summaryRes, byTypeRes] = await Promise.all([
                    api.get(`/dashboard/summary?year=${selectedYear}`),
                    api.get(`/dashboard/summary/by-type?year=${selectedYear}`)
                ]);
                setSummary(summaryRes.data.data);
                setSummaryByType(byTypeRes.data.data);
            } catch (error) {
                console.error("Gagal mengambil data summary:", error);
                alert("Gagal memuat data summary.");
            } finally {
                setLoading(false);
            }
        };
        fetchSummaryData();
    }, [selectedYear]);

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= 2025; i--) { years.push(i); }
        return years.map(year => <option key={year} value={year}>{year}</option>);
    };

    // Fungsi helper untuk mendapatkan jumlah berdasarkan jenis dokumen
    const getCount = (docType) => {
        const item = summaryByType.find(s => s._id === docType);
        return item ? item.count : 0;
    };

    // Daftar kartu yang akan ditampilkan diubah sesuai permintaan Anda
    const summaryItems = [
        { label: "Dokumen Masuk", value: summary?.totalMasuk },
        { label: "SPPL", value: getCount('SPPL') },
        { label: "UKL-UPL", value: getCount('UKLUPL') },
        { label: "DPLH", value: getCount('DPLH') },
        { label: "RINTEK LB3", value: getCount('RINTEK LB3') },
        { label: "PERTEK AIR LIMBAH", value: getCount('PERTEK AIR LIMBAH') },
        { label: "SLO", value: getCount('SLO') }
    ];

    return (
        <div>
            <style>{summaryStyles}</style>
            <div className="year-filter-wrapper">
                <div className="year-filter">
                    <label htmlFor="year-select">Tahun:</label>
                    <select id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        {generateYearOptions()}
                    </select>
                </div>
            </div>

            {loading ? <p>Memuat statistik...</p> : (
                <div className="summary-grid">
                    {summaryItems.map((item, index) => (
                         <div className="summary-card" key={index}>
                            <p className="summary-card-value">{item.value !== undefined ? item.value : '-'}</p>
                            <p className="summary-card-label">{item.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SummaryDashboard;

