import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Sedikit CSS tambahan untuk tabel rekap
const rekapTableStyles = `
    .rekap-table-wrapper {
        max-height: 70vh;
        overflow: auto;
        margin-top: 1.5rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        position: relative;
    }
    .rekap-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
        min-width: 2200px;
    }
    .rekap-table th, .rekap-table td {
        border: 1px solid var(--border-color);
        padding: 0.6rem;
        text-align: left;
        white-space: nowrap;
        vertical-align: top;
    }
    .rekap-table th {
        background-color: #d1fae5;
        color: #065f46;
        font-weight: 600;
        position: sticky;
        top: 0;
        z-index: 3; /* Header di atas segalanya */
    }
    .rekap-table .wrap-text {
        white-space: normal;
        word-wrap: break-word;
        min-width: 250px;
    }
    .rekap-table tbody tr:nth-child(even) {
        background-color: #f8f9fa;
    }

    /* --- STYLE BARU UNTUK FREEZE COLUMN --- */
    .rekap-table .freeze {
        position: sticky;
        z-index: 2; /* Kolom beku di atas sel biasa */
    }
    
    .rekap-table td.freeze {
        background-color: white;
    }
    .rekap-table tbody tr:nth-child(even) td.freeze {
        background-color: #f8f9fa;
    }
    
    .rekap-table th.freeze {
        background-color: #d1fae5;
        z-index: 4; /* Paling atas */
    }

    /* Tentukan posisi menempel dari kiri untuk setiap kolom */
    .rekap-table .col-1 { left: 0px; }
    .rekap-table .col-2 { left: 80px; }
    .rekap-table .col-3 { left: 340px; }

    /* Beri lebar tetap agar perhitungan 'left' akurat */
    .rekap-table .w-1 { min-width: 80px; width: 80px; }
    .rekap-table .w-2 { min-width: 260px; width: 260px; }

    /* --- STYLE BARU UNTUK GARIS PEMBATAS --- */
    .rekap-table .col-3 {
        border-right: 2px solid #adb5bd; /* Abu-abu gelap */
    }
`;

function RekapTabel() {
    const [rekapData, setRekapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRekapData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:3001/api/rekap/all');
                setRekapData(response.data.data);
            } catch (err) {
                setError('Gagal memuat data rekapitulasi.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRekapData();
    }, []);

    if (loading) {
        return <p>Memuat data rekapitulasi...</p>;
    }

    if (error) {
        return <p style={{ color: 'var(--danger-color)' }}>{error}</p>;
    }

    return (
        <div>
            <style>{rekapTableStyles}</style>
            <h3>Rekapitulasi Seluruh Dokumen</h3>
            <div className="rekap-table-wrapper">
                <table className="rekap-table">
                    <thead>
                        <tr>
                            <th className="freeze col-1 w-1">No. Urut</th>
                            <th className="freeze col-2 w-2">No. Checklist</th>
                            <th className="freeze col-3 wrap-text">Nama Kegiatan</th>
                            <th>Jenis Dokumen</th>
                            <th>Nama Pemrakarsa</th>
                            <th>Tanggal Masuk</th>
                            <th>No. BA Uji Administrasi</th>
                            <th>Tgl. BA Uji Administrasi</th>
                            <th>No. BA Verifikasi Lapangan</th>
                            <th>Tgl. Verifikasi Lapangan</th>
                            <th>No. BA Pemeriksaan Berkas</th>
                            <th>Tgl. Pemeriksaan Berkas</th>
                            <th>No. BA Revisi 1</th>
                            <th>Tgl. Revisi 1</th>
                            <th>No. BA Revisi 2</th>
                            <th>Tgl. Revisi 2</th>
                            <th>No. BA Revisi 3</th>
                            <th>Tgl. Revisi 3</th>
                            <th>No. BA Revisi 4</th>
                            <th>Tgl. Revisi 4</th>
                            <th>No. BA Revisi 5</th>
                            <th>Tgl. Revisi 5</th>
                            <th>No. Penerimaan Perbaikan</th>
                            <th>Tgl. Penerimaan Perbaikan</th>
                            <th>No. Izin Terbit</th>
                            <th>No. Risalah Pengolahan Data</th>
                            <th>Tgl. Risalah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rekapData.map((dokumen) => (
                            <tr key={dokumen._id}>
                                <td className="freeze col-1 w-1">{dokumen.noUrut}</td>
                                <td className="freeze col-2 w-2">{dokumen.nomorChecklist}</td>
                                <td className="freeze col-3 wrap-text">{dokumen.namaKegiatan}</td>
                                <td>{dokumen.jenisDokumen}</td>
                                <td>{dokumen.namaPemrakarsa}</td>
                                <td>{dokumen.tanggalMasukDokumen}</td>
                                <td>{dokumen.nomorUjiBerkas}</td>
                                <td>{dokumen.tanggalUjiBerkas}</td>
                                <td>{dokumen.nomorBAVerlap}</td>
                                <td>{dokumen.tanggalVerlap}</td>
                                <td>{dokumen.nomorBAPemeriksaan}</td>
                                <td>{dokumen.tanggalPemeriksaan}</td>
                                <td>{dokumen.nomorRevisi1}</td>
                                <td>{dokumen.tanggalRevisi1}</td>
                                <td>{dokumen.nomorRevisi2}</td>
                                <td>{dokumen.tanggalRevisi2}</td>
                                <td>{dokumen.nomorRevisi3}</td>
                                <td>{dokumen.tanggalRevisi3}</td>
                                <td>{dokumen.nomorRevisi4}</td>
                                <td>{dokumen.tanggalRevisi4}</td>
                                <td>{dokumen.nomorRevisi5}</td>
                                <td>{dokumen.tanggalRevisi5}</td>
                                <td>{dokumen.nomorPHP}</td>
                                <td>{dokumen.tanggalPHP}</td>
                                <td>{dokumen.nomorIzinTerbit}</td>
                                <td>{dokumen.nomorRisalah}</td>
                                <td>{dokumen.tanggalRisalah}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RekapTabel;

