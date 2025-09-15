import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const tableStyles = `
    .record-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1.5rem;
        font-size: 0.9rem;
    }
    .record-table th, .record-table td {
        border: 1px solid var(--border-color);
        padding: 0.75rem;
        text-align: left;
        vertical-align: top;
    }
    .record-table th {
        background-color: var(--light-gray);
        font-weight: 600;
        width: 30%;
    }
    .record-table td span {
        font-weight: bold;
        color: var(--primary-color);
    }
`;

const mapDokumenToIzin = (jenisDokumen) => {
    const mapping = {
        'SPPL': 'SPPL', 'UKLUPL': 'PKPLH', 'AMDAL': 'SKKL',
        'DELH': 'PKPLH', 'DPLH': 'PKPLH', 'PERTEK AIR LIMBAH': 'PERTEK AIR LIMBAH',
        'PERTEK EMISI': 'PERTEK EMISI', 'RINTEK LB3': 'RINTEK Limbah B3', 'SLO': 'SLO',
    };
    return mapping[jenisDokumen] || '';
};

function FormKantorLH() {
    const [nomorChecklist, setNomorChecklist] = useState('');
    const [recordData, setRecordData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('B');
    
    const [tahapBData, setTahapBData] = useState({ tanggalUjiBerkas: '' });
    const [tahapCData, setTahapCData] = useState({ tanggalVerifikasi: '' });
    const [tahapDData, setTahapDData] = useState({ tanggalPemeriksaan: '' });
    const [tahapEData, setTahapEData] = useState({ tanggalRevisi: '', nomorRevisi: '1' });
    const [tahapGData, setTahapGData] = useState({ nomorIzinTerbit: '', tanggalRisalah: '' });
    const [arsipData, setArsipData] = useState({});

    const fetchRecord = useCallback(async (checklist) => {
        if (!checklist) {
            setRecordData(null);
            setError('');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await api.post(`/record/find`, { nomorChecklist: checklist });
            setRecordData(response.data.data);
        } catch (err) {
            setRecordData(null);
            setError(err.response?.data?.message || 'Gagal mengambil data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (recordData && recordData.checklistArsip) {
            const savedChecks = recordData.checklistArsip.split(',').map(item => item.trim());
            const checkState = {};
            savedChecks.forEach(item => {
                if(item) checkState[item] = true;
            });
            setArsipData(checkState);
        } else {
            setArsipData({});
        }
    }, [recordData]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchRecord(nomorChecklist);
        }, 800);
        return () => clearTimeout(handler);
    }, [nomorChecklist, fetchRecord]);

    const handleApiSubmit = async (endpoint, payload) => {
        if (!recordData) {
            alert("Pilih dokumen yang valid terlebih dahulu.");
            return;
        }
        
        let finalPayload = { ...payload };
        if (endpoint === 'g') {
            finalPayload.jenisPerizinan = mapDokumenToIzin(recordData.jenisDokumen);
        }
        if (endpoint === 'arsip') {
            const checkedItemsString = Object.keys(payload.checklistArsip)
                .filter(key => payload.checklistArsip[key])
                .join(', ');
            finalPayload = { checklistArsip: checkedItemsString };
        }

        try {
            const response = await api.post(`/submit/${endpoint}`, { 
                noUrut: recordData.noUrut,
                ...finalPayload 
            });
            alert(response.data.message);
            
            fetchRecord(nomorChecklist);

            if (endpoint === 'b') setTahapBData({ tanggalUjiBerkas: '' });
            if (endpoint === 'c') setTahapCData({ tanggalVerifikasi: '' });
            if (endpoint === 'd') setTahapDData({ tanggalPemeriksaan: '' });
            if (endpoint === 'e') setTahapEData({ tanggalRevisi: '', nomorRevisi: '1' });
            if (endpoint === 'g') setTahapGData({ nomorIzinTerbit: '', tanggalRisalah: '' });
            if (endpoint === 'arsip') setArsipData({});

        } catch (err) {
            alert(err.response?.data?.message || "Terjadi kesalahan");
        }
    };
    
    const handleArsipCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setArsipData(prev => ({ ...prev, [name]: checked }));
    };

    const renderFormContent = () => {
        if (!recordData) return null;

        if (activeTab === 'B') {
            return ( <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('b', tahapBData); }}> <fieldset><legend>Tahap B</legend><div><label>Tanggal Penerbitan Uji Administrasi</label><input type="date" value={tahapBData.tanggalUjiBerkas} onChange={(e) => setTahapBData({ tanggalUjiBerkas: e.target.value })} required /></div></fieldset> <button type="submit" className="primary" disabled={!recordData}>Simpan</button> </form> );
        }
        if (activeTab === 'C') {
            return ( <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('c', tahapCData); }}> <fieldset><legend>Tahap C</legend><div><label>Tanggal Verifikasi Lapangan</label><input type="date" value={tahapCData.tanggalVerifikasi} onChange={(e) => setTahapCData({ tanggalVerifikasi: e.target.value })} required /></div></fieldset> <button type="submit" className="primary" disabled={!recordData}>Simpan</button> </form> );
        }
        if (activeTab === 'D') {
            return ( <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('d', tahapDData); }}> <fieldset><legend>Tahap D</legend><div><label>Tanggal Pemeriksaan Berkas</label><input type="date" value={tahapDData.tanggalPemeriksaan} onChange={(e) => setTahapDData({ tanggalPemeriksaan: e.target.value })} required /></div></fieldset> <button type="submit" className="primary" disabled={!recordData}>Simpan</button> </form> );
        }
        if (activeTab === 'E') {
            return ( <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('e', tahapEData); }}> <fieldset> <legend>Tahap E (Revisi)</legend> <div className="form-grid"> <div> <label>Pilih Revisi</label> <select value={tahapEData.nomorRevisi} onChange={(e) => setTahapEData(prev => ({ ...prev, nomorRevisi: e.target.value }))}> <option value="1">Revisi 1</option> <option value="2">Revisi 2</option> <option value="3">Revisi 3</option> <option value="4">Revisi 4</option> <option value="5">Revisi 5</option> </select> </div> <div> <label>Tanggal Pemeriksaan Revisi</label> <input type="date" value={tahapEData.tanggalRevisi} onChange={(e) => setTahapEData(prev => ({ ...prev, tanggalRevisi: e.target.value }))} required /> </div> </div> </fieldset> <button type="submit" className="primary" disabled={!recordData}>Simpan</button> </form> );
        }
        if (activeTab === 'G') {
            const jenisIzinOtomatis = mapDokumenToIzin(recordData.jenisDokumen);
            return ( <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('g', tahapGData); }}> <fieldset> <legend>Tahap G</legend> <div className="form-grid"> <div> <label>Nomor Perizinan Terbit</label> <input type="text" value={tahapGData.nomorIzinTerbit} onChange={(e) => setTahapGData(prev => ({ ...prev, nomorIzinTerbit: e.target.value }))} required /> </div> <div> <label>Jenis Perizinan</label> <input type="text" value={jenisIzinOtomatis} readOnly style={{ backgroundColor: '#e9ecef' }} /> </div> <div className="form-grid-full"> <label>Tanggal Pembuatan Risalah</label> <input type="date" value={tahapGData.tanggalRisalah} onChange={(e) => setTahapGData(prev => ({ ...prev, tanggalRisalah: e.target.value }))} required /> </div> </div> </fieldset> <button type="submit" className="primary" disabled={!recordData}>Simpan</button> </form> );
        }
        if (activeTab === 'Arsip') {
            const arsipChecklistItems = [
                "Surat Permohonan", "BA Checklist Pelayanan (Kelengkapan Berkas)", "BA Hasil Uji Administrasi",
                "BA Verifikasi Lapangan", "Undangan", "BA Pemeriksaan Dokumen", "Risalah Pengolahan Data",
                "Surat Penyampaian Dokumen Hasil Perbaikan", "Tanda Terima Berkas Penerimaan Hasil Perbaikan",
                "BA Pemeriksaan Dokumen II/III/Dst.", "PKPLH / SPPL / SKKL", "Dokumen Lingkungan"
            ];
            return (
                <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('arsip', { checklistArsip: arsipData }); }}>
                    <fieldset>
                        <legend>Checklist Arsip Dokumen Perizinan</legend>
                        <table className="record-table" style={{marginBottom: '2rem'}}>
                            <tbody>
                                <tr><th>Nama Dokumen</th><td>{recordData.jenisDokumen}</td></tr>
                                <tr><th>Nomor Surat Permohonan</th><td>{recordData.nomorSuratPermohonan}</td></tr>
                                <tr><th>Nomor Checklist Kelengkapan</th><td>{recordData.nomorChecklist}</td></tr>
                                <tr><th>Nomor BA Hasil Uji Administrasi</th><td>{recordData.nomorUjiBerkas}</td></tr>
                                <tr><th>Nomor BA Verifikasi Lapangan</th><td>{recordData.nomorBAVerlap}</td></tr>
                                <tr><th>Nomor BA Pemeriksaan Berkas</th><td>{recordData.nomorBAPemeriksaan}</td></tr>
                                <tr><th>Nomor PKPLH</th><td>{recordData.nomorIzinTerbit}</td></tr>
                                <tr><th>Nomor Penerimaan Hasil Perbaikan</th><td>{recordData.nomorPHP}</td></tr>
                                <tr><th>Nomor Risalah Pengolahan Data</th><td>{recordData.nomorRisalah}</td></tr>
                            </tbody>
                        </table>
                        <table className="record-table">
                            <thead style={{backgroundColor:'#E7E6E6', textAlign:'center'}}>
                                <tr><th style={{width:'5%'}}>No</th><th>Dokumen</th><th style={{width:'15%'}}>Checklist</th></tr>
                            </thead>
                            <tbody>
                                {arsipChecklistItems.map((item, index) => (
                                    <tr key={item}>
                                        <td style={{textAlign:'center'}}>{index + 1}</td>
                                        <td>{item}</td>
                                        <td style={{textAlign:'center'}}>
                                            <input type="checkbox" name={item} checked={arsipData[item] || false} onChange={handleArsipCheckboxChange} style={{width:'20px', height:'20px'}}/>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </fieldset>
                    <button type="submit" className="primary" disabled={!recordData}>Simpan Checklist Arsip</button>
                </form>
            );
        }
        return null;
    };

    const openArsipPrintPage = () => {
        if (recordData && recordData.noUrut) {
            window.open(`/arsip/${recordData.noUrut}`, '_blank');
        } else {
            alert("Silakan cari dokumen terlebih dahulu.");
        }
    };

    return (
        <div>
            <style>{tableStyles}</style>
            <h3>Update Data Dokumen Lingkungan</h3>
            <fieldset>
                <legend>Pilih Dokumen</legend>
                <label htmlFor="nomorChecklist">Masukkan Nomor Registrasi Dokumen (Nomor Checklist):</label>
                <input id="nomorChecklist" type="text" value={nomorChecklist} onChange={(e) => setNomorChecklist(e.target.value)} placeholder="Ketik atau tempel Nomor Checklist di sini..." required />
                {loading && <p>Mencari data...</p>}
                {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
            </fieldset>
            
            {recordData && (
                <>
                    <div className="tab-buttons" style={{ marginTop: '2rem' }}>
                        <button onClick={() => setActiveTab('B')} className={activeTab === 'B' ? 'active' : ''}>Tahap B</button>
                        <button onClick={() => setActiveTab('C')} className={activeTab === 'C' ? 'active' : ''}>Tahap C</button>
                        <button onClick={() => setActiveTab('D')} className={activeTab === 'D' ? 'active' : ''}>Tahap D</button>
                        <button onClick={() => setActiveTab('E')} className={activeTab === 'E' ? 'active' : ''}>Tahap E (Revisi)</button>
                        <button onClick={() => setActiveTab('G')} className={activeTab === 'G' ? 'active' : ''}>Tahap G</button>
                        <button onClick={openArsipPrintPage} className="secondary">Cetak Arsip</button>
                    </div>
                    
                    {renderFormContent()}

                    <div style={{ marginTop: '2rem' }}>
                        <h4>Detail Dokumen (No. Urut: {recordData.noUrut})</h4>
                        <table className="record-table">
                            <tbody>
                                <tr><th>Nomor Surat Permohonan</th><td>{recordData.nomorSuratPermohonan}</td></tr>
                                <tr><th>Tanggal Surat Permohonan</th><td>{recordData.tanggalSuratPermohonan}</td></tr>
                                <tr><th>Perihal Surat Permohonan</th><td>{recordData.perihalSuratPermohonan}</td></tr>
                                <tr><th>Nama Kegiatan</th><td>{recordData.namaKegiatan}</td></tr>
                                <tr><th>Lokasi Kegiatan</th><td>{recordData.lokasiKegiatan}</td></tr>
                                <tr><th>Jenis Kegiatan</th><td>{recordData.jenisKegiatan}</td></tr>
                                <tr><th>Jenis Dokumen</th><td>{recordData.jenisDokumen}</td></tr>
                                <tr><th>Tanggal Masuk Dokumen</th><td>{recordData.tanggalMasukDokumen}</td></tr>
                                <tr><th>Nama Pemrakarsa</th><td>{recordData.namaPemrakarsa} ({recordData.teleponPemrakarsa})</td></tr>
                                <tr><th>Nama Konsultan</th><td>{recordData.namaKonsultan} ({recordData.teleponKonsultan})</td></tr>
                                <tr><th>Petugas Penerima di MPP</th><td>{recordData.namaPetugas}</td></tr>
                                
                                {recordData.nomorUjiBerkas && (<><tr><th>Nomor BA Uji Administrasi</th><td><span>{recordData.nomorUjiBerkas}</span></td></tr><tr><th>Tanggal BA Uji Administrasi</th><td>{recordData.tanggalUjiBerkas}</td></tr></>)}
                                {recordData.nomorBAVerlap && (<><tr><th>Nomor BA Verifikasi Lapangan</th><td><span>{recordData.nomorBAVerlap}</span></td></tr><tr><th>Tanggal Verifikasi Lapangan</th><td>{recordData.tanggalVerlap}</td></tr></>)}
                                {recordData.nomorBAPemeriksaan && (<><tr><th>Nomor BA Pemeriksaan Substansi</th><td><span>{recordData.nomorBAPemeriksaan}</span></td></tr><tr><th>Tanggal Pemeriksaan Substansi</th><td>{recordData.tanggalPemeriksaan}</td></tr></>)}
                                {recordData.nomorRevisi1 && ( <tr><th>Nomor BA Revisi 1</th><td><span>{recordData.nomorRevisi1}</span> ({recordData.tanggalRevisi1})</td></tr> )}
                                {recordData.nomorRevisi2 && ( <tr><th>Nomor BA Revisi 2</th><td><span>{recordData.nomorRevisi2}</span> ({recordData.tanggalRevisi2})</td></tr> )}
                                {recordData.nomorRevisi3 && ( <tr><th>Nomor BA Revisi 3</th><td><span>{recordData.nomorRevisi3}</span> ({recordData.tanggalRevisi3})</td></tr> )}
                                {recordData.nomorRevisi4 && ( <tr><th>Nomor BA Revisi 4</th><td><span>{recordData.nomorRevisi4}</span> ({recordData.tanggalRevisi4})</td></tr> )}
                                {recordData.nomorRevisi5 && ( <tr><th>Nomor BA Revisi 5</th><td><span>{recordData.nomorRevisi5}</span> ({recordData.tanggalRevisi5})</td></tr> )}
                                {recordData.nomorPHP && (<><tr><th>Nomor Penerimaan Hasil Perbaikan</th><td><span>{recordData.nomorPHP}</span></td></tr><tr><th>Tanggal Penerimaan Hasil Perbaikan</th><td>{recordData.tanggalPHP}</td></tr></>)}
                                {recordData.nomorIzinTerbit && (<><tr><th>Nomor Izin Terbit</th><td><span>{recordData.nomorIzinTerbit}</span></td></tr><tr><th>Jenis Perizinan</th><td>{recordData.jenisPerizinan}</td></tr><tr><th>Nomor Risalah</th><td><span>{recordData.nomorRisalah}</span></td></tr><tr><th>Tanggal Risalah</th><td>{recordData.tanggalRisalah}</td></tr></>)}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default FormKantorLH;


