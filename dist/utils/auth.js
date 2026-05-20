"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.hashPin = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Fungsi untuk mengubah PIN (misal "123456") menjadi SHA-256 Hex
const hashPin = (pin) => {
    return crypto_1.default.createHash('sha256').update(pin).digest('hex');
};
exports.hashPin = hashPin;
// Fungsi untuk membuat Token JWT yang berlaku selama 12 jam
const generateToken = (userId, role, permissions) => {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    return jsonwebtoken_1.default.sign({ userId, role, permissions }, secret, { expiresIn: '12h' });
};
exports.generateToken = generateToken;
