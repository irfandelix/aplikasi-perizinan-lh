import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

// --- PERUBAHAN 1: Definisi FileLink diperbaiki ---
// Kita akan buat FileLink yang benar-benar menerapkan colSpan
// dan memiliki logika untuk print vs layar.
const FileLink = ({ label, url }) => {
    // Jika tidak ada url, jangan render baris ini sama sekali
    if (!url) return null;
    
    return (
        <tr>
            {/* Sel 1: Label */}
            <th style={{padding:'8px', textAlign:'left'}}>File {label}</th>
            
            {/* Sel 2: Konten (Gabungan Kolom 2 & 3) */}
            <td colSpan="2" style={{padding:'8px'}}>
                : {/* Titik dua diletakkan di luar span */}
                
                {/* 1. Ini hanya tampil di LAYAR */}
                <span className="screen-only">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="file-link" style={{color: 'var(--primary-color)', fontWeight: '600'}}>
                        Lihat File
                    </a>
                </span>

                {/* 2. Ini hanya tampil saat di-PRINT */}
                <span className="print-only">
                    {url}
                </span>
            </td>
        </tr>
    );
};
// --- AKHIR PERUBAHAN 1 ---


function ArsipPage() {
    const { noUrut } = useParams();
    const navigate = useNavigate();
    const [recordData, setRecordData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecordData = async () => {
            try {
                const response = await api.get(`/record/${noUrut}`);
                setRecordData(response.data.data);
            } catch (error) {
                alert("Gagal mengambil data untuk arsip.");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchRecordData();
    }, [noUrut, navigate]);
    
    if (loading || !recordData) {
        return <div>Mempersiapkan halaman cetak arsip...</div>;
    }

    const arsipChecklistItems = [
        "Surat Permohonan", "BA Checklist Pelayanan (Kelengkapan Berkas)", "BA Hasil Uji Administrasi",
        "BA Verifikasi Lapangan", "Undangan", "BA Pemeriksaan Dokumen", "Risalah Pengolahan Data",
        "Surat Penyampaian Dokumen Hasil Perbaikan", "Tanda Terima Berkas Penerimaan Hasil Perbaikan",
        "BA Pemeriksaan Dokumen II/III/Dst.", "PKPLH / SPPL / SKKL", "Dokumen Lingkungan"
    ];

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', backgroundColor: 'white' }}>
            
            {/* --- PERUBAHAN 2: Tambahkan CSS @media print --- */}
            <style>
                {`
                    /* Sembunyikan link URL saat di layar */
                    .print-only {
                        display: none;
                    }

                    @media print {
                        /* Sembunyikan tombol dan link "Lihat File" saat mau print */
                        .no-print,
                        .screen-only {
                            display: none;
                        }

                        /* Tampilkan URL lengkap saat mau print */
                        .print-only {
                            display: inline; /* Tampilkan sebagai teks biasa */
                            color: #000;
                            font-size: 9pt; /* Perkecil font agar URL muat */
                            
                            /* PENTING: Paksa URL panjang agar pindah baris */
                            word-break: break-all; 
                        }
                    }
                `}
            </style>
            {/* --- AKHIR PERUBAHAN 2 --- */}

            <div className="no-print" style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => navigate(-1)} className="secondary">Kembali</button>
                <button onClick={() => window.print()} className="primary">🖨️ Cetak</button>
            </div>

            <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>Checklist Arsip Dokumen Perizinan</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '11pt' }} border="1">
                <tbody>
                    {/* Baris-baris ini sudah benar pakai colSpan="2" */}
                    <tr><th style={{width:'35%', padding:'8px', textAlign:'left'}}>Nama Dokumen</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.namaKegiatan}</td></tr>
                    <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Surat Permohonan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorSuratPermohonan}</td></tr>
       _             <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Checklist Kelengkapan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorChecklist}</td></tr>
                    {recordData.nomorUjiBerkas && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Hasil Uji Administrasi</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorUjiBerkas}</td></tr>}
                    {recordData.nomorBAVerlap && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Verifikasi Lapangan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorBAVerlap}</td></tr>}
                    {recordData.nomorBAPemeriksaan && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Pemeriksaan Berkas</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorBAPemeriksaan}</td></tr>}
                    {recordData.nomorIzinTerbit && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Izin Terbit</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorIzinTerbit}</td></tr>}
                    {recordData.nomorPHP && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Penerimaan Hasil Perbaikan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorPHP}</td></tr>}
                    {recordData.nomorRisalah && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Risalah Pengolahan Data</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorRisalah}</td></tr>}
                    
                    {/* Komponen FileLink yang sudah diperbaiki akan dipanggil di sini */}
                    <FileLink label="BA HUA (B)" url={recordData.fileTahapB} />
                    <FileLink label="BA Verlap (C)" url={recordData.fileTahapC} />
                    <FileLink label="BA Pemeriksaan (D)" url={recordData.fileTahapD} />
                    <FileLink label="BA Revisi 1 (E1)" url={recordData.fileTahapE1} />
                    <FileLink label="BA Revisi 2 (E2)" url={recordData.fileTahapE2} />
                    <FileLink label="BA Revisi 3 (E3)" url={recordData.fileTahapE3} />
                    <FileLink label="BA Revisi 4 (E4)" url={recordData.fileTahapE4} />
                    <FileLink label="BA Revisi 5 (E5)" url={recordData.fileTahapE5} />
                    <FileLink label="RPD (G)" url={recordData.fileTahapG} />
               M      <FileLink label="Izin Terbit (Arsip)" url={recordData.filePKPLH} />
                </tbody>
            </table>

            {/* Tabel checklist di bawah ini tidak terpengaruh */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }} border="1">
                <thead style={{backgroundColor:'#E7E6E6', textAlign:'center'}}>
                    <tr>
                        <th style={{width:'5%', padding:'8px'}}>No</th>
                        <th style={{padding:'8px'}}>Dokumen</th>
                        <th style={{width:'15%', padding:'8px'}}>Checklist</th>
                    </tr>
   _           </thead>
                <tbody>
                    {arsipChecklistItems.map((item, index) => (
                        <tr key={item}>
               _            <td style={{textAlign:'center', padding:'8px'}}>{index + 1}</td>
                            <td style={{padding:'8px'}}>{item}</td>
                            <td style={{height:'25px'}}></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ArsipPage;