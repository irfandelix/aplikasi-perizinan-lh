import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

// Helper kecil untuk membuat link file jika ada
const FileLink = ({ label, url }) => {
    if (!url) return null;
    return (
        <tr>
            <th style={{padding:'8px', textAlign:'left'}}>File {label}</th>
            <td colSpan="2" style={{padding:'8px'}}>: <a href={url} target="_blank" rel="noopener noreferrer" className="file-link" style={{color: 'var(--primary-color)', fontWeight: '600'}}>{url}</a></td>
        </tr>
    );
};

// --- PERUBAHAN 1: Komponen CSS untuk Print ---
// Kita tambahkan CSS ini agar hasil print rapi.
// Di layar akan tampil checkbox, tapi saat di-print akan tampil simbol ✔ atau □
const PrintStyles = () => (
    <style>
        {`
            @media print {
                /* Sembunyikan checkbox interaktif saat print */
                .screen-only-checkbox {
                    display: none;
                }
                /* Tampilkan simbol pengganti saat print */
                .print-only-symbol {
                    display: inline-block;
                    font-size: 1.2rem;
                    font-weight: bold;
                    font-family: 'Arial', sans-serif;
                }
            }
            @media screen {
                /* Sembunyikan simbol pengganti saat di layar */
                .print-only-symbol {
                    display: none;
                }
            }
        `}
    </style>
);


function ArsipPage() {
    const { noUrut } = useParams();
    const navigate = useNavigate();
    const [recordData, setRecordData] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- PERUBAHAN 2: Kembalikan daftar item statis ---
    // Ini adalah daftar item yang akan selalu muncul
    const arsipChecklistItems = [
        "Surat Permohonan", "BA Checklist Pelayanan (Kelengkapan Berkas)", "BA Hasil Uji Administrasi",
        "BA Verifikasi Lapangan", "Undangan", "BA Pemeriksaan Dokumen", "Risalah Pengolahan Data",
        "Surat Penyampaian Dokumen Hasil Perbaikan", "Tanda Terima Berkas Penerimaan Hasil Perbaikan",
        "BA Pemeriksaan Dokumen II/III/Dst.", "PKPLH / SPPL / SKKL", "Dokumen Lingkungan"
    ];

    // --- PERUBAHAN 3: Tambah State untuk checklist manual ---
    // Kita buat state untuk menyimpan kondisi checked dari setiap item
    // Kita inisialisasi semua item sebagai 'false' (belum tercentang)
    const [checkedState, setCheckedState] = useState(() => {
        return arsipChecklistItems.reduce((acc, item) => {
            acc[item] = false;
            return acc;
        }, {});
    });

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

    // --- PERUBAHAN 4: Buat fungsi untuk menangani klik checkbox ---
    const handleCheckboxChange = (itemName) => {
        setCheckedState(prevState => ({
            ...prevState,
            [itemName]: !prevState[itemName] // Toggle nilai boolean-nya
        }));
    };
    

    if (loading || !recordData) {
        return <div>Mempersiapkan halaman cetak arsip...</div>;
    }

    // Hapus 'dynamicChecklistItems' karena kita tidak membutuhkannya lagi

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', backgroundColor: 'white' }}>
            {/* Tambahkan style untuk print */}
            <PrintStyles />

            <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>Checklist Arsip Dokumen Perizinan</h2>
            
            {/* Tabel Data (Tidak berubah) */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '11pt' }} border="1">
                <tbody>
                    <tr><th style={{width:'35%', padding:'8px', textAlign:'left'}}>Nama Dokumen</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.namaKegiatan}</td></tr>
                    <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Surat Permohonan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorSuratPermohonan}</td></tr>
                    <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Checklist Kelengkapan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorChecklist}</td></tr>
                    {recordData.nomorUjiBerkas && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Hasil Uji Administrasi</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorUjiBerkas}</td></tr>}
                    {recordData.nomorBAVerlap && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Verifikasi Lapangan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorBAVerlap}</td></tr>}
                    {recordData.nomorBAPemeriksaan && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Pemeriksaan Berkas</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorBAPemeriksaan}</td></tr>}
                    {recordData.nomorIzinTerbit && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Izin Terbit</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorIzinTerbit}</td></tr>}
                    {recordData.nomorPHP && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Penerimaan Hasil Perbaikan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorPHP}</td></tr>}
                    {recordData.nomorRisalah && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Risalah Pengolahan Data</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorRisalah}</td></tr>}
                    
                    <FileLink label="BA HUA (B)" url={recordData.fileTahapB} />
                    <FileLink label="BA Verlap (C)" url={recordData.fileTahapC} />
                    <FileLink label="BA Pemeriksaan (D)" url={recordData.fileTahapD} />
                    <FileLink label="BA Revisi 1 (E1)" url={recordData.fileTahapE1} />
                    <FileLink label="BA Revisi 2 (E2)" url={recordData.fileTahapE2} />
                    <FileLink label="BA Revisi 3 (E3)" url={recordData.fileTahapE3} />
                    <FileLink label="BA Revisi 4 (E4)" url={recordData.fileTahapE4} />
                    <FileLink label="BA Revisi 5 (E5)" url={recordData.fileTahapE5} />
                    <FileLink label="RPD (G)" url={recordData.fileTahapG} />
                    <FileLink label="Izin Terbit (Arsip)" url={recordData.filePKPLH} />
                </tbody>
            </table>

            {/* Tabel Checklist (Sekarang Interaktif) */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }} border="1">
                <thead style={{backgroundColor:'#E7E6E6', textAlign:'center'}}>
                    <tr>
                        <th style={{width:'5%', padding:'8px'}}>No</th>
                        <th style={{padding:'8px'}}>Dokumen</th>
                        <th style={{width:'15%', padding:'8px'}}>Checklist</th>
                    </tr>
                </thead>
                <tbody>
                    {/* --- PERUBAHAN 5: Gunakan 'arsipChecklistItems' dan state 'checkedState' --- */}
                    {arsipChecklistItems.map((item, index) => (
                        <tr key={item}>
                            <td style={{textAlign:'center', padding:'8px'}}>{index + 1}</td>
                            <td style={{padding:'8px'}}>{item}</td>
                            
                            <td style={{height:'25px', textAlign: 'center'}}>
                                {/* Checkbox ini hanya tampil di layar */}
                                <input
                                    className="screen-only-checkbox"
                                    type="checkbox"
                                    // Status checked-nya dikontrol oleh state
                                    checked={checkedState[item]}
                                    // Saat di-klik, panggil handler
                                    onChange={() => handleCheckboxChange(item)}
                                    style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer' }}
                                />
                                {/* Simbol ini hanya tampil saat di-print */}
                                <span className="print-only-symbol">
                                    {checkedState[item] ? '✔' : '□'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ArsipPage;