"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    // 1. Ambil header Authorization dari request
    const authHeader = req.headers.authorization;
    // 2. Cek apakah formatnya benar (harus dimulai dengan 'Bearer ')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
        return;
    }
    // 3. Ekstrak token (membuang kata "Bearer ")
    const token = authHeader.split(' ')[1];
    try {
        // 4. Verifikasi keaslian token menggunakan Secret Key di .env
        const secret = process.env.JWT_SECRET || 'kasir_gratisan_super_rahasia_2026';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // 5. Jika valid, simpan data user (id, role, dll) ke dalam 'req.user'
        req.user = decoded;
        // 6. Izinkan request masuk ke Controller (tahap selanjutnya)
        next();
    }
    catch (error) {
        res.status(403).json({ success: false, message: 'Sesi berakhir atau token tidak valid. Silakan login ulang.' });
        return;
    }
};
exports.verifyToken = verifyToken;
