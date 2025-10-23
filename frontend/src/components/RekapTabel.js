import React, { useState, useEffect } from 'react';
import api from '../api';
import * as XLSX from 'xlsx';

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
                const response = await api.get('/rekap/all');
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

     // --- 2. TAMBAHKAN FUNGSI BARU UNTUK DOWNLOAD EXCEL ---
    const handleDownloadExcel = () => {
        if (rekapData.length === 0) {
            alert("Tidak ada data untuk diunduh.");
            return;
        }

    // 1. Ubah nama field agar sesuai dengan header tabel
        const dataToExport = rekapData.map(doc => ({
            "No. Urut": doc.noUrut,
            "No. Checklist": doc.nomorChecklist,
            "Nama Kegiatan": doc.namaKegiatan,
            "Jenis Dokumen": doc.jenisDokumen,
            "Nama Pemrakarsa": doc.namaPemrakarsa,
            "Tanggal Masuk": doc.tanggalMasukDokumen,
            "No. BA Uji Administrasi": doc.nomorUjiBerkas,
            "Tgl. BA Uji Administrasi": doc.tanggalUjiBerkas,
            "No. BA Verifikasi Lapangan": doc.nomorBAVerlap,
            "Tgl. Verifikasi Lapangan": doc.tanggalVerlap,
            "No. BA Pemeriksaan Berkas": doc.nomorBAPemeriksaan,
            "Tgl. Pemeriksaan Berkas": doc.tanggalPemeriksaan,
            "No. BA Revisi 1": doc.nomorRevisi1,
            "Tgl. Revisi 1": doc.tanggalRevisi1,
            "No. BA Revisi 2": doc.nomorRevisi2,
            "Tgl. Revisi 2": doc.tanggalRevisi2,
            "No. BA Revisi 3": doc.nomorRevisi3,
            "Tgl. Revisi 3": doc.tanggalRevisi3,
            "No. BA Revisi 4": doc.nomorRevisi4,
            "Tgl. Revisi 4": doc.tanggalRevisi4,
            "No. BA Revisi 5": doc.nomorRevisi5,
            "Tgl. Revisi 5": doc.tanggalRevisi5,
            "No. Penerimaan Perbaikan": doc.nomorPHP,
            "Tgl. Penerimaan Perbaikan": doc.tanggalPHP,
            "Petugas Penerima Perbaikan": doc.petugasPenerimaPerbaikan,
            "Tgl. Pengembalian Dokumen": doc.tanggalPengembalian,
            "No. Izin Terbit": doc.nomorIzinTerbit,
            "No. Risalah Pengolahan Data": doc.nomorRisalah,
            "Tgl. Risalah": doc.tanggalRisalah
        }));

        // 2. Buat worksheet dari data
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // 3. Atur lebar kolom (opsional tapi sangat disarankan)
        const colWidths = [
            { wch: 8 }, // No. Urut
            { wch: 35 }, // No. Checklist
            { wch: 40 }, // Nama Kegiatan
            { wch: 20 }, // Jenis Dokumen
            { wch: 30 }, // Nama Pemrakarsa
            { wch: 15 }, // Tanggal Masuk
            { wch: 35 }, // No. BA Uji Administrasi
            { wch: 15 }, // Tgl. BA Uji Administrasi
            { wch: 35 }, // No. BA Verlap
            { wch: 15 }, // Tgl. Verlap
            { wch: 35 }, // No. BA Pemeriksaan
            { wch: 15 }, // Tgl. Pemeriksaan
            { wch: 35 }, { wch: 15 }, // Revisi 1
            { wch: 35 }, { wch: 15 }, // Revisi 2
            { wch: 35 }, { wch: 15 }, // Revisi 3
            { wch: 35 }, { wch: 15 }, // Revisi 4
            { wch: 35 }, { wch: 15 }, // Revisi 5
            { wch: 35 }, { wch: 15 }, // PHP
            { wch: 20 }, // Petugas Perbaikan
            { wch: 15 }, // Tgl Pengembalian
            { wch: 25 }, // No. Izin
            { wch: 35 }, { wch: 15 } // Risalah
        ];
        worksheet['!cols'] = colWidths;

        // 4. Buat workbook dan unduh file
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rekapitulasi Dokumen");
        XLSX.writeFile(workbook, "Rekapitulasi_Dokumen_Perizinan.xlsx");
    };

    if (loading) {
        return <p>Memuat data rekapitulasi...</p>;
    }

    if (error) {
        return <p style={{ color: 'var(--danger-color)' }}>{error}</p>;
    }

    return (
        <div>
            <style>{rekapTableStyles}</style>
            
            {/* --- 3. TAMBAHKAN TOMBOL BARU DI SINI --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Rekapitulasi Seluruh Dokumen</h3>
                <button onClick={handleDownloadExcel} className="secondary">
                    Unduh Excel
                </button>
            </div>

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
                            <th>Petugas Penerima Perbaikan</th>
                            <th>Tgl. Pengembalian</th>
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
                                <td>{dokumen.petugasPenerimaPerbaikan}</td>
                                <td style={{color: 'red', fontWeight: 'bold'}}>{dokumen.tanggalPengembalian}</td>
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
