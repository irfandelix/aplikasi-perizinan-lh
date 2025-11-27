import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import Modal from './Modal'; // <-- 1. IMPORT MODAL

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
    
const [tahapFData, setTahapFData] = useState({ 
        tanggalPenyerahanPerbaikan: '',
        petugasPenerimaPerbaikan: '',
        nomorRevisi: '1' // <--- TAMBAHAN: Default ke 1
   });

    // --- 2. TAMBAHKAN STATE & FUNGSI UNTUK MODAL ---
    const [modalInfo, setModalInfo] = useState({
        show: false,
        title: '',
        message: ''
    });

    const closeModal = () => {
        setModalInfo({ show: false, title: '', message: '' });
    };

    const showModal = (title, message) => {
        setModalInfo({ show: true, title, message });
    };

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
            if (response.data.data) {
                setTahapFData({
                    tanggalPenyerahanPerbaikan: response.data.data.tanggalPHP || '',
                    petugasPenerimaPerbaikan: response.data.data.petugasPenerimaPerbaikan || ''
                });
            }
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTahapFData(prev => ({ ...prev, [name]: value }));
    };

    // --- 3. MODIFIKASI handleApiSubmit ---
    const handleApiSubmit = async (e) => {
        e.preventDefault();
        if (!recordData) {
            showModal("Error", "Pilih dokumen yang valid terlebih dahulu."); // GANTI ALERT
            return;
        }
        try {
            const response = await api.post(`/submit/f`, { 
                noUrut: recordData.noUrut,
                ...tahapFData 
            });
            
            if (response.data.success) {
                // Coba buka tab baru
                const printWindow = window.open(`/penerimaan/${recordData.noUrut}`, '_blank');
                
                // Refresh data
                fetchRecord(nomorChecklist);
                setTahapFData({ 
                    tanggalPenyerahanPerbaikan: '', 
                    petugasPenerimaPerbaikan: '', 
                    nomorRevisi: '1' // Reset ke 1
                });

                // Tampilkan modal sukses (dengan atau tanpa peringatan popup)
                if (!printWindow) {
                    showModal(
                        "Sukses (Peringatan)", 
                        `${response.data.message}\n\nGagal membuka jendela cetak. Mohon izinkan pop-up untuk situs ini.`
                    );
                } else {
                    showModal("Sukses", response.data.message);
                }
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Terjadi kesalahan";
            showModal("Terjadi Kesalahan", errorMessage); // GANTI ALERT
        }
    };

    return (
        // --- 4. RENDER MODAL DI DALAM ROOT <div> ---
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
                    <div className="form-grid">
                        {/* --- INPUT BARU: PILIH PHP KE BERAPA --- */}
                        <div>
                            <label htmlFor="nomorRevisi">Penerimaan Hasil Perbaikan Ke-</label>
                            <select 
                                name="nomorRevisi" 
                                value={tahapFData.nomorRevisi} 
                                onChange={handleChange}
                            >
                                <option value="1">PHP Ke-1</option>
                                <option value="2">PHP Ke-2</option>
                                <option value="3">PHP Ke-3</option>
                                <option value="4">PHP Ke-4</option>
                                <option value="5">PHP Ke-5</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="tanggalPenyerahanPerbaikan">Tanggal Menyerahkan Berkas</label>
                            <input 
                                id="tanggalPenyerahanPerbaikan" 
                                name="tanggalPenyerahanPerbaikan"
                                type="date" 
                                value={tahapFData.tanggalPenyerahanPerbaikan}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                        <div>
                            <label htmlFor="petugasPenerimaPerbaikan">Nama Petugas yang Menerima</label>
                            <input 
                                id="petugasPenerimaPerbaikan"
                                name="petugasPenerimaPerbaikan"
                                type="text"
                                value={tahapFData.petugasPenerimaPerbaikan}
                                onChange={handleChange}
                                placeholder="Nama petugas di MPP"
                                required 
                            />
                        </div>
                    </div>
                </fieldset>
                <button type="submit" className="primary" disabled={!recordData} style={{marginTop: '1rem'}}>
                    Simpan & Cetak Tanda Terima
                </button>
            </form>

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
                            {/* Perbaikan: Ini seharusnya tanggalMasukDokumen asli, bukan tanggalPHP */}
                            <tr><th>Tanggal Masuk Dokumen Awal</th><td>{recordData.tanggalMasukDokumen}</td></tr>
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
                            
                            {/* PHP Awal (Hasil dari Revisi 1) */}
                            {recordData.nomorPHP && (
                                <>
                                    <tr>
                                        <th>Nomor PHP (Awal)</th>
                                        <td><span>{recordData.nomorPHP}</span></td>
                                    </tr>
                                    <tr>
                                        <th>Tanggal & Petugas (PHP Awal)</th>
                                        <td>{recordData.tanggalPHP} (Diterima oleh: {recordData.petugasPenerimaPerbaikan})</td>
                                    </tr>
                                </>
                            )}

                            {/* PHP 1 (Hasil dari Revisi 2) */}
                            {recordData.nomorPHP1 && (
                                <>
                                    <tr>
                                        <th>Nomor PHP 1 (Revisi 2)</th>
                                        <td><span>{recordData.nomorPHP1}</span></td>
                                    </tr>
                                    <tr>
                                        <th>Tanggal & Petugas (PHP 1)</th>
                                        <td>{recordData.tanggalPHP1} (Diterima oleh: {recordData.petugasPHP1})</td>
                                    </tr>
                                </>
                            )}

                            {/* PHP 2 (Hasil dari Revisi 3) */}
                            {recordData.nomorPHP2 && (
                                <>
                                    <tr>
                                        <th>Nomor PHP 2 (Revisi 3)</th>
                                        <td><span>{recordData.nomorPHP2}</span></td>
                                    </tr>
                                    <tr>
                                        <th>Tanggal & Petugas (PHP 2)</th>
                                        <td>{recordData.tanggalPHP2} (Diterima oleh: {recordData.petugasPHP2})</td>
                                    </tr>
                                </>
                            )}

                            {/* PHP 3 (Hasil dari Revisi 4) */}
                            {recordData.nomorPHP2 && (
                                <>
                                    <tr>
                                        <th>Nomor PHP 3 (Revisi 4)</th>
                                        <td><span>{recordData.nomorPHP3}</span></td>
                                    </tr>
                                    <tr>
                                        <th>Tanggal & Petugas (PHP 3)</th>
                                        <td>{recordData.tanggalPHP3} (Diterima oleh: {recordData.petugasPHP3})</td>
                                    </tr>
                                </>
                            )}

                            {/* PHP 2 (Hasil dari Revisi 3) */}
                            {recordData.nomorPHP2 && (
                                <>
                                    <tr>
                                        <th>Nomor PHP 4 (Revisi 5)</th>
                                        <td><span>{recordData.nomorPHP4}</span></td>
                                    </tr>
                                    <tr>
                                        <th>Tanggal & Petugas (PHP 4)</th>
                                        <td>{recordData.tanggalPHP4} (Diterima oleh: {recordData.petugasPHP4})</td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- 5. RENDER MODAL DI AKHIR --- */}
            <Modal
                show={modalInfo.show}
                title={modalInfo.title}
                onClose={closeModal}
            >
                {/* Menggunakan <p> tidak akan merender \n (newline).
                  Kita ubah jadi <div> dengan style CSS 'white-space: pre-wrap'
                  (Style ini sudah ada di Modal.js yang kita buat sebelumnya)
                */}
                {modalInfo.message}
            </Modal>
        </div>
    );
}

export default FormTahapF;