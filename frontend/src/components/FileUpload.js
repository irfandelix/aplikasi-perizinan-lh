import React, { useState } from 'react';
import api from '../api'; // Pastikan Anda mengimpor api.js

const uploadStyles = `
    .upload-wrapper {
        border: 2px dashed var(--border-color);
        border-radius: 8px;
        padding: 1.5rem;
        margin-top: 1.5rem;
        background-color: #fcfcfc;
    }
    .upload-wrapper label {
        font-weight: 600;
        font-size: 0.9rem;
        color: #333;
    }
    .upload-wrapper input[type="file"] {
        margin-top: 0.5rem;
        display: block;
        font-size: 0.9rem;
    }
    .upload-wrapper button {
        margin-top: 1rem;
        background-color: #1D6F42; /* Warna hijau */
        border: none;
    }
    .upload-wrapper button:disabled {
        background-color: #ccc;
    }
    .upload-wrapper button:hover:not(:disabled) {
        background-color: #145230;
    }
    .file-link {
        display: inline-block;
        margin-top: 0.5rem;
        font-weight: 600;
        color: var(--primary-color);
    }
    .upload-message {
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }
`;

/**
 * Komponen untuk meng-upload file ke backend, yang kemudian akan meneruskannya ke Google Drive
 * @param {string} noUrut - Nomor urut dokumen induk
 * @param {string} fileType - Jenis file (misal: "BA_V", "BA_P", "PKPLH")
 * @param {string} dbField - Nama field di database (misal: "fileTahapC", "fileTahapD", "filePKPLH")
 * @param {string} currentFileUrl - URL file yang sudah ada (jika ada)
 * @param {string} namaKegiatan - NAMA KEGIATAN DARI DOKUMEN INDUK (BARU!)
 * @param {function} onUploadSuccess - Fungsi untuk me-refresh data di induk
 */
function FileUpload({ noUrut, fileType, dbField, currentFileUrl, onUploadSuccess, namaKegiatan }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Silakan pilih file terlebih dahulu.");
            return;
        }
        if (!noUrut) {
            alert("Error: Nomor Urut tidak ditemukan. Pastikan dokumen sudah dipilih.");
            return;
        }
        // PERUBAHAN 2: Validasi namaKegiatan
        if (!namaKegiatan) {
            alert("Error: Nama Kegiatan tidak ditemukan. Upload dibatalkan.");
            console.error("namaKegiatan prop is missing or empty.");
            return;
        }

        setLoading(true);
        setMessage('Meng-upload file ke server...');

        // Kita akan menggunakan FormData untuk mengirim file ke backend
        const formData = new FormData();
        formData.append('file', file);
        formData.append('noUrut', noUrut);
        formData.append('dbField', dbField);
        formData.append('fileType', fileType);
        formData.append('namaKegiatan', namaKegiatan);

        try {
            // Panggil "pintu" API baru di backend
            const response = await api.post('/dokumen/upload-drive', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setLoading(false);
            setMessage(response.data.message);
            setFile(null); // Kosongkan input file
            
            // Panggil fungsi refresh di komponen induk
            if (onUploadSuccess) {
                onUploadSuccess();
            }
            
        } catch (error) {
            console.error("Error saat upload file:", error);
            setLoading(false);
            setMessage("Upload gagal. Lihat konsol untuk detail.");
            alert("Upload Gagal: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="upload-wrapper">
            <style>{uploadStyles}</style>
            <label>Upload Draft File {fileType} (PDF/DOC)</label>
            {currentFileUrl && (
                <div>
                    <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                        Lihat File yang Sudah Di-upload
                    </a>
                </div>
            )}
            <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
            <button onClick={handleUpload} disabled={loading || !file} className="primary">
                {loading ? 'Meng-upload...' : `Upload File ${fileType}`}
            </button>
            {message && <p className="upload-message" style={{ color: loading ? 'blue' : 'green' }}>{message}</p>}
        </div>
    );
}

export default FileUpload;

