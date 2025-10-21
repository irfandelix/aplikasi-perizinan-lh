// Import library yang dibutuhkan
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Konfigurasi dari file .env
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'db_perizinan_lh';
const COLLECTION_NAME = 'dokumen';
const COLLECTION_ARSIP = 'arsip';
const COLLECTION_KODE = 'kode_klarifikasi';

let db;

// Fungsi koneksi ke DB
async function connectToDb() {
    if (db) return db;
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        db = client.db(DB_NAME);
        console.log("Berhasil terhubung ke MongoDB Atlas.");
        return db;
    } catch (error) {
        console.error("Gagal terhubung ke MongoDB Atlas:", error);
        throw new Error("Gagal terhubung ke database.");
    }
}

// ================= HELPER FUNCTIONS =================
const formatToThreeDigits = (num) => num.toString().padStart(3, '0');
const getDateParts = (dateString) => {
    if (!dateString) { const now = new Date(); return { month: now.getMonth() + 1, year: now.getFullYear() }; }
    const parts = dateString.split('-');
    return { month: parseInt(parts[1], 10), year: parseInt(parts[0], 10) };
};
const getStandardAbbreviation = (type) => {
    const map = { 'PERTEK AIR LIMBAH': 'PERTEK.AL', 'PERTEK EMISI': 'PERTEK.EM', 'RINTEK LB3': 'RINTEK.LB3' };
    return map[type] || type;
};
async function getGlobalMaxSequentialNumber() {
    const db = await connectToDb();
    const regex = /600\.4\.25\/(\d+)\./;
    const documents = await db.collection(COLLECTION_NAME).find({
        $or: [ { nomorBAVerlap: { $exists: true, $ne: "" } }, { nomorBAPemeriksaan: { $exists: true, $ne: "" } } ]
    }).project({ nomorBAVerlap: 1, nomorBAPemeriksaan: 1 }).toArray();
    let maxNumber = 0;
    documents.forEach(doc => {
        if (doc.nomorBAVerlap) {
            const match = doc.nomorBAVerlap.match(regex);
            if (match && match[1]) maxNumber = Math.max(maxNumber, parseInt(match[1]));
        }
        if (doc.nomorBAPemeriksaan) {
            const match = doc.nomorBAPemeriksaan.match(regex);
            if (match && match[1]) maxNumber = Math.max(maxNumber, parseInt(match[1]));
        }
    });
    return maxNumber;
}


// ================= API ENDPOINTS =================

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.MPP_USER && password === process.env.MPP_PASS) {
        res.json({ success: true, role: 'MPP', message: 'Login berhasil sebagai Petugas MPP' });
    } else if (username === process.env.DLH_USER && password === process.env.DLH_PASS) {
        res.json({ success: true, role: 'Kantor LH', message: 'Login berhasil sebagai Kantor LH' });
    } else if (username === process.env.ARSIP_USER && password === process.env.ARSIP_PASS) {
        res.json({ success: true, role: 'Arsip', message: 'Login berhasil sebagai Arsip' });
    } else {
        res.status(401).json({ success: false, message: 'Username atau password salah' });
    }
});

app.post('/api/record/find', async (req, res) => {
    try {
        const { nomorChecklist } = req.body;
        if (!nomorChecklist) return res.status(400).json({ success: false, message: 'Nomor Checklist wajib diisi.' });
        const db = await connectToDb();
        const record = await db.collection(COLLECTION_NAME).findOne({ nomorChecklist });
        if (record) res.status(200).json({ success: true, data: record });
        else res.status(404).json({ success: false, message: 'Nomor Checklist tidak ditemukan.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data.' });
    }
});

app.get('/api/record/:noUrut', async (req, res) => {
    try {
        const { noUrut } = req.params;
        if (!noUrut || isNaN(parseInt(noUrut))) return res.status(400).json({ success: false, message: 'No Urut tidak valid.' });
        const db = await connectToDb();
        const record = await db.collection(COLLECTION_NAME).findOne({ noUrut: parseInt(noUrut) });
        if (record) res.status(200).json({ success: true, data: record });
        else res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data.' });
    }
});

app.get('/api/rekap/all', async (req, res) => {
    try {
        const db = await connectToDb();
        const allRecords = await db.collection(COLLECTION_NAME).find({}).sort({ noUrut: 1 }).toArray();
        res.status(200).json({ success: true, data: allRecords });
    } catch (error) {
        console.error("Error di /api/rekap/all:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data rekapitulasi.' });
    }
});

// --- ENDPOINT UNTUK DASHBOARD SUMMARY DIPERBARUI TOTAL ---
app.get('/api/dashboard/summary', async (req, res) => {
    try {
        const db = await connectToDb();
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

        // 1. Ambil semua dokumen. Ini lebih aman daripada agregasi kompleks.
        const allDocs = await db.collection(COLLECTION_DOKUMEN).find({}).toArray();

        // 2. Filter di JavaScript, yang lebih fleksibel menangani format berbeda.
        const filteredDocs = allDocs.filter(doc => {
            if (!doc.tanggalMasukDokumen) return false;
            
            try {
                // Handle format YYYY-MM-DD (dari aplikasi)
                if (typeof doc.tanggalMasukDokumen === 'string' && doc.tanggalMasukDokumen.includes('-')) {
                    return new Date(doc.tanggalMasukDokumen).getFullYear() === year;
                }
                // Handle format D/M/YYYY (dari data impor)
                if (typeof doc.tanggalMasukDokumen === 'string' && doc.tanggalMasukDokumen.includes('/')) {
                    const parts = doc.tanggalMasukDokumen.split('/');
                    const docYear = parseInt(parts[2], 10);
                    return docYear === year;
                }
                // Handle format Date Object (jika ada)
                if (doc.tanggalMasukDokumen instanceof Date) {
                    return doc.tanggalMasukDokumen.getFullYear() === year;
                }
            } catch (e) {
                // Jika ada error saat parsing tanggal, abaikan dokumen ini.
                return false;
            }
            return false;
        });

        // 3. Hitung statistik berdasarkan data yang sudah difilter dengan aman.
        const summary = {
            totalMasuk: filteredDocs.length,
            totalUjiAdmin: filteredDocs.filter(d => d.nomorUjiBerkas && d.nomorUjiBerkas !== "").length,
            totalVerlap: filteredDocs.filter(d => d.nomorBAVerlap && d.nomorBAVerlap !== "").length,
            totalPemeriksaan: filteredDocs.filter(d => d.nomorBAPemeriksaan && d.nomorBAPemeriksaan !== "").length,
            totalPerbaikan: filteredDocs.filter(d => d.nomorPHP && d.nomorPHP !== "").length,
            totalRPD: filteredDocs.filter(d => d.nomorRisalah && d.nomorRisalah !== "").length,
            totalArsip: filteredDocs.filter(d => d.checklistArsip && d.checklistArsip !== "").length,
        };
        
        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        console.error("Error di /api/dashboard/summary:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data summary.' });
    }
});

// --- ENDPOINT BARU UNTUK SUMMARY BERDASARKAN JENIS DOKUMEN ---
app.get('/api/dashboard/summary/by-type', async (req, res) => {
    try {
        const db = await connectToDb();
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

        const allDocs = await db.collection(COLLECTION_DOKUMEN).find({}).toArray();

        const docsInYear = allDocs.filter(doc => {
            if (!doc.tanggalMasukDokumen) return false;
            let docYear = null;
            try {
                if (typeof doc.tanggalMasukDokumen === 'string' && doc.tanggalMasukDokumen.includes('-')) {
                    docYear = new Date(doc.tanggalMasukDokumen).getFullYear();
                } else if (typeof doc.tanggalMasukDokumen === 'string' && doc.tanggalMasukDokumen.includes('/')) {
                    const parts = doc.tanggalMasukDokumen.split('/');
                    if (parts.length === 3) docYear = parseInt(parts[2], 10);
                } else if (doc.tanggalMasukDokumen instanceof Date) {
                    docYear = doc.tanggalMasukDokumen.getFullYear();
                }
            } catch (e) { return false; }
            return docYear === year;
        });

        const summaryByType = docsInYear.reduce((acc, doc) => {
            const docType = doc.jenisDokumen;
            if (docType) {
                acc[docType] = (acc[docType] || 0) + 1;
            }
            return acc;
        }, {});

        const results = Object.keys(summaryByType).map(key => ({
            _id: key,
            count: summaryByType[key]
        })).sort((a, b) => a._id.localeCompare(b._id));
        
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data summary per jenis.' });
    }
});

// Endpoint TUNGGAL untuk semua proses simpan/update (SUDAH DIPERBAIKI)
app.post('/api/submit/:tahap', async (req, res) => {
    const { tahap } = req.params;
    
    try {
        const db = await connectToDb();
        const data = req.body;
        
        // --- LOGIKA TAHAP A (MEMBUAT DATA BARU) ---
        if (tahap === 'tahap-a') {
            console.log("[LOG] Memulai proses Tahap A...");
            const lastDoc = await db.collection(COLLECTION_NAME).find().sort({ noUrut: -1 }).limit(1).toArray();
            const noUrut = lastDoc.length > 0 ? lastDoc[0].noUrut + 1 : 1;
            
            const jenisDokumenSingkat = getStandardAbbreviation(data.jenisDokumen);
            const tglMasukParts = getDateParts(data.tanggalMasukDokumen);
            const nomorChecklist = `600.4/${formatToThreeDigits(noUrut)}.${tglMasukParts.month}/17/REG.${jenisDokumenSingkat}/${tglMasukParts.year}`;
            
            const newRecord = {
                ...data,
                noUrut,
                nomorChecklist,
                createdAt: new Date(),
                nomorUjiBerkas: "", tanggalUjiBerkas: "",
                nomorBAVerlap: "", tanggalVerlap: "",
                nomorBAPemeriksaan: "", tanggalPemeriksaan: "",
                nomorRevisi1: "", tanggalRevisi1: "",
                nomorRevisi2: "", tanggalRevisi2: "",
                nomorRevisi3: "", tanggalRevisi3: "",
                nomorRevisi4: "", tanggalRevisi4: "",
                nomorRevisi5: "", tanggalRevisi5: "",
                nomorPHP: "", tanggalPHP: "",
                nomorIzinTerbit: "", jenisPerizinan: "", nomorRisalah: "", tanggalRisalah: "",
                checklistArsip: ""
            };
            
            const result = await db.collection(COLLECTION_NAME).insertOne(newRecord);
            if (!result.insertedId) throw new Error("MongoDB gagal menyisipkan dokumen.");
            
            return res.status(200).json({ success: true, message: 'Data berhasil disimpan!', generatedData: { noUrut, nomorChecklist } });
        }

        // --- [BAGIAN KRUSIAL] LOGIKA UNTUK SEMUA TAHAP UPDATE (B, C, D, dst.) ---
        
        // 1. Ambil noUrut dari request body dan cari dokumennya di DB SEBELUM MELAKUKAN APA PUN
        const { noUrut } = req.body;
        if (!noUrut) {
            return res.status(400).json({ success: false, message: 'Kesalahan: noUrut tidak ditemukan dalam permintaan.' });
        }
        
        const existingData = await db.collection(COLLECTION_NAME).findOne({ noUrut: parseInt(noUrut) });
        if (!existingData) {
            return res.status(404).json({ success: false, message: `Dokumen dengan No Urut ${noUrut} tidak ditemukan.` });
        }

        let updateQuery = {};
        let generatedNomor = '';

        // 2. Sekarang aman untuk menjalankan logika update sesuai tahap
        if (tahap === 'b') {
            const { tanggalPenerbitanUa } = req.body;
            if (existingData.nomorUjiBerkas) {
                updateQuery = { tanggalUjiBerkas: tanggalPenerbitanUa };
                generatedNomor = existingData.nomorUjiBerkas;
            } else {
                const tglParts = getDateParts(tanggalPenerbitanUa);
                generatedNomor = `600.4/${formatToThreeDigits(noUrut)}.${tglParts.month}/17/BA.HUA.${getStandardAbbreviation(existingData.jenisDokumen)}/${tglParts.year}`;
                updateQuery = { nomorUjiBerkas: generatedNomor, tanggalUjiBerkas: tanggalPenerbitanUa };
            }
        } 
        else if (tahap === 'c') {
            const { tanggalVerifikasi } = req.body;
            if (existingData.nomorBAVerlap) {
                updateQuery = { tanggalVerlap: tanggalVerifikasi };
                generatedNomor = existingData.nomorBAVerlap;
            } else {
                const tglParts = getDateParts(tanggalVerifikasi);
                const maxNum = await getGlobalMaxSequentialNumber();
                const nextSequentialNumber = maxNum + 1;
                generatedNomor = `600.4.25/${formatToThreeDigits(nextSequentialNumber)}.${tglParts.month}/17/BA.V.${getStandardAbbreviation(existingData.jenisDokumen)}/${tglParts.year}`;
                updateQuery = { nomorBAVerlap: generatedNomor, tanggalVerlap: tanggalVerifikasi };
            }
        }
        else if (tahap === 'd') {
            const { tanggalPemeriksaan } = req.body;
            if (existingData.nomorBAPemeriksaan) {
                updateQuery = { tanggalPemeriksaan: tanggalPemeriksaan };
                generatedNomor = existingData.nomorBAPemeriksaan;
            } else {
                const tglParts = getDateParts(tanggalPemeriksaan);
                const maxNum = await getGlobalMaxSequentialNumber();
                const nextSequentialNumber = maxNum + 1;
                generatedNomor = `600.4.25/${formatToThreeDigits(nextSequentialNumber)}.${tglParts.month}/17/BA.P.${getStandardAbbreviation(existingData.jenisDokumen)}/${tglParts.year}`;
                updateQuery = { nomorBAPemeriksaan: generatedNomor, tanggalPemeriksaan: tanggalPemeriksaan };
            }
        }
                // --- LOGIKA TAHAP E DIPERBARUI DI SINI ---
        else if (tahap === 'e') {
            const { tanggalRevisi, nomorRevisi } = req.body;
            if (!existingData.nomorBAPemeriksaan) return res.status(400).json({ success: false, message: 'Gagal: Tahap D harus diisi terlebih dahulu.' });
            
            const revisionMap = { '1': { no: 'nomorRevisi1', tgl: 'tanggalRevisi1' }, '2': { no: 'nomorRevisi2', tgl: 'tanggalRevisi2' }, '3': { no: 'nomorRevisi3', tgl: 'tanggalRevisi3' }, '4': { no: 'nomorRevisi4', tgl: 'tanggalRevisi4' }, '5': { no: 'nomorRevisi5', tgl: 'tanggalRevisi5' } };
            const targetFields = revisionMap[nomorRevisi];
            if (!targetFields) return res.status(400).json({ success: false, message: 'Nomor revisi tidak valid.' });

            const baseNomor = existingData.nomorBAPemeriksaan;
            const jenisDokumenSingkat = getStandardAbbreviation(existingData.jenisDokumen);
            
            // Memecah string berdasarkan singkatan jenis dokumen
            const parts = baseNomor.split(`.${jenisDokumenSingkat}/`);
            if (parts.length !== 2) return res.status(500).json({ success: false, message: 'Format nomor BA Pemeriksaan tidak valid untuk membuat nomor revisi.' });
            
            // Menyisipkan ".P[nomor_revisi]" di antara dua bagian
            generatedNomor = `${parts[0]}.P${nomorRevisi}.${jenisDokumenSingkat}/${parts[1]}`;
            
            updateQuery[targetFields.no] = generatedNomor;
            updateQuery[targetFields.tgl] = tanggalRevisi;
        }
        else if (tahap === 'f') {
            const { tanggalPHP } = req.body;
            const tglParts = getDateParts(tanggalPHP);
            generatedNomor = `600.4/${formatToThreeDigits(noUrut)}.${tglParts.month}/17/PHP.${getStandardAbbreviation(existingData.jenisDokumen)}/${tglParts.year}`;
            updateQuery = { nomorPHP: generatedNomor, tanggalPHP: tanggalPHP };
        }
        else if (tahap === 'g') {
            const { tanggalPembuatanRisalah } = req.body;
            const getIzinAbbreviation = (type) => {
                const map = { 'UKLUPL': 'PKPLH', 'DELH': 'PKPLH', 'DPLH': 'PKPLH', 'AMDAL': 'SKKL', 'SPPL': 'SPPL' };
                return map[type] || getStandardAbbreviation(type);
            };
            const jenisPerizinanSingkat = getIzinAbbreviation(existingData.jenisDokumen);
            const tglParts = getDateParts(tanggalPembuatanRisalah);
            generatedNomor = `600.4/${formatToThreeDigits(noUrut)}.${tglParts.month}/RPD.${jenisPerizinanSingkat}/17/${tglParts.year}`;
            updateQuery = { tanggalRisalah: tanggalPembuatanRisalah, nomorRisalah: generatedNomor };
        }
        else if (tahap === 'arsip_perizinan') {
            const { checklistArsip, nomorIzinTerbit } = req.body;
            const mapDokumenToIzin = (type) => {
                const mapping = { 'SPPL': 'SPPL', 'UKLUPL': 'PKPLH', 'AMDAL': 'SKKL', 'DELH': 'PKPLH', 'DPLH': 'PKPLH' };
                return mapping[type] || getStandardAbbreviation(type);
            };
            const jenisPerizinan = mapDokumenToIzin(existingData.jenisDokumen);
            updateQuery = { checklistArsip, nomorIzinTerbit, jenisPerizinan };
        }
        else {
            return res.status(400).json({ success: false, message: `Tahap '${tahap}' tidak valid.` });
        }

        console.log(`[LOG] Mencoba update Tahap ${tahap.toUpperCase()} untuk noUrut ${noUrut} dengan query:`, updateQuery);
        const result = await db.collection(COLLECTION_NAME).updateOne({ noUrut: parseInt(noUrut) }, { $set: updateQuery });
        console.log("[LOG] Hasil update dari MongoDB:", result);
        
        res.status(200).json({ success: true, message: `Data Tahap ${tahap.toUpperCase()} berhasil diperbarui.`, generatedNomor });

    } catch (error) {
        console.error(`Error di API /submit/${tahap}:`, error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan di server.' });
    }
});



// --- ENDPOINT UNTUK FITUR ARSIP DINAMIS ---
app.get('/api/arsip/kode', async (req, res) => {
    try {
        const db = await connectToDb();
        const allKodesRaw = await db.collection('kode_klarifikasi').find({}).toArray();
        const allKodes = allKodesRaw.map(item => ({
            _id: item._id,
            kode: item["KLASIFIKASI"],
            uraian: item["URUSAN/FUNGSI"]
        }));
        res.status(200).json({ success: true, data: allKodes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data kode klarifikasi.' });
    }
});

app.get('/api/arsip/data', async (req, res) => {
    try {
        const db = await connectToDb();
        const allArsip = await db.collection('arsip').find({})
            .sort({ kodeKlarifikasi: 1, nomorBerkas: 1 })
            .toArray();
        res.status(200).json({ success: true, data: allArsip });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data arsip.' });
    }
});

app.post('/api/arsip/data', async (req, res) => {
    try {
        const db = await connectToDb();
        const newArsipData = req.body;
        
        const totalBerkas = await db.collection(COLLECTION_ARSIP).countDocuments({});
        newArsipData.nomorBerkas = totalBerkas + 1;

        const totalItemUntukKode = await db.collection(COLLECTION_ARSIP).countDocuments({ 
            kodeKlarifikasi: newArsipData.kodeKlarifikasi 
        });
        newArsipData.nomorItem = totalItemUntukKode + 1;

        newArsipData.createdAt = new Date();

        await db.collection(COLLECTION_ARSIP).insertOne(newArsipData);
        res.status(201).json({ success: true, message: 'Data arsip berhasil disimpan!' });
    } catch (error) {
        console.error("Error saat menyimpan data arsip:", error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data arsip.' });
    }
});
 
// Server listener
app.listen(PORT, () => {
    console.log(`Server API backend berjalan di http://localhost:${PORT}`);
    connectToDb();
});