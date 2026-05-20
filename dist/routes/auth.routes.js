"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../utils/auth");
const router = (0, express_1.Router)();
// Endpoint: POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, pin } = req.body;
        if (!username || !pin) {
            res.status(400).json({ success: false, message: 'Username dan PIN wajib diisi' });
            return;
        }
        // Cari user berdasarkan username
        const user = await prisma_1.prisma.user.findUnique({
            where: { username }
        });
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'Akun tidak ditemukan atau tidak aktif' });
            return;
        }
        // Validasi PIN
        const inputPinHash = (0, auth_1.hashPin)(pin);
        if (user.pinHash !== inputPinHash) {
            res.status(401).json({ success: false, message: 'PIN salah!' });
            return;
        }
        // Update waktu login terakhir
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });
        // Buat JWT Token
        const token = (0, auth_1.generateToken)(user.id, user.role, user.permissions);
        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    role: user.role,
                    permissions: user.permissions
                }
            }
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
});
exports.default = router;
