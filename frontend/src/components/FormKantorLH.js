import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import FileUpload from './FileUpload';
import Modal from './Modal'; // <-- 1. IMPORT MODAL (tanpa CSS)

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

function FormKantorLH() {
    const [nomorChecklist, setNomorChecklist] = useState('');
    const [recordData, setRecordData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('B');
    
    // ... (State lain tidak berubah)
    const [tahapBData, setTahapBData] = useState({ tanggalPenerbitanUa: '' });
    const [tahapCData, setTahapCData] = useState({ tanggalVerifikasi: '' });
    const [tahapDData, setTahapDData] = useState({ tanggalPemeriksaan: '' });
    const [tahapEData, setTahapEData] = useState({ tanggalRevisi: '', nomorRevisi: '1' });
    const [tahapGData, setTahapGData] = useState({ tanggalPembuatanRisalah: '' });
    const [arsipData, setArsipData] = useState({ nomorIzinTerbit: '', checklistArsip: {} });
    const [pengembalianData, setPengembalianData] = useState({ tanggalPengembalian: '' });

    // --- 2. TAMBAHKAN STATE UNTUK MODAL ---
    const [modalInfo, setModalInfo] = useState({
        show: false,
        title: '',
        message: ''
    });

    // --- 3. TAMBAHKAN FUNGSI UNTUK MENUTUP & MEMBUKA MODAL ---
    const closeModal = () => {
        setModalInfo({ show: false, title: '', message: '' });
    };

    const showModal = (title, message) => {
        setModalInfo({ show: true, title, message });
    };

    // ... (fetchRecord tidak berubah)
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
            // Anda bisa juga gunakan modal di sini jika mau
            setError(err.response?.data?.message || 'Gagal mengambil data.');
        } finally {
            setLoading(false);
        }
    }, []);

    // ... (useEffect untuk pre-fill form tidak berubah)
    useEffect(() => {
        if (recordData) {
            setTahapBData({ tanggalPenerbitanUa: recordData.tanggalUjiBerkas || '' });
            setTahapCData({ tanggalVerifikasi: recordData.tanggalVerlap || '' });
            setTahapDData({ tanggalPemeriksaan: recordData.tanggalPemeriksaan || '' });
            setTahapGData({ tanggalPembuatanRisalah: recordData.tanggalRisalah || '' });
            
            const savedChecks = recordData.checklistArsip ? recordData.checklistArsip.split(',').map(item => item.trim()) : [];
            const checkState = {};
            savedChecks.forEach(item => { if(item) checkState[item] = true; });
            setArsipData({
                nomorIzinTerbit: recordData.nomorIzinTerbit || '',
                checklistArsip: checkState
            });
            setPengembalianData({ tanggalPengembalian: recordData.tanggalPengembalian || '' });
        }
    }, [recordData]);

    // ... (useEffect untuk debounce tidak berubah)
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchRecord(nomorChecklist);
        }, 800);
        return () => clearTimeout(handler);
    }, [nomorChecklist, fetchRecord]);

    // --- 4. MODIFIKASI handleApiSubmit UNTUK MENGGUNAKAN showModal() ---
    const handleApiSubmit = async (endpoint, payload, callback) => {
        if (!recordData) {
            showModal("Error", "Pilih dokumen yang valid terlebih dahulu."); // GANTI ALERT
            return;
        }
        
        if (endpoint === 'e' || endpoint === 'g') {
            const fileCExists = recordData.fileTahapC;
            const fileDExists = recordData.fileTahapD;
            
            if (!fileCExists && !fileDExists) {
                showModal( // GANTI ALERT
                    "Tahap Belum Terbuka", 
                    "Harap upload file BA Verifikasi Lapangan (Tahap C) atau BA Pemeriksaan (Tahap D) terlebih dahulu."
                );
                return; 
            }
        }

        let finalPayload = { ...payload };
        if (endpoint === 'arsip_perizinan') {
            const checkedItemsString = Object.keys(payload.checklistArsip).filter(key => payload.checklistArsip[key]).join(', ');
            finalPayload = { 
                checklistArsip: checkedItemsString,
                nomorIzinTerbit: payload.nomorIzinTerbit
            };
        }

        try {
            const response = await api.post(`/submit/${endpoint}`, { 
                noUrut: recordData.noUrut,
                ...finalPayload 
            });
            showModal("Sukses", response.data.message); // GANTI ALERT
            fetchRecord(nomorChecklist);
            if (callback) callback();
        } catch (err) {
            showModal("Terjadi Kesalahan", err.response?.data?.message || "Gagal terhubung ke server."); // GANTI ALERT
        }
    };
    
    // ... (handleArsipChange tidak berubah)
    const handleArsipChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setArsipData(prev => ({
                ...prev,
                checklistArsip: { ...prev.checklistArsip, [name]: checked }
            }));
        } else {
            setArsipData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- 5. MODIFIKASI handleTabClick UNTUK MENGGUNAKAN showModal() ---
    const handleTabClick = (tabName) => {
        if (tabName === 'E' || tabName === 'G') {
            if (!recordData) return;

            const fileCExists = recordData.fileTahapC;
            const fileDExists = recordData.fileTahapD;

            if (!fileCExists && !fileDExists) {
                showModal( // GANTI ALERT
                    "Tahap Belum Terbuka",
                    "Harap upload file BA Verifikasi Lapangan (Tahap C) dan/atau BA Pemeriksaan (Tahap D) terlebih dahulu sebelum melanjutkan ke tahap ini."
                );
                return;
            }
        }
        
        setActiveTab(tabName);
    };

    // ... (renderFormContent tidak berubah)
    const renderFormContent = () => {
        if (!recordData) return null;
        const noUrut = recordData.noUrut;
        const namaKegiatan = recordData.namaKegiatan;

        if (activeTab === 'B') {
            return (
                <div>
                    <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('b', tahapBData); }}> <fieldset><legend>Tahap B: Hasil Uji Administrasi</legend><div><label>Tanggal Penerbitan Uji Administrasi</label><input type="date" value={tahapBData.tanggalPenerbitanUa} onChange={(e) => setTahapBData({ tanggalPenerbitanUa: e.target.value })} required /></div></fieldset> <button type="submit" className="primary">Simpan Tahap B</button> </form>
                    <FileUpload noUrut={noUrut} fileType="BA HUA" dbField="fileTahapB" currentFileUrl={recordData.fileTahapB} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} />
                </div>
            );
        }
        if (activeTab === 'C') {
            return (
                <div>
                    <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('c', tahapCData); }}> <fieldset><legend>Tahap C: Verifikasi Lapangan</legend><div><label>Tanggal Verifikasi Lapangan</label><input type="date" value={tahapCData.tanggalVerifikasi} onChange={(e) => setTahapCData({ tanggalVerifikasi: e.target.value })} /></div></fieldset> <button type="submit" className="primary">Simpan Tahap C</button> </form>
                    <FileUpload noUrut={noUrut} fileType="BA Verlap" dbField="fileTahapC" currentFileUrl={recordData.fileTahapC} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} />
                </div>
            );
        }
        if (activeTab === 'D') {
            return (
                <div>
                    <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('d', tahapDData); }}> <fieldset><legend>Tahap D: Pemeriksaan Berkas</legend><div><label>Tanggal Pemeriksaan Berkas</label><input type="date" value={tahapDData.tanggalPemeriksaan} onChange={(e) => setTahapDData({ tanggalPemeriksaan: e.target.value })} /></div></fieldset> <button type="submit" className="primary">Simpan Tahap D</button> </form>
                    <FileUpload noUrut={noUrut} fileType="BA Pemeriksaan" dbField="fileTahapD" currentFileUrl={recordData.fileTahapD} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} />
                </div>
            );
        }
        if (activeTab === 'E') {
            const dbField = `fileTahapE${tahapEData.nomorRevisi}`;
            const currentUrl = recordData[dbField];
            return (
                <div>
                    <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('e', tahapEData); }}> <fieldset> <legend>Tahap E: Pemeriksaan Revisi</legend> <div className="form-grid"> <div> <label>Pilih Revisi</label> <select name="nomorRevisi" value={tahapEData.nomorRevisi} onChange={(e) => setTahapEData(prev => ({ ...prev, nomorRevisi: e.target.value }))}> <option value="1">Revisi 1</option> <option value="2">Revisi 2</option> <option value="3">Revisi 3</option> <option value="4">Revisi 4</option> <option value="5">Revisi 5</option> </select> </div> <div> <label>Tanggal Pemeriksaan Revisi</label> <input type="date" name="tanggalRevisi" value={tahapEData.tanggalRevisi} onChange={(e) => setTahapEData(prev => ({ ...prev, tanggalRevisi: e.target.value }))} required /> </div> </div> </fieldset> <button type="submit" className="primary">Simpan Revisi</button> </form>
                    <FileUpload noUrut={noUrut} fileType={`BA Revisi ${tahapEData.nomorRevisi}`} dbField={dbField} currentFileUrl={currentUrl} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} />
                </div>
            );
        }
        if (activeTab === 'G') {
            return (
                <div>
                    <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('g', tahapGData); }}> <fieldset><legend>Tahap G: Risalah Pengolahan Data</legend><div> <label>Tanggal Pembuatan Risalah</label> <input type="date" value={tahapGData.tanggalPembuatanRisalah} onChange={(e) => setTahapGData({ tanggalPembuatanRisalah: e.target.value })} required /> </div> </fieldset> <button type="submit" className="primary">Simpan Tanggal Risalah</button> </form>
                    <FileUpload noUrut={noUrut} fileType="RPD" dbField="fileTahapG" currentFileUrl={recordData.fileTahapG} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} />
                </div>
            );
        }
        if (activeTab === 'Arsip') {
            const arsipChecklistItems = [ "Surat Permohonan", "BA Checklist Pelayanan", "BA Hasil Uji Administrasi", "BA Verifikasi Lapangan", "Undangan", "BA Pemeriksaan Dokumen", "Risalah Pengolahan Data", "Surat Penyampaian Dokumen Hasil Perbaikan", "Tanda Terima Berkas Perbaikan", "BA Pemeriksaan Dokumen II/III/Dst.", "PKPLH / SPPL / SKKL", "Dokumen Lingkungan" ];
            return (
                <div>
                    <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('arsip_perizinan', arsipData, () => window.open(`/arsip/${recordData.noUrut}`, '_blank')); }}>
                        <fieldset>
                            <legend>Checklist Arsip & Izin Terbit</legend>
                            <div className="form-grid-full" style={{marginBottom: '1.5rem'}}>
                                <label>Nomor Izin Terbit (SPPL/PKPLH/SKKL)</label>
                                <input type="text" name="nomorIzinTerbit" value={arsipData.nomorIzinTerbit} onChange={handleArsipChange} />
                            </div>
                            <table className="record-table">
                                <thead><tr><th style={{width:'5%'}}>No</th><th>Dokumen</th><th style={{width:'15%'}}>Checklist</th></tr></thead>
                                <tbody>
                                    {arsipChecklistItems.map((item, index) => (
                                        <tr key={item}>
                                            <td style={{textAlign:'center'}}>{index + 1}</td>
                                            <td>{item}</td>
                                            <td style={{textAlign:'center'}}>
                                                <input type="checkbox" name={item} checked={arsipData.checklistArsip[item] || false} onChange={handleArsipChange} style={{width:'20px', height:'20px'}}/>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </fieldset>
                        <button type="submit" className="primary">Simpan & Cetak Arsip</button>
                    </form>
                    <FileUpload noUrut={noUrut} fileType="Izin Terbit (Final)" dbField="filePKPLH" currentFileUrl={recordData.filePKPLH} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} />
                </div>
            );
        }
        if (activeTab === 'Pengembalian') {
            return (
                <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('pengembalian', pengembalianData); }}>
                    <fieldset>
                        <legend>Pengembalian Dokumen ke Pemrakarsa</legend>
                        <p>Gunakan form ini untuk mencatat tanggal saat dokumen dikembalikan ke pemrakarsa/konsultan untuk direvisi.</p>
                        <div>
                            <label>Tanggal Pengembalian</label>
                            <input type="date" value={pengembalianData.tanggalPengembalian} onChange={(e) => setPengembalianData({ tanggalPengembalian: e.target.value })} required />
                        </div>
                    </fieldset>
                    <button type="submit" className="primary" style={{marginTop: '1rem'}}>
                        Simpan Status Pengembalian
                    </button>
                </form>
            );
        }
        return null;
    };

    // --- 6. RENDER KOMPONEN MODAL DI DALAM JSX ---
    return (
        <div>
            <style>{tableStyles}</style>
            <h3>Update Data Dokumen Lingkungan</h3>
            <fieldset>
                <legend>Pilih Dokumen</legend>
                <label htmlFor="nomorChecklist">Masukkan Nomor Registrasi Dokumen (Nomor Checklist):</label>
                <input id="nomorChecklist" type="text" value={nomorChecklist} onChange={(e) => setNomorChecklist(e.target.value)} placeholder="Ketik atau tempel Nomor Checklist..." required />
                {loading && <p>Mencari data...</p>}
                {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
            </fieldset>
            
            {recordData && (
                <>
                    <div className="tab-buttons" style={{ marginTop: '2rem' }}>
                        <button onClick={() => handleTabClick('B')} className={activeTab === 'B' ? 'active' : ''}>Tahap B</button>
                        <button onClick={() => handleTabClick('C')} className={activeTab === 'C' ? 'active' : ''}>Tahap C</button>
                        <button onClick={() => handleTabClick('D')} className={activeTab === 'D' ? 'active' : ''}>Tahap D</button>
                        <button onClick={() => handleTabClick('E')} className={activeTab === 'E' ? 'active' : ''}>Tahap E (Revisi)</button>
                        <button onClick={() => handleTabClick('G')} className={activeTab === 'G' ? 'active' : ''}>Tahap G</button>
                        <button onClick={() => handleTabClick('Pengembalian')} className={activeTab === 'Pengembalian' ? 'active' : ''}>Pengembalian</button>
                        <button onClick={() => handleTabClick('Arsip')} className={activeTab === 'Arsip' ? 'active' : ''}>Arsip</button>
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
                                {recordData.nomorRisalah && (<><tr><th>Nomor Izin Terbit</th><td><span>{recordData.nomorIzinTerbit}</span></td></tr><tr><th>Jenis Perizinan</th><td>{recordData.jenisPerizinan}</td></tr><tr><th>Nomor Risalah</th><td><span>{recordData.nomorRisalah}</span></td></tr><tr><th>Tanggal Risalah</th><td>{recordData.tanggalRisalah}</td></tr></>)}
                                
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
                    </div>
                </>
            )}

            {/* --- 7. RENDER MODAL DI SINI --- */}
            <Modal
                show={modalInfo.show}
                title={modalInfo.title}
                onClose={closeModal}
            >
                <p>{modalInfo.message}</p>
            </Modal>
        </div>
    );
}

// Helper kecil untuk membuat link file jika ada
const FileLink = ({ label, url }) => {
    if (!url) return null;
    return (
        <tr>
            <th style={{padding:'8px', textAlign:'left'}}>File {label}</th>
            <td style={{padding:'8px'}}>: <a href={url} target="_blank" rel="noopener noreferrer" className="file-link">Lihat File</a></td>
        </tr>
    );
};

export default FormKantorLH;