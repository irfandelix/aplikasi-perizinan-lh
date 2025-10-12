import React from 'react';

function CetakTandaTerimaA({ data }) {
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body { background-color: white; margin: 0; }
                    .no-print { display: none !important; }
                    .print-container { padding: 0 !important; box-shadow: none !important; }
                    .header-table, .footer-table {
                        font-size: 11pt !important;
                        border: 1px solid black !important;
                    }
                    .header-table td, .footer-table td {
                        border: 1px solid black !important;
                    }
                }
            `}} />

            <div className="print-container" style={{ padding: '2rem', backgroundColor: 'white', fontFamily: 'Arial, sans-serif' }}>
                <div className="no-print" style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => window.close()} style={{backgroundColor: '#6c757d'}}>Tutup</button>
                    <button onClick={() => window.print()} className="primary">🖨️ Cetak Ulang</button>
                </div>

                <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>TANDA TERIMA DOKUMEN</h2>
                
                <table className="header-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }} border="1">
                    <tbody>
                        <tr>
                            <td style={{ width: '30%', padding: '8px' }}>Nama Kegiatan</td>
                            <td style={{ width: '1%', padding: '8px' }}>:</td>
                            <td style={{ padding: '8px' }}>{data.namaKegiatan}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px' }}>Nomor Registrasi</td>
                            <td style={{ padding: '8px' }}>:</td>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{data.nomorChecklist}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px' }}>Tanggal Masuk Berkas</td>
                            <td style={{ padding: '8px' }}>:</td>
                            <td style={{ padding: '8px' }}>{formatDate(data.tanggalMasukDokumen)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <table className="footer-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', border:'1px solid black' }}>
                    <tbody>
                        <tr>
                            <td colSpan="2" style={{ verticalAlign: 'top', textAlign: 'center', padding: '8px', border: '1px solid black', height: '120px' }}>
                                <b>Pemohon / Yang Menyerahkan Dokumen</b>
                                <p style={{ marginTop: '80px' }}>({data.namaPengirim})</p>
                            </td>
                            <td colSpan="2" style={{ verticalAlign: 'top', textAlign: 'center', padding: '8px', border: '1px solid black', height: '120px' }}>
                                <b>Petugas Gerai Mal Pelayanan Publik</b>
                                <p style={{ marginTop: '80px' }}>({data.namaPetugas})</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
                 <p style={{fontSize:'9pt'}}><i>* Tanda terima ini adalah bukti penyerahan berkas awal dan bukan merupakan persetujuan.</i></p>
            </div>
        </>
    );
}

export default CetakTandaTerimaA;
