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

function FormPengembalian() {
    const [nomorChecklist, setNomorChecklist] = useState('');
    const [recordData, setRecordData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [tanggalPengembalian, setTanggalPengembalian] = useState('');

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

    const handleApiSubmit = async (e) => {
        e.preventDefault();
        if (!recordData) {
            alert("Pilih dokumen yang valid terlebih dahulu.");
            return;
        }
        try {
            await api.post(`/submit/pengembalian`, { 
                noUrut: recordData.noUrut,
                tanggalPengembalian: tanggalPengembalian
            });
            
            alert('Status pengembalian dokumen berhasil disimpan!');
            fetchRecord(nomorChecklist); // Refresh data
        } catch (err) {
            alert(err.response?.data?.message || "Terjadi kesalahan");
        }
    };

    return (
        <div>
            <style>{tableStyles}</style>
            <fieldset>
                <legend>Pilih Dokumen</legend>
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
                <form onSubmit={handleApiSubmit} style={{marginTop: '2rem'}}>
                    <fieldset>
                        <legend>Pengembalian Dokumen ke Pemrakarsa/Konsultan</legend>
                        <p>Gunakan form ini untuk mencatat tanggal saat dokumen dikembalikan dari Kantor LH (setelah diperiksa) ke pemrakarsa/konsultan untuk direvisi.</p>
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
        </div>
    );
}

export default FormPengembalian;
