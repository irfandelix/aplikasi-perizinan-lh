import React, { useState, useEffect } from 'react';
import api from '../api'; // Menggunakan jembatan API
import * as XLSX from 'xlsx';

const arsipPageStyles = `
    .arsip-table-wrapper {
        overflow-x: auto;
        margin-top: 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
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
    }
    .arsip-table thead {
        background-color: #d1fae5;
        color: #064e3b;
    }
    .arsip-table th {
        white-space: nowrap;
    }
    .arsip-table td {
        white-space: normal;
        word-wrap: break-word;
    }
    .radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: center;
        border: 1px solid var(--border-color);
        padding: 0.75rem;
        border-radius: 4px;
    }
    .radio-group label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        margin: 0;
    }
    .radio-group input[type="radio"] {
        width: auto;
        margin: 0;
    }
`;

function DaftarArsipPage() {
    const [arsipList, setArsipList] = useState([]);
    const [kodeList, setKodeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Rekap');
    
    // --- PERUBAHAN 1: State untuk form disederhanakan ---
    const [newEntry, setNewEntry] = useState({
        // nomorBerkas dan nomorItem dihapus dari sini
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
            const sortedKodeList = kodeRes.data.data.sort((a, b) => 
                a.kode.localeCompare(b.kode, undefined, { numeric: true, sensitivity: 'base' })
            );
            setArsipList(arsipRes.data.data);
            setKodeList(sortedKodeList);
        } catch (error) {
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
            // --- PERUBAHAN 2: Reset form juga disederhanakan ---
            setNewEntry({
                kodeKlarifikasi: '',
                uraianInformasiBerkas: '',
                tanggal: '',
                jumlah: '',
                jumlahUnit: 'Berkas',
                keterangan: 'Biasa'
            });
            fetchArsipData();
            setActiveTab('Rekap');
        } catch (error) {
            alert("Gagal menyimpan data arsip.");
        }
    };

    const handleDownloadExcel = () => {
        const formatDateForExcel = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };

        const title = "DAFTAR BERKAS ARSIP DINAMIS AKTIF TAHUN 2025";
        const unitPengolah = "Unit Pengolah : Bidang Perencanaan, Pengaduan, dan Peningkatan Kapasitas Lingkungan Hidup";
        
        const mainHeaders = ["Nomor Berkas", "Nomor Item", "Kode Klarifikasi", "Uraian Informasi Berkas", "Tanggal", "Jumlah", "Keterangan"];
        for (let i = 0; i < 4; i++) mainHeaders.push(null);
        
        const subHeaders = [null, null, null, null, null, null, "Biasa", "Terbatas", "Rahasia", "Segera", "Penting"];

        const dataRows = arsipList.map(item => {
            const row = [
                item.nomorBerkas,
                item.nomorItem,
                item.kodeKlarifikasi,
                item.uraianInformasiBerkas,
                formatDateForExcel(item.tanggal),
                `${item.jumlah} ${item.jumlahUnit}`
            ];
            const keteranganOptions = ["Biasa", "Terbatas", "Rahasia", "Segera", "Penting"];
            keteranganOptions.forEach(opt => {
                row.push(item.keterangan === opt ? opt : '');
            });
            return row;
        });

        const finalData = [
            [title], [], [unitPengolah], [], mainHeaders, subHeaders, ...dataRows
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(finalData);

        worksheet["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }, { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } },
            { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } }, { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } },
            { s: { r: 4, c: 2 }, e: { r: 5, c: 2 } }, { s: { r: 4, c: 3 }, e: { r: 5, c: 3 } },
            { s: { r: 4, c: 4 }, e: { r: 5, c: 4 } }, { s: { r: 4, c: 5 }, e: { r: 5, c: 5 } },
            { s: { r: 4, c: 6 }, e: { r: 4, c: 10 } }
        ];
        
        const colWidths = [
            { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 50 }, { wch: 15 }, { wch: 15 },
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
        ];
        worksheet['!cols'] = colWidths;
        worksheet['!rows'] = [ { hpt: 24 }, null, { hpt: 15 } ];
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Arsip Dinamis");
        XLSX.writeFile(workbook, "DaftarArsipDinamis.xlsx");
    };

    const renderContent = () => {
        if (loading) {
            return <p>Memuat data arsip...</p>;
        }

        if (activeTab === 'Tambah') {
            const keteranganOptions = ["Biasa", "Terbatas", "Rahasia", "Segera", "Penting"];
            return (
                <form onSubmit={handleSubmit}>
                    <fieldset>
                        <legend>Tambah Berkas Arsip Baru</legend>
                        {/* --- PERUBAHAN 3: Form disederhanakan, input nomor dihapus --- */}
                        <div className="form-grid">
                            {/* Input nomorBerkas dan nomorItem sudah dihapus dari sini */}
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
                            <div className="form-grid-full">
                                <label style={{marginBottom: '0.5rem', display: 'block'}}>Keterangan</label>
                                <div className="radio-group">
                                    {keteranganOptions.map(option => (
                                        <label key={option}>
                                            <input type="radio" name="keterangan" value={option} checked={newEntry.keterangan === option} onChange={handleChange} />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
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
                                <th>Nomor Berkas</th>
                                <th>Nomor Item</th>
                                <th>Kode Klarifikasi</th>
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
                                    <td>{item.nomorBerkas}</td>
                                    <td>{item.nomorItem}</td>
                                    <td>{item.kodeKlarifikasi}</td>
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
            <style>{arsipPageStyles}</style>
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

