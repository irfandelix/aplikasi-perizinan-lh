import React, { useState, useEffect, useCallback } from 'react';
import api from '../api'; // Pastikan menggunakan api.js

function CetakUlang() {
    const [nomorChecklist, setNomorChecklist] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // State baru untuk menyimpan data dokumen yang ditemukan
    const [recordData, setRecordData] = useState(null);

    // Fungsi ini akan mengambil data dari backend
    const fetchRecord = useCallback(async (checklist) => {
        if (!checklist) {
            setRecordData(null);
            setError('');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/record/find', { nomorChecklist: checklist });
            setRecordData(response.data.data); // Simpan data yang ditemukan
        } catch (err) {
            setRecordData(null);
            setError(err.response?.data?.message || 'Gagal menemukan dokumen.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Gunakan useEffect untuk memanggil fetchRecord secara otomatis saat user mengetik
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchRecord(nomorChecklist);
        }, 500); // Jeda 500ms agar tidak memanggil API setiap ketikan

        return () => {
            clearTimeout(handler);
        };
    }, [nomorChecklist, fetchRecord]);


    const handlePrint = (printPage) => {
        if (recordData && recordData.noUrut) {
            window.open(`/${printPage}/${recordData.noUrut}`, '_blank');
        } else {
            alert("Silakan masukkan Nomor Registrasi yang valid dan ditemukan terlebih dahulu.");
        }
    };

    // Variabel untuk mengecek apakah Tahap F sudah ada datanya
    const isTahapFAvailable = recordData && recordData.nomorPHP;

    return (
        <div style={{ marginTop: '2rem' }}>
            <fieldset>
                <legend>Cetak Ulang Tanda Terima</legend>
                <div>
                    <label htmlFor="nomorChecklistCetakUlang">Masukkan Nomor Registrasi Dokumen (Nomor Checklist):</label>
                    <input
                        id="nomorChecklistCetakUlang"
                        type="text"
                        value={nomorChecklist}
                        onChange={(e) => setNomorChecklist(e.target.value)}
                        placeholder="Ketik atau tempel Nomor Checklist di sini..."
                    />
                    {loading && <p>Mencari dokumen...</p>}
                    {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
                    {recordData && !loading && <p style={{ color: 'green' }}>✓ Dokumen ditemukan: {recordData.namaKegiatan}</p>}

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={() => handlePrint('checklist')} 
                            className="secondary"
                            // Tombol ini aktif jika dokumen ditemukan
                            disabled={!recordData}
                        >
                            🖨️ Cetak Tanda Terima Awal (Checklist)
                        </button>
                        <button 
                            onClick={() => handlePrint('penerimaan')} 
                            // Ganti warna menjadi biru (primary) jika Tahap F tersedia
                            className={isTahapFAvailable ? 'primary' : 'secondary'}
                            // Tombol ini hanya aktif jika Tahap F tersedia
                            disabled={!isTahapFAvailable}
                        >
                            🖨️ Cetak Tanda Terima Perbaikan (Tahap F)
                        </button>
                    </div>
                </div>
            </fieldset>
        </div>
    );
}

export default CetakUlang;

