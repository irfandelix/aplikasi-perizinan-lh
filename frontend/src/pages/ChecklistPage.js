import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CetakChecklistA from '../components/CetakChecklistA';

function ChecklistPage() {
    // Hooks untuk mengambil data dari URL dan untuk navigasi
    const { noUrut } = useParams();
    const navigate = useNavigate();
    
    // State untuk menyimpan data yang diambil dari MongoDB
    const [recordData, setRecordData] = useState(null);
    const [loading, setLoading] = useState(true);

    // State untuk checklist interaktif
    const [checkedItems, setCheckedItems] = useState({});
    const [statusBerkas, setStatusBerkas] = useState('Diterima');

    // useEffect ini akan berjalan saat halaman dimuat untuk mengambil data
    useEffect(() => {
        const fetchRecordData = async () => {
            if (!noUrut) {
                navigate('/dashboard');
                return;
            }
            try {
                // Meminta data ke backend MongoDB menggunakan noUrut dari URL
                const response = await axios.get(`http://localhost:3001/api/record/${noUrut}`);
                setRecordData(response.data.data);
            } catch (error) {
                console.error("Gagal mengambil data untuk checklist:", error);
                alert("Gagal mengambil data dari database, kembali ke dashboard.");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchRecordData();
    }, [noUrut, navigate]);

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckedItems(prev => ({ ...prev, [name]: checked }));
    };

    // Tampilkan pesan loading selagi data diambil
    if (loading || !recordData) {
        return <div>Memuat data checklist dari database...</div>;
    }
    
    // Setelah data siap, tampilkan halaman checklist
    return (
        <div className="container" style={{backgroundColor: '#e9ecef'}}>
            <CetakChecklistA 
                data={recordData} 
                checkedItems={checkedItems}
                onCheckboxChange={handleCheckboxChange}
                statusBerkas={statusBerkas}
                onStatusChange={setStatusBerkas}
                navigate={navigate}
            />
        </div>
    );
}

export default ChecklistPage;
