import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import Modal from './Modal'; // <-- 1. IMPORT MODAL

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

function FormPengembalian() {
    const [nomorChecklist, setNomorChecklist] = useState('');
    const [recordData, setRecordData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [tanggalPengembalian, setTanggalPengembalian] = useState('');

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
            setTanggalPengembalian(response.data.data.tanggalPengembalian || '');
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

    // --- 3. MODIFIKASI handleApiSubmit ---
    const handleApiSubmit = async (e) => {
        e.preventDefault();
        if (!recordData) {
            showModal("Error", "Pilih dokumen yang valid terlebih dahulu."); // GANTI ALERT
            return;
        }
        try {
            await api.post(`/submit/pengembalian`, { 
                noUrut: recordData.noUrut,
                tanggalPengembalian: tanggalPengembalian
            });
            
            showModal("Sukses", 'Status pengembalian dokumen berhasil disimpan!'); // GANTI ALERT
            fetchRecord(nomorChecklist); // Refresh data
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Terjadi kesalahan";
            showModal("Terjadi Kesalahan", errorMessage); // GANTI ALERT
        }
    };

    return (
        <div>
            <style>{tableStyles}</style>
            <fieldset>
                <legend>Pilih Dokumen</legend>
                <p>Gunakan form ini untuk mencatat tanggal saat dokumen dikembalikan dari Kantor LH (setelah diperiksa) ke pemrakarsa/konsultan untuk direvisi.</p>                
                <label htmlFor="nomorChecklistPengembalian">Masukkan Nomor Registrasi Dokumen (Nomor Checklist):</label>
                <input
                    id="nomorChecklistPengembalian"
                    type="text"
                    value={nomorChecklist}
                    onChange={(e) => setNomorChecklist(e.target.value)}
                    placeholder="Ketik atau tempel Nomor Checklist di sini..."
                    required
                />
                {loading && <p>Mencari data...</p>}
                {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
            </fieldset>
            
            {recordData && (
                <form onSubmit={handleApiSubmit}>
                    <fieldset>
                        <legend>Pengembalian Dokumen ke Pemrakarsa/Konsultan</legend>
                        <div>
                            <label htmlFor="tanggalPengembalian">Tanggal Pengembalian Dokumen</label>
                            <input 
                                id="tanggalPengembalian"
                                name="tanggalPengembalian"
                                type="date" 
                                value={tanggalPengembalian}
                                onChange={(e) => setTanggalPengembalian(e.target.value)}
                                required 
                            />
                        </div>
                    </fieldset>
                    <button type="submit" className="primary" disabled={!recordData} style={{marginTop: '1rem'}}>
                        Simpan Tanggal Pengembalian
                    </button>
                </form>
            )}

            {/* --- 4. RENDER MODAL DI AKHIR --- */}
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

export default FormPengembalian;