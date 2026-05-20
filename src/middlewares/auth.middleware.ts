import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Memperluas tipe data bawaan Express agar mengenali 'req.user'
declare global {
  namespace Express {
    interface Request {
      user?: any; // Anda bisa membuat interface khusus nanti, sementara pakai 'any'
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
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
    const decoded = jwt.verify(token, secret);

    // 5. Jika valid, simpan data user (id, role, dll) ke dalam 'req.user'
    req.user = decoded;

    // 6. Izinkan request masuk ke Controller (tahap selanjutnya)
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Sesi berakhir atau token tidak valid. Silakan login ulang.' });
    return;
  }
};