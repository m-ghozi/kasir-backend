import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/product.routes';
import authRoutes from './routes/auth.routes'

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
app.use('/api/products', productRoutes);

// === Start Server ===
app.listen(port, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`========================================\n`);
});
