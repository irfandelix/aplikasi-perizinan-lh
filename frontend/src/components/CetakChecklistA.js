import React from 'react';

function CetakChecklistA({ data, checkedItems, onCheckboxChange, statusBerkas, onStatusChange, navigate }) {
    
    const allChecklistItems = [
        "Surat Permohonan Pemeriksaan Dokumen UKL-UPL / SPPL", "Pernyataan Pengelolaan dan Pemantauan Lingkungan (Bermaterai)",
        "Dokumen Lingkungan", "Peta (Peta Tapak, Peta Pengelolaan, Peta Pemantauan, dll) - Siteplan di Kertas A3", "PKKPR",
        "NIB (Untuk Swasta atau Perorangan)", "Fotocopy Status Lahan (Sertifikat)", "Fotocopy KTP Penanggungjawab Kegiatan",
        "Foto Eksisting Lokasi Rencana Kegiatan Disertai dengan Titik Koordinat", "Lembar Penapisan dari AMDALNET / Arahan dari Instansi Lingkungan Hidup",
        "Surat Kuasa Pekerjaan dari Pemrakarsa ke Konsultan (Bermaterai)", "Perizinan yang Sudah Dimiliki atau Izin yang Lama (Jika Ada)",
        "Pemenuhan Persetujuan Teknis Air Limbah*", "Pemenuhan Rincian Teknis Limbah B3 Sementara*", "Pemenuhan Persetujuan Teknis Emisi*",
        "Pemenuhan Persetujuan Teknis Andalalin*", "Hasil Penapisan Kewajiban Pemenuhan Persetujuan Teknis*",
        "Bukti Upload Permohonan pada AMDALNET dan/atau SIDARLING"
    ];

    const formatDate = (dateString) => {
        // Jika data kosong, null, atau undefined, langsung kembalikan strip
        if (!dateString) {
            return '-';
        }
        const date = new Date(dateString);
        // Periksa apakah tanggal yang dibuat valid. Jika tidak, kembalikan strip
        if (isNaN(date.getTime())) {
            return '-';
        }
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                .print-status { display: none; }
                @media print {
                    body { background-color: white; margin: 0; }
                    .no-print { display: none !important; }
                    .container { padding: 0 !important; box-shadow: none !important; }
                    .checklist-table, .header-table, .footer-table { font-size: 10pt !important; border: 1px solid black !important; }
                    .checklist-table td, .checklist-table th, .header-table td, .footer-table td { border: 1px solid black !important; }
                    input[type="checkbox"] { display: none; }
                    .print-checkbox { display: inline-block !important; width: 18px; height: 18px; border: 1px solid black; text-align: center; line-height: 16px; font-weight: bold; }
                    .print-status { display: block !important; text-align: center; margin-top: 10px; font-weight: normal; }
                }
                .print-checkbox { display: none; }
            `}} />

            <div style={{ padding: '2rem', backgroundColor: 'white', fontFamily: 'Arial, sans-serif' }}>
                
                <div className="no-print" style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => navigate('/dashboard')} style={{backgroundColor: '#6c757d'}}>Kembali ke Dashboard</button>
                    <button onClick={() => window.print()}>🖨️ Cetak</button>
                </div>

                <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>CHECKLIST KELENGKAPAN BERKAS<br/>PERMOHONAN PERSETUJUAN LINGKUNGAN</h2>
                
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
                            <td style={{ padding: '8px' }}>Nomor Checklist Kelengkapan Berkas</td>
                            <td style={{ padding: '8px' }}>:</td>
                            <td style={{ padding: '8px' }}>{data.nomorChecklist}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px' }}>Tanggal Masuk Berkas</td>
                            <td style={{ padding: '8px' }}>:</td>
                            <td style={{ padding: '8px' }}>{formatDate(data.tanggalMasukDokumen)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <table className="checklist-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1px' }} border="1">
                    <thead style={{ backgroundColor: '#E7E6E6', textAlign: 'center' }}>
                        <tr>
                            <th style={{ width: '5%', padding: '8px' }}>No</th>
                            <th style={{ width: '75%', padding: '8px' }}>Kelengkapan Berkas</th>
                            <th style={{ padding: '8px' }}>Checklist</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allChecklistItems.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'center', padding: '8px' }}>{index + 1}</td>
                                <td style={{ padding: '8px' }}>{item}</td>
                                <td style={{ textAlign: 'center', padding: '8px' }}>
                                    <input
                                        type="checkbox" name={item}
                                        checked={checkedItems[item] || false}
                                        onChange={onCheckboxChange}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                    <span className="print-checkbox">{checkedItems[item] ? '✓' : ''}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <table className="footer-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '30px', border:'1px solid black' }}>
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
                                <div className="no-print" style={{marginTop:'10px'}}>
                                    {/* PERBAIKAN KESALAHAN KETIK DI SINI */}
                                    <select value={statusBerkas} onChange={(e) => onStatusChange(e.target.value)} style={{width: '60%', padding:'5px'}}>
                                        <option>Diterima</option>
                                        <option>Diterima dengan Melengkapi Dahulu</option>
                                        <option>Ditolak</option>
                                    </select>
                                </div>
                                <p className="print-status">{statusBerkas}</p>
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
                <p style={{fontSize:'9pt'}}><i>*) Berlaku untuk UKL-UPL</i></p>
            </div>
        </>
    );
}

export default CetakChecklistA;
