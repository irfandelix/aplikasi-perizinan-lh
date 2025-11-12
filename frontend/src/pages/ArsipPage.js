import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

// Helper kecil untuk membuat link file jika ada
const FileLink = ({ label, url }) => {
    if (!url) return null;
    return (
        <tr>
            <th style={{padding:'8px', textAlign:'left'}}>File {label}</th>
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

    // --- SOLUSI 'no-lone-blocks': Logika dipindah ke fungsi ini ---
    const renderChecklistRows = () => {
        /* GANTI NAMA FIELD DI BAWAH INI */
        const dataMap = {
           "Surat Permohonan": recordData.chk_surat_permohonan,
           "BA Checklist Pelayanan (Kelengkapan Berkas)": recordData.chk_ba_pelayanan,
           "BA Hasil Uji Administrasi": recordData.chk_uji_admin,
           "BA Verifikasi Lapangan": recordData.chk_verlap,
           "Undangan": recordData.chk_undangan,
           "BA Pemeriksaan Dokumen": recordData.chk_ba_pemeriksaan,
           "Risalah Pengolahan Data": recordData.chk_risalah,
           "Surat Penyampaian Dokumen Hasil Perbaikan": recordData.chk_surat_perbaikan,
           "Tanda Terima Berkas Penerimaan Hasil Perbaikan": recordData.chk_tanda_terima,
           "BA Pemeriksaan Dokumen II/III/Dst.": recordData.chk_ba_pemeriksaan_lanjutan,
           "PKPLH / SPPL / SKKL": recordData.chk_izin_terbit,
           "Dokumen Lingkungan": recordData.chk_dokumen_lingkungan
        };

        return arsipChecklistItems.map((item, index) => {
            const isChecked = dataMap[item];
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
            
            {/* --- TABEL 1: DETAIL (KONTEN SEBELUMNYA HILANG) --- */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '11pt' }} border="1">
                <tbody>
                    {/* Ini adalah konten tabel 1 yang benar */}
                    <tr><th style={{width:'35%', padding:'8px', textAlign:'left'}}>Nama Dokumen</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.namaKegiatan}</td></tr>
                    <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Surat Permohonan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorSuratPermohonan}</td></tr>
                    <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Checklist Kelengkapan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorChecklist}</td></tr>
                    {recordData.nomorUjiBerkas && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Hasil Uji Administrasi</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorUjiBerkas}</td></tr>}
                    {recordData.nomorBAVerlap && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Verifikasi Lapangan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorBAVerlap}</td></tr>}
                    {recordData.nomorBAPemeriksaan && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Pemeriksaan Berkas</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorBAPemeriksaan}</td></tr>}
                    {recordData.nomorIzinTerbit && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Izin Terbit</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorIzinTerbit}</td></tr>}
                    {recordData.nomorPHP && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Penerimaan Hasil Perbaikan</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorPHP}</td></tr>}
 Get                 {recordData.nomorRisalah && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Risalah Pengolahan Data</th><td colSpan="2" style={{padding:'8px'}}>: {recordData.nomorRisalah}</td></tr>}
                    
                    {/* --- SOLUSI 'no-unused-vars': Panggil FileLink di sini --- */}
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

            {/* --- TABEL 2: CHECKLIST (SEBELUMNYA KOSONG) --- */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }} border="1">
                <thead style={{backgroundColor:'#E7E6E6', textAlign:'center'}}>
                    <tr>
                        <th style={{width:'5%', padding:'8px'}}>No</th>
                        <th style={{padding:'8px'}}>Dokumen</th>
                        <th style={{width:'15%', padding:'8px'}}>Checklist</th>
                    </tr>
                </thead>
                {/* --- SOLUSI: Memanggil fungsi helper di sini --- */}
                <tbody>
                    {renderChecklistRows()}
                </tbody>
            </table>
        </div>
    );
}

export default ArsipPage;