import React, { useEffect } from 'react';

function CetakTahapF({ data }) {
    useEffect(() => {
        window.print();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        // Menangani format tanggal dari input date (YYYY-MM-DD)
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
    };

    return (
        <>
            {/* CSS Khusus untuk halaman ini dan untuk mode cetak */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body { background-color: white; margin: 0; }
                    .no-print { display: none !important; }
                    .container { padding: 0 !important; box-shadow: none !important; }
                    .header-table, .footer-table {
                        font-size: 11pt !important;
                        border: 1px solid black !important;
                    }
                    .header-table td, .footer-table td {
                        border: 1px solid black !important;
                    }
                    input[type="checkbox"] { 
                        /* Sedikit trik agar checkbox terlihat saat dicetak */
                        -webkit-appearance: checkbox !important;
                        -moz-appearance: checkbox !important;
                        appearance: checkbox !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}} />

            <div className="container" style={{ padding: '2rem', backgroundColor: 'white', fontFamily: 'Arial, sans-serif' }}>
                <div className="no-print" style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => window.close()} style={{backgroundColor: '#6c757d'}}>Tutup</button>
                    <button onClick={() => window.print()}>🖨️ Cetak Ulang</button>
                </div>

                <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>TANDA TERIMA BERKAS<br/>PERBAIKAN DOKUMEN LINGKUNGAN</h2>

                {/* Header Table */}
                <table className="header-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }} border="1">
                    <tbody>
                        <tr>
                            <td style={{ width: '30%', padding: '8px' }}>Nama Kegiatan</td>
                            <td style={{ width: '1%', padding: '8px' }}>:</td>
                            <td style={{ padding: '8px' }}>{data.namaKegiatan}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px' }}>Jenis Permohonan*</td>
                            <td style={{ padding: '8px' }}>:</td>
                            <td style={{ padding: '8px' }}>{data.jenisDokumen}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px' }}>Nomor Penerimaan Hasil Perbaikan</td>
                            <td style={{ padding: '8px' }}>:</td>
                            <td style={{ padding: '8px', fontWeight:'bold' }}>{data.nomorPHP}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px' }}>Tanggal Masuk Berkas</td>
                            <td style={{ padding: '8px' }}>:</td>
                            <td style={{ padding: '8px' }}>{formatDate(data.tanggal_penyerahan_perbaikan)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer Tables */}
                <table className="footer-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', border:'1px solid black' }}>
                    <tbody>
                        <tr>
                            <td colSpan="3" style={{backgroundColor: '#E7E6E6', padding: '8px', border:'1px solid black'}}><b>Contact Person (Nomor Telepon)</b></td>
                        </tr>
                        <tr>
                            <td style={{ width: '40%', padding: '8px', border: '1px solid black' }}>Pemohon / Pemrakarsa / Pemberi Kuasa</td>
                            <td style={{ width: '30%', padding: '8px', border: '1px solid black' }}>: {data.namaPemrakarsa}</td>
                            <td style={{ width: '30%', padding: '8px', border: '1px solid black' }}>({data.teleponPemrakarsa})</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px', border: '1px solid black' }}>Penerima Kuasa</td>
                            <td style={{ padding: '8px', border: '1px solid black' }}>: {data.namaKonsultan || '-'}</td>
                            <td style={{ padding: '8px', border: '1px solid black' }}>({data.teleponKonsultan || '-'})</td>
                        </tr>
                        <tr>
                            <td style={{ width: '35%', verticalAlign: 'top', padding: '8px', border: '1px solid black' }} rowSpan="2">
                                <b>Kolom Cap Dinas</b>
                            </td>
                            <td colSpan="2" style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black', textAlign: 'center' }}>
                                <div style={{ fontWeight: 'bold' }}>Status Kelengkapan Berkas*:</div>
                                <p style={{ marginTop: '20px' }}>Diterima untuk diperiksa</p>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ verticalAlign: 'top', textAlign: 'center', padding: '8px', border: '1px solid black', height: '120px' }}>
                                <b>Pemohon / Yang Menyerahkan Dokumen</b>
                                <p style={{ marginTop: '80px' }}>({data.namaPengirim})</p>
                            </td>
                            <td style={{ verticalAlign: 'top', textAlign: 'center', padding: '8px', border: '1px solid black', height: '120px' }}>
                                <b>Petugas Gerai Mal Pelayanan Publik</b>
                                <p style={{ marginTop: '80px' }}>({data.namaPetugas})</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default CetakTahapF;