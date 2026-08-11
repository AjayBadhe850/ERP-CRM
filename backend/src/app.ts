import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth';
import customersRoutes from './routes/customers';
import productsRoutes from './routes/products';
import stockRoutes from './routes/stock';
import challansRoutes from './routes/challans';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/customers', customersRoutes);
app.use('/products', productsRoutes);
app.use('/stock-movements', stockRoutes);
app.use('/challans', challansRoutes);
app.use('/dashboard', dashboardRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

export default app;
