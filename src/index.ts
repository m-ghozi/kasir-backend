import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/product.routes';
import authRoutes from './routes/auth.routes'
import categoryRoutes from './routes/category.routes';
import transactionRoutes from './routes/transaction.routes';
import stockRoutes from './routes/stock.routes'
import dashboardRoutes from './routes/dashboard.routes'
import reportRoutes from './routes/report.routes'
import supplierRoutes from './routes/supplier.routes';
import userRoutes from './routes/user.routes'
import storeSettingRoutes from './routes/storeSetting.routes'
import unitRoutes from './routes/unit.routes';
import paymentMethodRoutes from './routes/paymentMethod.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// === Global Middlewares ===
app.use(cors());
app.use(express.json()); // Parsing application/json
app.use(express.urlencoded({ extended: true }));

// === Routes Registration ===
app.get('/', (req: Request, res: Response) => {
  res.json({ message: '🚀 Kasir API is running smoothly!' });
});
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/users', userRoutes);
app.use('/api/store-settings', storeSettingRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);

// === Start Server ===
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
