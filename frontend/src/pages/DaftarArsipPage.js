import React, { useState, useEffect } from 'react';
import api from '../api'; // Menggunakan jembatan API
import * as XLSX from 'xlsx';

// --- CSS tidak berubah ---
const arsipTableStyles = `
    .arsip-table-wrapper {
        max-height: 70vh;
        overflow: auto;
        margin-top: 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        position: relative;
    }
    .arsip-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 1600px;
    }
    .arsip-table th, .arsip-table td {
        border: 1px solid var(--border-color);
        padding: 0.75rem;
        text-align: left;
        vertical-align: top;
        white-space: normal;
        word-wrap: break-word;
    }
    .arsip-table thead {
        background-color: #d1fae5; /* Warna hijau muda */
        color: #065f46; /* Warna teks hijau tua */
    }
    .arsip-table th {
        position: sticky;
        top: 0;
        z-index: 10;
    }
    .arsip-table tbody tr:nth-child(even) {
        background-color: #f8f9fa;
    }

    /* --- GAYA UNTUK FREEZE COLUMN --- */
    .arsip-table .freeze {
        position: sticky;
        background-color: white;
    }
    .arsip-table tbody tr:nth-child(even) .freeze {
        background-color: #f8f9fa;
    }
    .arsip-table th.freeze {
        background-color: #d1fae5;
        z-index: 20;
    }
    
    .arsip-table .col-1 { left: 0px; min-width: 150px; width: 150px; }
    .arsip-table .col-2 { left: 150px; min-width: 150px; width: 150px; }
    .arsip-table .col-3 { 
        left: 300px; 
        min-width: 150px; 
        width: 150px;
        border-right: 2px solid #adb5bd; /* Garis pembatas */
    }
`;

function DaftarArsipPage() {
    const [arsipList, setArsipList] = useState([]);
    const [kodeList, setKodeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Rekap');
    const [newEntry, setNewEntry] = useState({
        nomorBerkas: '',
        nomorItem: '',
        kodeKlarifikasi: '',
        uraianInformasiBerkas: '',
        tanggal: '',
        jumlah: '',
        jumlahUnit: 'Berkas',
        keterangan: 'Biasa'
    });

    const fetchArsipData = async () => {
        try {
            setLoading(true);
            const [arsipRes, kodeRes] = await Promise.all([
                api.get('/arsip/data'),
                api.get('/arsip/kode')
            ]);
            
            // --- LOGIKA PENGURUTAN DITAMBAHKAN DI SINI ---
            const sortedKodeList = kodeRes.data.data.sort((a, b) => 
                a.kode.localeCompare(b.kode, undefined, { numeric: true, sensitivity: 'base' })
            );

            setArsipList(arsipRes.data.data);
            setKodeList(sortedKodeList); // Simpan data yang sudah diurutkan
        } catch (error) {
            console.error("Gagal memuat data arsip:", error);
            alert("Gagal memuat data arsip.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArsipData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewEntry(prev => ({ ...prev, [name]: value }));
    };
    
    const getUraianByKode = (kode) => {
        const selected = kodeList.find(item => item.kode === kode);
        return selected ? selected.uraian : '-';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...newEntry,
                uraianKodeKlarifikasi: getUraianByKode(newEntry.kodeKlarifikasi)
            };
            await api.post('/arsip/data', dataToSubmit);
            alert('Data arsip berhasil disimpan!');
            setNewEntry({
                nomorBerkas: '', nomorItem: '', kodeKlarifikasi: '',
                uraianInformasiBerkas: '', tanggal: '', jumlah: '',
                jumlahUnit: 'Berkas', keterangan: 'Biasa'
            });
            fetchArsipData();
            setActiveTab('Rekap');
        } catch (error) {
            console.error("Gagal menyimpan data arsip:", error);
            alert("Gagal menyimpan data arsip.");
        }
    };

    const handleDownloadExcel = () => {
        const dataToExport = arsipList.map(item => ({
            "Nomor Berkas": item.nomorBerkas,
            "Nomor Item": item.nomorItem,
            "Kode Klarifikasi": item.kodeKlarifikasi,
            "Uraian Kode Klarifikasi": item.uraianKodeKlarifikasi,
            "Uraian Informasi Berkas": item.uraianInformasiBerkas,
            "Tanggal": item.tanggal,
            "Jumlah": `${item.jumlah} ${item.jumlahUnit}`,
            "Keterangan": item.keterangan
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Arsip Dinamis");
        XLSX.writeFile(workbook, "DaftarArsipDinamis.xlsx");
    };


    const renderContent = () => {
        if (loading) {
            return <p>Memuat data arsip...</p>;
        }

        if (activeTab === 'Tambah') {
            return (
                <form onSubmit={handleSubmit}>
                    <fieldset>
                        <legend>Tambah Berkas Arsip Baru</legend>
                        <div className="form-grid">
                            <input name="nomorBerkas" value={newEntry.nomorBerkas} onChange={handleChange} placeholder="Nomor Berkas" required />
                            <input name="nomorItem" value={newEntry.nomorItem} onChange={handleChange} placeholder="Nomor Item" required />
                            <select name="kodeKlarifikasi" value={newEntry.kodeKlarifikasi} onChange={handleChange} required>
                                <option value="" disabled>Pilih Kode Klarifikasi</option>
                                {kodeList.map(kode => <option key={kode._id} value={kode.kode}>{kode.kode}</option>)}
                            </select>
                            <input value={getUraianByKode(newEntry.kodeKlarifikasi)} readOnly placeholder="Uraian Kode Klarifikasi" style={{backgroundColor: '#e9ecef'}}/>
                            <input name="uraianInformasiBerkas" value={newEntry.uraianInformasiBerkas} onChange={handleChange} placeholder="Uraian Informasi Berkas" required className="form-grid-full"/>
                            <input name="tanggal" value={newEntry.tanggal} onChange={handleChange} type="date" required/>
                            <div style={{display: 'flex', gap: '0.5rem'}}>
                                <input name="jumlah" value={newEntry.jumlah} onChange={handleChange} type="number" placeholder="Jumlah" required style={{flex: 1}}/>
                                <select name="jumlahUnit" value={newEntry.jumlahUnit} onChange={handleChange} style={{flex: 1}}>
                                    <option>Berkas</option>
                                    <option>Lembar</option>
                                </select>
                            </div>
                            <select name="keterangan" value={newEntry.keterangan} onChange={handleChange} className="form-grid-full">
                                <option>Biasa</option>
                                <option>Terbatas</option>
                                <option>Rahasia</option>
                                <option>Segera</option>
                                <option>Penting</option>
                            </select>
                        </div>
                        <button type="submit" className="primary" style={{marginTop: '1rem'}}>Tambah ke Arsip</button>
                    </fieldset>
                </form>
            );
        }

        if (activeTab === 'Rekap') {
            return (
                <div className="arsip-table-wrapper">
                    <table className="arsip-table">
                        <thead>
                            <tr>
                                <th className="freeze col-1">Nomor Berkas</th>
                                <th className="freeze col-2">Nomor Item</th>
                                <th className="freeze col-3">Kode Klarifikasi</th>
                                <th>Uraian Kode</th>
                                <th>Uraian Informasi Berkas</th>
                                <th>Tanggal</th>
                                <th>Jumlah</th>
                                <th>Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {arsipList.map(item => (
                                <tr key={item._id}>
                                    <td className="freeze col-1">{item.nomorBerkas}</td>
                                    <td className="freeze col-2">{item.nomorItem}</td>
                                    <td className="freeze col-3">{item.kodeKlarifikasi}</td>
                                    <td>{item.uraianKodeKlarifikasi}</td>
                                    <td>{item.uraianInformasiBerkas}</td>
                                    <td>{item.tanggal}</td>
                                    <td>{item.jumlah} {item.jumlahUnit}</td>
                                    <td>{item.keterangan}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            <style>{arsipTableStyles}</style>
            <h3>Daftar Berkas Arsip Dinamis Aktif</h3>
            
            <div className="tab-buttons">
                <button onClick={() => setActiveTab('Rekap')} className={activeTab === 'Rekap' ? 'active' : ''}>Rekap Arsip</button>
                <button onClick={() => setActiveTab('Tambah')} className={activeTab === 'Tambah' ? 'active' : ''}>Tambah Arsip</button>
                <button onClick={handleDownloadExcel} className="secondary" style={{marginLeft: 'auto'}}>
                    Unduh Excel
                </button>
            </div>
            
            <div style={{marginTop: '2rem'}}>
                {renderContent()}
            </div>
        </div>
    );
}

export default DaftarArsipPage;