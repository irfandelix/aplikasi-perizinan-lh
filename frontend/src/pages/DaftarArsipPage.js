import React, { useState, useEffect } from 'react';
import api from '../api'; // Menggunakan jembatan API
import * as XLSX from 'xlsx'; // Import library excel yang baru diinstall

// CSS untuk halaman ini diperbarui
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
    /* --- STYLE BARU UNTUK RADIO BUTTON --- */
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
            
            const sortedKodeList = kodeRes.data.data.sort((a, b) => 
                a.kode.localeCompare(b.kode, undefined, { numeric: true, sensitivity: 'base' })
            );

            setArsipList(arsipRes.data.data);
            setKodeList(sortedKodeList);
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
        const formatDateForExcel = (dateString) => {
            if (!dateString) return '';
            const parts = dateString.split('-');
            if (parts.length !== 3) return dateString;
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        };

        // --- NAMA HEADER BARU DENGAN DUA BARIS ---
        const keteranganHeader = "Keterangan\n(Biasa | Terbatas | Rahasia | Segera | Penting)";

        // 1. Format data agar sesuai dengan kolom yang Anda inginkan
        const dataToExport = arsipList.map(item => {
            const newItem = {};
            newItem["Nomor Berkas"] = item.nomorBerkas;
            newItem["Nomor Item"] = item.nomorItem;
            newItem["Kode Klarifikasi"] = item.kodeKlarifikasi;
            newItem["Uraian Informasi Berkas"] = item.uraianInformasiBerkas;
            newItem["Tanggal"] = formatDateForExcel(item.tanggal);
            newItem["Jumlah"] = item.jumlah;
            newItem[keteranganHeader] = item.keterangan; // Gunakan header baru
            return newItem;
        });
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        
        // 2. Atur lebar kolom
        const colWidths = [
            { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 50 },
            { wch: 15 }, { wch: 10 }, 
            { wch: 60 } // Lebarkan kolom Keterangan
        ];
        worksheet['!cols'] = colWidths;

        // 3. (BARU) Atur tinggi baris header agar muat 2 baris teks
        const headerRowHeight = { hpt: 30 }; // Tinggi dalam points (1pt = 1/72 inch)
        worksheet['!rows'] = [ headerRowHeight ]; // Terapkan pada baris pertama (index 0)
        
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
                            
                            <div className="form-grid-full">
                                <label style={{marginBottom: '0.5rem', display: 'block'}}>Keterangan</label>
                                <div className="radio-group">
                                    {keteranganOptions.map(option => (
                                        <label key={option}>
                                            <input
                                                type="radio"
                                                name="keterangan"
                                                value={option}
                                                checked={newEntry.keterangan === option}
                                                onChange={handleChange}
                                            />
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

