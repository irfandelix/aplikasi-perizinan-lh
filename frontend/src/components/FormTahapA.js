import React, { useState } from 'react';
import api from '../api';
import Modal from './Modal'; // <-- 1. IMPORT MODAL

function FormTahapA() {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'teleponPemrakarsa' || name === 'teleponKonsultan') {
            let formattedValue = value.replace(/[^0-9+]/g, '');
            if (formattedValue.startsWith('0')) {
                formattedValue = '+62' + formattedValue.substring(1);
            }
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- 3. MODIFIKASI handleSubmitAndPrint ---
    const handleSubmitAndPrint = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/submit/tahap-a', formData);
            
            if (response.data.success) {
                // GANTI ALERT
                showModal("Sukses", 'Data berhasil disimpan! Checklist dan Tanda Terima akan terbuka di tab baru.');
                
                const noUrutBaru = response.data.generatedData.noUrut;
                
                // Buka halaman checklist interaktif untuk petugas di tab baru
                window.open(`/checklist/${noUrutBaru}`, '_blank');
                
                // Buka halaman Tanda Terima sederhana untuk pemrakarsa di tab baru
                window.open(`/tanda-terima/${noUrutBaru}`, '_blank');
                
                // Reset form agar siap untuk input berikutnya
                setFormData(initialFormState);
            }
        } catch (error) {
            // GANTI ALERT
            const errorMessage = error.response?.data?.message || 'Gagal menyimpan data. Periksa console backend untuk detail.';
            showModal("Terjadi Kesalahan", errorMessage);
            console.error(error);
        }
    };

    return (
        // --- 4. BUNGKUS DENGAN FRAGMENT (<>) ---
        <>
            <form onSubmit={handleSubmitAndPrint}>
                <fieldset>
                    <legend>Data Registrasi Dokumen</legend>
                    <div className="form-grid">
                        <div>
                            <label>Nomor Surat Permohonan</label>
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
                            <input name="teleponPemrakarsa" type="tel" onChange={handleChange} value={formData.teleponPemrakarsa} required placeholder="+62" />
                        </div>
                        <div>
                            <label>Nama Konsultan (Opsional)</label>
                            <input name="namaKonsultan" onChange={handleChange} value={formData.namaKonsultan} />
                        </div>
                        <div>
                            <label>No. Telp Konsultan</label>
                            <input name="teleponKonsultan" type="tel" onChange={handleChange} value={formData.teleponKonsultan} placeholder="+62" />
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
                <button type="submit" className="primary" style={{ marginTop: '1rem' }}>Simpan & Cetak</button>
            </form>

            {/* --- 5. RENDER MODAL DI SINI --- */}
            <Modal
                show={modalInfo.show}
                title={modalInfo.title}
                onClose={closeModal}
            >
                <p>{modalInfo.message}</p>
            </Modal>
        </>
    );
}

export default FormTahapA;