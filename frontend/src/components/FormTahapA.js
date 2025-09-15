import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function FormTahapA() {
    const navigate = useNavigate();
    // NAMA FIELD DI SINI SUDAH DIPERBARUI (camelCase)
    const initialFormState = {
        nomorSuratPermohonan: '',
        tanggalSuratPermohonan: '',
        perihalSuratPermohonan: '',
        namaKegiatan: '',
        lokasiKegiatan: '',
        jenisKegiatan: 'Perumahan',
        jenisDokumen: 'UKLUPL',
        tanggalMasukDokumen: '',
        namaPemrakarsa: '',
        teleponPemrakarsa: '',
        namaKonsultan: '',
        teleponKonsultan: '',
        namaPengirim: '',
        pengirimSebagai: 'Pemrakarsa',
        keterangan: '',
        namaPetugas: '',
    };
    const [formData, setFormData] = useState(initialFormState);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'teleponPemrakarsa' || name === 'teleponKonsultan') {
            let formattedValue = value;
            if (formattedValue.startsWith('0')) {
                formattedValue = '+62' + formattedValue.substring(1);
            }
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmitAndContinue = async (e) => {
        e.preventDefault();
        try {
            // Frontend sekarang mengirim data dengan nama field yang benar
            const response = await api.post('/submit/tahap-a', formData);
            
            if (response.data.success) {
                alert('Data berhasil disimpan ke MongoDB!');
                const noUrutBaru = response.data.generatedData.noUrut;
                navigate(`/checklist/${noUrutBaru}`);
            }
        } catch (error) {
            alert('Gagal menyimpan data. Periksa console backend untuk detail.');
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmitAndContinue}>
            <fieldset>
                <legend>Data Registrasi Dokumen</legend>
                <div className="form-grid">
                    <div>
                        <label>Nomor Surat Permohonan</label>
                        {/* NAMA DAN VALUE DI SINI JUGA DIPERBARUI */}
                        <input name="nomorSuratPermohonan" onChange={handleChange} value={formData.nomorSuratPermohonan} required />
                    </div>
                    <div>
                        <label>Tanggal Surat Permohonan</label>
                        <input name="tanggalSuratPermohonan" type="date" onChange={handleChange} value={formData.tanggalSuratPermohonan} required />
                    </div>
                    <div className="form-grid-full">
                        <label>Perihal Surat</label>
                        <input name="perihalSuratPermohonan" onChange={handleChange} value={formData.perihalSuratPermohonan} required />
                    </div>
                    <div className="form-grid-full">
                        <label>Nama Kegiatan</label>
                        <input name="namaKegiatan" onChange={handleChange} value={formData.namaKegiatan} required />
                    </div>
                     <div className="form-grid-full">
                        <label>Lokasi Kegiatan</label>
                        <input name="lokasiKegiatan" onChange={handleChange} value={formData.lokasiKegiatan} required />
                    </div>
                    <div>
                        <label>Jenis Kegiatan</label>
                        <select name="jenisKegiatan" onChange={handleChange} value={formData.jenisKegiatan} required>
                            <option>Perumahan</option><option>Industri</option><option>Fasilitas Kesehatan</option><option>Apotik</option><option>Lain - Lain</option>
                        </select>
                    </div>
                    <div>
                        <label>Jenis Dokumen</label>
                        <select name="jenisDokumen" onChange={handleChange} value={formData.jenisDokumen} required>
                            <option>SPPL</option><option>UKLUPL</option><option>AMDAL</option><option>DELH</option><option>DPLH</option><option>PERTEK AIR LIMBAH</option><option>PERTEK EMISI</option><option>RINTEK LB3</option><option>SLO</option>
                        </select>
                    </div>
                    <div>
                        <label>Tanggal Masuk Dokumen</label>
                        <input name="tanggalMasukDokumen" type="date" onChange={handleChange} value={formData.tanggalMasukDokumen} required />
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend>Data Kontak</legend>
                <div className="form-grid">
                    <div>
                        <label>Nama Pemrakarsa</label>
                        <input name="namaPemrakarsa" onChange={handleChange} value={formData.namaPemrakarsa} required />
                    </div>
                    <div>
                        <label>No. Telp Pemrakarsa</label>
                        <input name="teleponPemrakarsa" onChange={handleChange} value={formData.teleponPemrakarsa} required placeholder="+62" />
                    </div>
                    <div>
                        <label>Nama Konsultan (Opsional)</label>
                        <input name="namaKonsultan" onChange={handleChange} value={formData.namaKonsultan} />
                    </div>
                    <div>
                        <label>No. Telp Konsultan</label>
                        <input name="teleponKonsultan" onChange={handleChange} value={formData.teleponKonsultan} placeholder="+62" />
                    </div>
                </div>
            </fieldset>
            
            <fieldset>
                <legend>Data Pengiriman</legend>
                <div className="form-grid">
                    <div>
                        <label>Nama Pengirim Dokumen</label>
                        <input name="namaPengirim" onChange={handleChange} value={formData.namaPengirim} required />
                    </div>
                    <div>
                        <label>Pengirim Sebagai</label>
                        <select name="pengirimSebagai" onChange={handleChange} value={formData.pengirimSebagai} required>
                            <option>Pemrakarsa</option><option>Konsultan</option>
                        </select>
                    </div>
                     <div className="form-grid-full">
                        <label>Nama Petugas Berjaga</label>
                        <input name="namaPetugas" onChange={handleChange} value={formData.namaPetugas} required />
                    </div>
                     <div className="form-grid-full">
                        <label>Keterangan (Opsional)</label>
                        <textarea name="keterangan" onChange={handleChange} value={formData.keterangan}></textarea>
                    </div>
                </div>
            </fieldset>

            <button type="submit" className="primary" style={{ marginTop: '1rem' }}>Simpan & Lanjutkan ke Checklist</button>
        </form>
    );
}

export default FormTahapA;
