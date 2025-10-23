// Import library yang dibutuhkan
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { google } = require('googleapis'); // <-- ALAT BARU
const multer = require('multer'); // <-- ALAT BARU
const fs = require('fs');
const path = require('path');

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

// ================= KONFIGURASI GOOGLE DRIVE =================
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
let auth;

// Logika "pintar" untuk Vercel vs Lokal
if (process.env.NODE_ENV === 'production') {
    // Di Vercel: Baca dari Environment Variable
    console.log("Menjalankan di mode Produksi (Vercel).");
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    auth = new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
    });
    console.log("Autentikasi Google Drive menggunakan Vercel Environment Variables.");
} else {
    // Di Lokal: Baca dari file .json
    console.log("Menjalankan di mode Development (Lokal).");
    const KEYFILEPATH = path.join(__dirname, 'drive-credentials.json');
    if (fs.existsSync(KEYFILEPATH)) {
        auth = new google.auth.GoogleAuth({
            keyFile: KEYFILEPATH,
            scopes: SCOPES,
        });
        console.log("Autentikasi Google Drive menggunakan file credentials.json lokal.");
    } else {
        console.error("Error: File 'drive-credentials.json' tidak ditemukan di folder backend.");
        console.log("Pastikan Anda sudah mengikuti panduan-google-drive.md");
    }
}

const drive = google.drive({ version: 'v3', auth });

// --- PERBAIKAN LOGIKA MULTER DI SINI ---
let uploadDir;

if (process.env.NODE_ENV === 'production') {
    // Di Vercel, gunakan folder /tmp yang dijamin ada dan bisa ditulis
    uploadDir = '/tmp';
    console.log("Multer akan menggunakan direktori sementara Vercel: /tmp");
} else {
    // Di Lokal, buat folder 'uploads' jika belum ada
    uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log(`Multer akan menggunakan direktori lokal: ${uploadDir}`);
}

const upload = multer({ dest: uploadDir });
// --- BATAS PERBAIKAN ---

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

/// --- ENDPOINT UNTUK DASHBOARD SUMMARY (VERSI PALING AMAN) ---
app.get('/api/dashboard/summary', async (req, res) => {
    try {
        const db = await connectToDb();
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

        // 1. Ambil semua dokumen. Ini lebih aman dari error query.
        const allDocs = await db.collection(COLLECTION_NAME).find({}).toArray();

        // 2. Filter di JavaScript, yang bisa menangani berbagai format tanggal dengan aman.
        const filteredDocs = allDocs.filter(doc => {
            if (!doc.tanggalMasukDokumen) return false;
            
            let docYear = null;
            try {
                const dateValue = doc.tanggalMasukDokumen;
                if (dateValue instanceof Date) {
                    docYear = dateValue.getFullYear();
                } else if (typeof dateValue === 'string') {
                    if (dateValue.includes('-') && dateValue.length > 4) { // Format YYYY-MM-DD
                        const yearPart = dateValue.substring(0, 4);
                        if (!isNaN(parseInt(yearPart))) docYear = parseInt(yearPart, 10);
                    } else if (dateValue.includes('/') && dateValue.length > 4) { // Format D/M/YYYY
                        const parts = dateValue.split('/');
                        if (parts.length === 3) {
                            const yearPart = parts[2];
                            if (!isNaN(parseInt(yearPart))) docYear = parseInt(yearPart, 10);
                        }
                    }
                }
            } catch (e) {
                return false; // Abaikan jika ada error parsing
            }
            return docYear === year;
        });
        
        const summary = {
            totalMasuk: filteredDocs.length,
            totalUjiAdmin: filteredDocs.filter(d => d.nomorUjiBerkas && d.nomorUjiBerkas !== "").length,
            totalVerlap: filteredDocs.filter(d => d.nomorBAVerlap && d.nomorBAVerlap !== "").length,
            totalPemeriksaan: filteredDocs.filter(d => d.nomorBAPemeriksaan && d.nomorBAPemeriksaan !== "").length,
            totalPerbaikan: filteredDocs.filter(d => d.nomorPHP && d.nomorPHP !== "").length,
            totalRPD: filteredDocs.filter(d => d.nomorRisalah && d.nomorRisalah !== "").length,
        };
        
        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        console.error("Error di /api/dashboard/summary:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data summary.' });
    }
});

// --- ENDPOINT SUMMARY PER JENIS (DISEDERHANAKAN) ---
app.get('/api/dashboard/summary/by-type', async (req, res) => {
    try {
        console.log("==> [START] /api/dashboard/summary/by-type"); // LOG 1: Endpoint dimulai
        const db = await connectToDb();
        
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
        console.log(`==> [INFO] Menghitung data untuk tahun: ${year}`); // LOG 2: Tahun yang diterima

        // Query agregasi sederhana tanpa filter tahun
        const pipeline = [
            { 
                $group: { 
                    _id: "$jenisDokumen", 
                    count: { $sum: 1 } 
                } 
            },
            { $sort: { _id: 1 } }
        ];
        console.log("==> [INFO] Menjalankan pipeline agregasi:", JSON.stringify(pipeline)); // LOG 3: Query yang dijalankan

        const results = await db.collection(COLLECTION_NAME).aggregate(pipeline).toArray();
        console.log(`==> [SUCCESS] Data berhasil diambil dari DB. Jumlah grup ditemukan: ${results.length}`); // LOG 4: Hasil dari DB
        
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        // --- INI AKAN MEMBERI TAHU KITA JIKA ADA ERROR DI SERVER ---
        console.error("==> [ERROR] Terjadi kesalahan di /api/dashboard/summary/by-type:", error); // LOG 5: Pesan error
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
                nomorPHP: "", tanggalPHP: "", petugasPenerimaPerbaikan: "", // <-- PERUBAHAN 1: Tambahkan field ini
                nomorIzinTerbit: "", jenisPerizinan: "", nomorRisalah: "", tanggalRisalah: "",
                checklistArsip: "", tanggalPengembalian: "",
                // --- FIELD BARU UNTUK MENYIMPAN LINK FILE ---
                fileTahapB: "", // BA HUA
                fileTahapC: "", // BA Verlap
                fileTahapD: "", // BA Pemeriksaan
                fileTahapE1: "", // Revisi 1
                fileTahapE2: "",
                fileTahapE3: "",
                fileTahapE4: "",
                fileTahapE5: "",
                fileTahapG: "", // RPD
                filePKPLH: "" // Izin Terbit
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
            // --- PERUBAHAN 2: Ambil 'petugasPenerimaPerbaikan' dari body ---
            const { tanggalPenyerahanPerbaikan, petugasPenerimaPerbaikan } = req.body;
            const tglParts = getDateParts(tanggalPenyerahanPerbaikan);
            generatedNomor = `600.4/${formatToThreeDigits(noUrut)}.${tglParts.month}/17/PHP.${getStandardAbbreviation(existingData.jenisDokumen)}/${tglParts.year}`;
            
            // --- PERUBAHAN 3: Tambahkan field baru ke query update ---
            updateQuery = { 
                nomorPHP: generatedNomor, 
                tanggalPHP: tanggalPenyerahanPerbaikan, 
                petugasPenerimaPerbaikan: petugasPenerimaPerbaikan // Simpan nama petugas
            };
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
        // --- PERUBAHAN 3: LOGIKA BARU UNTUK PENGEMBALIAN DOKUMEN ---
        else if (tahap === 'pengembalian') {
            const { tanggalPengembalian } = req.body;
            updateQuery = { tanggalPengembalian: tanggalPengembalian };
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

// --- ENDPOINT BARU UNTUK UPLOAD KE GOOGLE DRIVE ---
app.post('/api/dokumen/upload-drive', upload.single('file'), async (req, res) => {
    try {
        const { file } = req;
        const { noUrut, dbField, fileType } = req.body;

        if (!file || !noUrut || !dbField || !fileType) {
            fs.unlinkSync(file.path); // Hapus file sementara
            return res.status(400).json({ success: false, message: 'Data tidak lengkap.' });
        }

        console.log(`Menerima file untuk No Urut ${noUrut}, Tipe: ${fileType}`);

        // 1. Upload file ke Google Drive
        const response = await drive.files.create({
            requestBody: {
                name: `${fileType}_${noUrut}_${file.originalname}`,
                parents: [DRIVE_FOLDER_ID],
            },
            media: {
                mimeType: file.mimetype,
                body: fs.createReadStream(file.path),
            },
            fields: 'id, webViewLink', // Minta link untuk dilihat
        });

        // 2. Buat file agar bisa dibagikan
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        const fileUrl = response.data.webViewLink; // Link pratinjau Google Drive
        console.log(`File diupload, link: ${fileUrl}`);

        // 3. Hapus file sementara dari server
        fs.unlinkSync(file.path);

        // 4. Simpan link ke MongoDB
        const db = await connectToDb();
        const updateQuery = { $set: { [dbField]: fileUrl } };
        await db.collection(COLLECTION_DOKUMEN).updateOne(
            { noUrut: parseInt(noUrut) },
            updateQuery
        );

        res.status(200).json({ success: true, message: 'File berhasil di-upload ke Google Drive!', fileUrl });

    } catch (error) {
        console.error("Error di /api/dokumen/upload-drive:", error);
        if (req.file) fs.unlinkSync(req.file.path); // Pastikan file sementara dihapus jika ada error
        res.status(500).json({ success: false, message: 'Gagal meng-upload file ke Google Drive.' });
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