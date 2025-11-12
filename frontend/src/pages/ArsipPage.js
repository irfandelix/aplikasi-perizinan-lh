import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

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

    // --- FIX 'no-lone-blocks': Logika dipindah ke helper function ---
    const renderChecklistRows = () => {
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
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', backgroundColor: 'white' }}>

            <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>Checklist Arsip Dokumen Perizinan</h2>
            
            {/* --- FIX: Ini adalah TABEL 1 (Detail) --- */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '11pt' }} border="1">
                <tbody>
                    {/* --- Konten detail yang benar (sebelumnya hilang) --- */}
                    <tr><th style={{width:'35%', padding:'8px', textAlign:'left'}}>Nama Dokumen</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.namaKegiatan}</td></tr>
                    <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Surat Permohonan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorSuratPermohonan}</td></tr>
                    <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Checklist Kelengkapan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorChecklist}</td></tr>
                    {recordData.nomorUjiBerkas && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Hasil Uji Administrasi</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorUjiBerkas}</td></tr>}
                    {recordData.nomorBAVerlap && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Verifikasi Lapangan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorBAVerlap}</td></tr>}
                    {recordData.nomorBAPemeriksaan && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Pemeriksaan Berkas</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorBAPemeriksaan}</td></tr>}
                    {recordData.nomorIzinTerbit && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Izin Terbit</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorIzinTerbit}</td></tr>}
                    {recordData.nomorPHP && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Penerimaan Hasil Perbaikan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorPHP}</td></tr>}
                    {recordData.nomorRisalah && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Risalah Pengolahan Data</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorRisalah}</td></tr>}
                    
                    {/* --- FIX 'no-unused-vars': Memanggil FileLink di sini --- */}
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

            {/* --- FIX: Ini adalah TABEL 2 (Checklist) --- */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }} border="1">
                <thead style={{backgroundColor:'#E7E6E6', textAlign:'center'}}>
                    <tr>
                        <th style={{width:'5%', padding:'8px'}}>No</th>
                        <th style={{padding:'8px'}}>Dokumen</th>
                        <th style={{width:'15%', padding:'8px'}}>Checklist</th>
                    </tr>
                </thead>
                {/* --- FIX: Logika checklist dipanggil di sini --- */}
                <tbody>
                    {renderChecklistRows()}
 _            </tbody>
            </table>
        </div>
    );
}

export default ArsipPage;