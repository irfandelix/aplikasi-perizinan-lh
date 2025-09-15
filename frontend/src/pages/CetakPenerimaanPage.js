import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CetakTahapF from '../components/CetakTahapF'; // Menggunakan komponen layout yang sudah ada

function CetakPenerimaanPage() {
    const { noUrut } = useParams();
    const navigate = useNavigate();
    const [recordData, setRecordData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecordData = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/record/${noUrut}`);
                setRecordData(response.data.data);
            } catch (error) {
                console.error("Gagal mengambil data untuk dicetak:", error);
                alert("Gagal mengambil data untuk dicetak.");
                navigate('/dashboard'); // Kembali jika gagal
            } finally {
                setLoading(false);
            }
        };
        fetchRecordData();
    }, [noUrut, navigate]);

    // useEffect kedua ini akan berjalan HANYA setelah data berhasil dimuat
    useEffect(() => {
        if (recordData) {
            // Beri jeda sedikit agar konten sempat ter-render sebelum dialog print muncul
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [recordData]);

    if (loading || !recordData) {
        return <div>Mempersiapkan halaman cetak...</div>;
    }

    // Data yang dibutuhkan oleh CetakTahapF.js
    const dataToPrint = {
        ...recordData,
        tanggal_penyerahan_perbaikan: recordData.tanggalPHP, // Menyesuaikan nama properti
        nomorPHP: recordData.nomorPHP
    };

    return <CetakTahapF data={dataToPrint} />;
}

export default CetakPenerimaanPage;