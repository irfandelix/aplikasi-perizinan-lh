import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import CetakTandaTerimaA from '../components/CetakTandaTerimaA';

function CetakTandaTerimaPage() {
    const { noUrut } = useParams();
    const navigate = useNavigate();
    const [recordData, setRecordData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecordData = async () => {
            try {
                const response = await api.get(`/record/${noUrut}`);
                setRecordData(response.data.data);
            } catch (error) {
                alert("Gagal mengambil data untuk tanda terima.");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchRecordData();
    }, [noUrut, navigate]);

    useEffect(() => {
        if (recordData) {
            const timer = setTimeout(() => window.print(), 500);
            return () => clearTimeout(timer);
        }
    }, [recordData]);

    if (loading || !recordData) {
        return <div>Mempersiapkan Tanda Terima...</div>;
    }

    return <CetakTandaTerimaA data={recordData} />;
}

export default CetakTandaTerimaPage;
