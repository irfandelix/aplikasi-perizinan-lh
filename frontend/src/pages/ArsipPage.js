import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

// --- PERUBAHAN 1: Tambahkan helper function FileLink ---
// Helper kecil untuk membuat link file jika ada
const FileLink = ({ label, url }) => {
    if (!url) return null;
    return (
        <tr>
            <th style={{padding:'8px', textAlign:'left'}}>File {label}</th>
            {/* Kita tambahkan colspan="2" agar formatnya rapi */}
            <td colSpan="2" style={{padding:'8px'}}>: <a href={url} target="_blank" rel="noopener noreferrer" className="file-link" style={{color: 'var(--primary-color)', fontWeight: '600'}}>{url}</a>
            </td>
        </tr>
    );
};

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

            <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>Checklist Arsip Dokumen Perizinan</h2>
            
            {/* --- PERUBAHAN 2: Tambahkan link file di tabel detail --- */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '11pt' }} border="1">
                <tbody>
                    {/* --- PERUBAHAN MULAI DARI SINI --- */}
                    {(() => {
                    {/*PENTING: GANTI NAMA FIELD DI BAWAH INI
                        Sesuaikan 'recordData.chk_...' dengan nama field boolean
                        true/false) yang Anda dapat dari API (database).
                    */}
                    const dataMap = {
                    "Surat Permohonan": recordData.chk_surat_permohonan, // GANTI SAYA
                    "BA Checklist Pelayanan (Kelengkapan Berkas)": recordData.chk_ba_pelayanan, // GANTI SAYA
                    "BA Hasil Uji Administrasi": recordData.chk_uji_admin, // GANTI SAYA
                    "BA Verifikasi Lapangan": recordData.chk_verlap, // GANTI SAYA
                    "Undangan": recordData.chk_undangan, // GANTI SAYA
                    "BA Pemeriksaan Dokumen": recordData.chk_ba_pemeriksaan, // GANTI SAYA
                    "Risalah Pengolahan Data": recordData.chk_risalah, // GANTI SAYA
                    "Surat Penyampaian Dokumen Hasil Perbaikan": recordData.chk_surat_perbaikan, // GANTI SAYA
                    "Tanda Terima Berkas Penerimaan Hasil Perbaikan": recordData.chk_tanda_terima, // GANTI SAYA
                    "BA Pemeriksaan Dokumen II/III/Dst.": recordData.chk_ba_pemeriksaan_lanjutan, // GANTI SAYA
                    "PKPLH / SPPL / SKKL": recordData.chk_izin_terbit, // GANTI SAYA
                    "Dokumen Lingkungan": recordData.chk_dokumen_lingkungan // GANTI SAYA
                    };
                    {/* Kode di bawah ini tidak perlu diubah lagi */}
                    return arsipChecklistItems.map((item, index) => {
                        const isChecked = dataMap[item]; // Ini akan bernilai true atau false
                    return (
                    <tr key={item}>
                        <td style={{textAlign:'center', padding:'8px'}}>{index + 1}</td>
                        <td style={{padding:'8px'}}>{item}</td>
                        <td style={{height:'25px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px'}}>
                        {isChecked ? '✔' : ''}
                        </td>
                    </tr>
                    );
                    });
                    })()}
                {/* --- PERUBAHAN SELESAI --- */}
                </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }} border="1">
                <thead style={{backgroundColor:'#E7E6E6', textAlign:'center'}}>
                    <tr>
                        <th style={{width:'5%', padding:'8px'}}>No</th>
                        <th style={{padding:'8px'}}>Dokumen</th>
                        <th style={{width:'15%', padding:'8px'}}>Checklist</th>
                    </tr>
                </thead>
                <tbody>
                    {arsipChecklistItems.map((item, index) => (
                        <tr key={item}>
                            <td style={{textAlign:'center', padding:'8px'}}>{index + 1}</td>
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

