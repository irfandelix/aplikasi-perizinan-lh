import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

// --- PERUBAHAN 1: Rapikan FileLink (Hapus colSpan) ---
const FileLink = ({ label, url }) => {
    if (!url) return null;
    return (
        <tr>
            {/* Tambahkan verticalAlign agar rapi */}
            <th style={{padding:'8px', textAlign:'left', verticalAlign:'top'}}>File {label}</th>
            {/* Hapus colSpan="2" dan tambahkan verticalAlign */}
            <td style={{padding:'8px', verticalAlign:'top'}}>: <a href={url} target="_blank" rel="noopener noreferrer" className="file-link" style={{color: 'var(--primary-color)', fontWeight: '600'}}>Lihat File</a></td>
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

    // Definisikan style sel agar konsisten
    const thStyle = { padding: '8px', textAlign: 'left', verticalAlign: 'top' };
    const tdStyle = { padding: '8px', verticalAlign: 'top' };

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', backgroundColor: 'white' }}>
            <div className="no-print" style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => navigate(-1)} className="secondary">Kembali</button>
                <button onClick={() => window.print()} className="primary">🖨️ Cetak</button>
            </div>

            <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>Checklist Arsip Dokumen Perizinan</h2>
            
            {/* --- PERUBAHAN 2: Gunakan <colgroup> dan buat 2 kolom rapi --- */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '11pt' }} border="1">
                {/* Definisikan lebar kolom di sini agar konsisten */}
                <colgroup>
                    <col style={{ width: '35%' }} /> {/* Kolom Label */}
                    <col style={{ width: '65%' }} /> {/* Kolom Value */}
                </colgroup>
                
        _       <tbody>
                    {/* Hapus colSpan="2" dari semua <td> dan gunakan style konsisten */}
                    <tr><th style={thStyle}>Nama Dokumen</th><td style={tdStyle}>: {recordData.namaKegiatan}</td></tr>
                    <tr><th style={thStyle}>Nomor Surat Permohonan</th><td style={tdStyle}>: {recordData.nomorSuratPermohonan}</td></tr>
              _     <tr><th style={thStyle}>Nomor Checklist Kelengkapan</th><td style={tdStyle}>: {recordData.nomorChecklist}</td></tr>
                    {recordData.nomorUjiBerkas && <tr><th style={thStyle}>Nomor BA Hasil Uji Administrasi</th><td style={tdStyle}>: {recordData.nomorUjiBerkas}</td></tr>}
                    {recordData.nomorBAVerlap && <tr><th style={thStyle}>Nomor BA Verifikasi Lapangan</th><td style={tdStyle}>: {recordData.nomorBAVerlap}</td></tr>}
                    {recordData.nomorBAPemeriksaan && <tr><th style={thStyle}>Nomor BA Pemeriksaan Berkas</th><td style={tdStyle}>: {recordData.nomorBAPemeriksaan}</td></tr>}
                    {recordData.nomorIzinTerbit && <tr><th style={thStyle}>Nomor Izin Terbit</th><td style={tdStyle}>: {recordData.nomorIzinTerbit}</td></tr>}
                    {recordData.nomorPHP && <tr><th style={thStyle}>Nomor Penerimaan Hasil Perbaikan</th><td style={tdStyle}>: {recordData.nomorPHP}</td></tr>}
                    {recordData.nomorRisalah && <tr><th style={thStyle}>Nomor Risalah Pengolahan Data</th><td style={tdStyle}>: {recordData.nomorRisalah}</td></tr>}
                    
                    {/* Komponen FileLink (yang sudah diubah) akan otomatis pas */}
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

            {/* Tabel kedua (checklist) sepertinya sudah OK */}
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
        _                 <td style={{textAlign:'center', padding:'8px'}}>{index + 1}</td>
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