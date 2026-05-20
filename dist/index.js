"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// === Global Middlewares ===
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // Parsing application/json
app.use(express_1.default.urlencoded({ extended: true }));
// === Routes Registration ===
app.get('/', (req, res) => {
    res.json({ message: '🚀 Kasir API is running smoothly!' });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', product_routes_1.default);
// === Start Server ===
app.listen(port, () => {
    console.log(`\n========================================`);
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`========================================\n`);
});
