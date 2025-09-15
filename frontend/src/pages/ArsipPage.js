import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function ArsipPage() {
    const { noUrut } = useParams();
    const navigate = useNavigate();
    const [recordData, setRecordData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkedItems, setCheckedItems] = useState({});

    useEffect(() => {
        const fetchRecordData = async () => {
            try {
                const response = await api.get(`/record/${noUrut}`);
                setRecordData(response.data.data);

                if (response.data.data && response.data.data.checklistArsip) {
                    const savedChecks = response.data.data.checklistArsip.split(',').map(item => item.trim());
                    const checkState = {};
                    savedChecks.forEach(item => {
                        if (item) checkState[item] = true;
                    });
                    setCheckedItems(checkState);
                }
            } catch (error) {
                alert("Gagal mengambil data untuk arsip.");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchRecordData();
    }, [noUrut, navigate]);

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckedItems(prev => ({ ...prev, [name]: checked }));
    };

    if (loading || !recordData) {
        return <div>Mempersiapkan halaman arsip...</div>;
    }

    const arsipChecklistItems = [
        "Surat Permohonan", "BA Checklist Pelayanan (Kelengkapan Berkas)", "BA Hasil Uji Administrasi",
        "BA Verifikasi Lapangan", "Undangan", "BA Pemeriksaan Dokumen", "Risalah Pengolahan Data",
        "Surat Penyampaian Dokumen Hasil Perbaikan", "Tanda Terima Berkas Penerimaan Hasil Perbaikan",
        "BA Pemeriksaan Dokumen II/III/Dst.", "PKPLH / SPPL / SKKL", "Dokumen Lingkungan"
    ];

    return (
        <div className="container" style={{ fontFamily: 'Arial, sans-serif' }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body { margin: 1cm; }
                    .no-print { display: none !important; }
                    .container { padding: 0 !important; box-shadow: none !important; }
                    .arsip-table { font-size: 10pt !important; }
                    input[type="checkbox"] { display: none; }
                    .print-checkbox {
                        display: inline-block !important;
                        width: 16px;
                        height: 16px;
                        border: 1px solid black;
                        text-align: center;
                        line-height: 14px;
                    }
                }
                .print-checkbox { display: none; }
            `}} />

            <div className="no-print" style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => navigate('/dashboard')} className="secondary">Kembali ke Dashboard</button>
                <button onClick={() => window.print()} className="primary">🖨️ Cetak</button>
            </div>

            <div className="arsip-table">
                <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>Checklist Arsip Dokumen Perizinan</h2>

                {/* ===== TABEL INI SEKARANG MENAMPILKAN SEMUA DATA ===== */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '11pt' }} border="1">
                    <tbody>
                        <tr><th style={{width:'35%', padding:'8px', textAlign:'left'}}>Nama Dokumen</th><td style={{padding:'8px'}}>: {recordData.namaKegiatan}</td></tr>
                        <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Surat Permohonan</th><td style={{padding:'8px'}}>: {recordData.nomorSuratPermohonan}</td></tr>
                        <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Checklist Kelengkapan</th><td style={{padding:'8px'}}>: {recordData.nomorChecklist}</td></tr>
                        {recordData.nomorUjiBerkas && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Hasil Uji Administrasi</th><td style={{padding:'8px'}}>: {recordData.nomorUjiBerkas}</td></tr>}
                        {recordData.nomorBAVerlap && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Verifikasi Lapangan</th><td style={{padding:'8px'}}>: {recordData.nomorBAVerlap}</td></tr>}
                        {recordData.nomorBAPemeriksaan && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor BA Pemeriksaan Berkas</th><td style={{padding:'8px'}}>: {recordData.nomorBAPemeriksaan}</td></tr>}
                        {recordData.nomorIzinTerbit && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Izin Terbit</th><td style={{padding:'8px'}}>: {recordData.nomorIzinTerbit}</td></tr>}
                        {recordData.nomorPHP && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Penerimaan Hasil Perbaikan</th><td style={{padding:'8px'}}>: {recordData.nomorPHP}</td></tr>}
                        {recordData.nomorRisalah && <tr><th style={{padding:'8px', textAlign:'left'}}>Nomor Risalah Pengolahan Data</th><td style={{padding:'8px'}}>: {recordData.nomorRisalah}</td></tr>}
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
                                <td style={{textAlign:'center', padding:'8px'}}>
                                    <input 
                                        className="no-print"
                                        type="checkbox" 
                                        name={item} 
                                        checked={checkedItems[item] || false} 
                                        onChange={handleCheckboxChange} 
                                        style={{width:'20px', height:'20px'}}
                                    />
                                    <span className="print-checkbox">{checkedItems[item] ? '✓' : ''}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ArsipPage;