import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const tableStyles = `
    .record-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.9rem; }
    .record-table th, .record-table td { border: 1px solid var(--border-color); padding: 0.75rem; text-align: left; vertical-align: top; }
    .record-table th { background-color: var(--light-gray); font-weight: 600; width: 30%; }
    .record-table td span { font-weight: bold; color: var(--primary-color); }
`;

function FormTahapF() {
    const [nomorChecklist, setNomorChecklist] = useState('');
    const [recordData, setRecordData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [tahapFData, setTahapFData] = useState({ tanggalPHP: '' });

    const fetchRecord = useCallback(async (checklist) => {
        if (!checklist) {
            setRecordData(null);
            setError('');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await axios.post(`http://localhost:3001/api/record/find`, { nomorChecklist: checklist });
            setRecordData(response.data.data);
        } catch (err) {
            setRecordData(null);
            setError(err.response?.data?.message || 'Gagal mengambil data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchRecord(nomorChecklist);
        }, 800);
        return () => clearTimeout(handler);
    }, [nomorChecklist, fetchRecord]);

    const handleApiSubmit = async (e) => {
        e.preventDefault();
        if (!recordData) {
            alert("Pilih dokumen yang valid terlebih dahulu.");
            return;
        }
        try {
            const response = await axios.post(`http://localhost:3001/api/submit/f`, { 
                noUrut: recordData.noUrut,
                ...tahapFData 
            });
            
            if (response.data.success) {
                alert(response.data.message);
                
                const printWindow = window.open(`/penerimaan/${recordData.noUrut}`, '_blank');
                if (!printWindow) {
                    alert('Gagal membuka jendela cetak. Mohon izinkan pop-up untuk situs ini.');
                }
                
                fetchRecord(nomorChecklist);
                setTahapFData({ tanggalPHP: '' });
            }
        } catch (err) {
            alert(err.response?.data?.message || "Terjadi kesalahan");
        }
    };

    return (
        <div>
            <style>{tableStyles}</style>
            <fieldset>
                <legend>Pilih Dokumen</legend>
                <label htmlFor="nomorChecklistF">Masukkan Nomor Registrasi Dokumen (Nomor Checklist):</label>
                <input
                    id="nomorChecklistF"
                    type="text"
                    value={nomorChecklist}
                    onChange={(e) => setNomorChecklist(e.target.value)}
                    placeholder="Ketik atau tempel Nomor Checklist di sini..."
                    required
                />
                {loading && <p>Mencari data...</p>}
                {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
            </fieldset>
            
            <form onSubmit={handleApiSubmit} style={{marginTop: '2rem'}}>
                <fieldset>
                    <legend>Tahap F: Penerimaan Hasil Perbaikan Dokumen</legend>
                    <div>
                        <label htmlFor="tanggalPHP">Tanggal Menyerahkan Berkas Perbaikan (Kolom AM)</label>
                        <input id="tanggalPenyerahanPerbaikan" type="date" value={tahapFData.tanggalPenyerahanPerbaikan}
                            onChange={(e) => setTahapFData({ tanggalPenyerahanPerbaikan: e.target.value })}
                            required />
                    </div>
                </fieldset>
                <button type="submit" className="primary" disabled={!recordData} style={{marginTop: '1rem'}}>
                    Simpan & Cetak Tanda Terima
                </button>
            </form>

            {/* ===== TABEL DETAIL SEKARANG DIBUAT LENGKAP ===== */}
            {recordData && (
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
                            <tr><th>Tanggal Masuk Dokumen</th><td>{recordData.tanggalPHP}</td></tr>
                            <tr><th>Nama Pemrakarsa</th><td>{recordData.namaPemrakarsa} ({recordData.teleponPemrakarsa})</td></tr>
                            <tr><th>Nama Konsultan</th><td>{recordData.namaKonsultan} ({recordData.teleponKonsultan})</td></tr>
                            <tr><th>Petugas Penerima di MPP</th><td>{recordData.namaPetugas}</td></tr>
                            
                            {recordData.nomorUjiBerkas && (
                                <>
                                    <tr><th>Nomor BA Uji Administrasi</th><td><span>{recordData.nomorUjiBerkas}</span></td></tr>
                                    <tr><th>Tanggal BA Uji Administrasi</th><td>{recordData.tanggalUjiBerkas}</td></tr>
                                </>
                            )}
                            {recordData.nomorBAVerlap && (
                                <>
                                    <tr><th>Nomor BA Verifikasi Lapangan</th><td><span>{recordData.nomorBAVerlap}</span></td></tr>
                                    <tr><th>Tanggal Verifikasi Lapangan</th><td>{recordData.tanggalVerlap}</td></tr>
                                </>
                            )}
                            {recordData.nomorBAPemeriksaan && (
                                <>
                                    <tr><th>Nomor BA Pemeriksaan Substansi</th><td><span>{recordData.nomorBAPemeriksaan}</span></td></tr>
                                    <tr><th>Tanggal Pemeriksaan Substansi</th><td>{recordData.tanggalPemeriksaan}</td></tr>
                                </>
                            )}
                            {recordData.nomorRevisi1 && ( <tr><th>Nomor BA Revisi 1</th><td><span>{recordData.nomorRevisi1}</span> ({recordData.tanggalRevisi1})</td></tr> )}
                            {recordData.nomorRevisi2 && ( <tr><th>Nomor BA Revisi 2</th><td><span>{recordData.nomorRevisi2}</span> ({recordData.tanggalRevisi2})</td></tr> )}
                            {recordData.nomorRevisi3 && ( <tr><th>Nomor BA Revisi 3</th><td><span>{recordData.nomorRevisi3}</span> ({recordData.tanggalRevisi3})</td></tr> )}
                            {recordData.nomorRevisi4 && ( <tr><th>Nomor BA Revisi 4</th><td><span>{recordData.nomorRevisi4}</span> ({recordData.tanggalRevisi4})</td></tr> )}
                            {recordData.nomorRevisi5 && ( <tr><th>Nomor BA Revisi 5</th><td><span>{recordData.nomorRevisi5}</span> ({recordData.tanggalRevisi5})</td></tr> )}
                            
                            {recordData.nomorPHP && (
                                <>
                                    <tr>
                                        <th>Nomor Penerimaan Hasil Perbaikan</th>
                                        <td><span>{recordData.nomorPHP}</span></td>
                                    </tr>
                                    <tr>
                                        <th>Tanggal Penerimaan Hasil Perbaikan</th>
                                        <td>{recordData.tanggalPHP}</td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default FormTahapF;


