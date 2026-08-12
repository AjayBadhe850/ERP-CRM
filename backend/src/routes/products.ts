import express from 'express';
import prisma from '../prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /products?page=1&limit=10&search=abc&category=cat&lowStock=true
router.get('/', authenticate, authorize(['Admin','Warehouse']), async (req: AuthRequest, res) => {
  const page = Math.max(1, parseInt((req.query.page as string) || '1'));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10')));
  const search = (req.query.search as string) || '';
  const category = (req.query.category as string) || undefined;
  const lowStock = req.query.lowStock === 'true';

  const where: any = {};
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { sku: { contains: search } }];
  if (category) where.category = category;
  if (lowStock) where.currentStock = { lt: Number(req.query.threshold || 10) };

  const total = await prisma.product.count({ where });
  const data = await prisma.product.findMany({ where, skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' } });

  res.json({ success: true, data, page, limit, total, totalPages: Math.ceil(total/limit) });
});

router.post('/', authenticate, authorize(['Admin','Warehouse']), async (req: AuthRequest, res) => {
  const { name, sku, category, unitPrice, currentStock, minStockAlert, location } = req.body;
  if (!name || !sku) return res.status(422).json({ success: false, message: 'Missing required fields', errors: [] });
  if (unitPrice < 0) return res.status(422).json({ success: false, message: 'Invalid unitPrice', errors: [] });
  if (currentStock < 0) return res.status(422).json({ success: false, message: 'Invalid currentStock', errors: [] });

  try {
    const created = await prisma.product.create({ data: { name, sku, category, unitPrice: unitPrice as any, currentStock, minStockAlert, location } });
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2002') return res.status(409).json({ success: false, message: 'SKU already exists', errors: [] });
    res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
});

router.get('/:id', authenticate, authorize(['Admin','Warehouse']), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return res.status(404).json({ success: false, message: 'Not found', errors: [] });
  res.json({ success: true, data: p });
});

router.put('/:id', authenticate, authorize(['Admin','Warehouse']), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const { name, sku, category, unitPrice, currentStock, minStockAlert, location } = req.body;
  if (currentStock !== undefined && currentStock < 0) return res.status(422).json({ success: false, message: 'Invalid currentStock', errors: [] });
  try {
    const updated = await prisma.product.update({ where: { id }, data: { name, sku, category, unitPrice: unitPrice as any, currentStock, minStockAlert, location } });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ success: false, message: 'Not found', errors: [] });
    if (err.code === 'P2002') return res.status(409).json({ success: false, message: 'SKU conflict', errors: [] });
    res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
});

export default router;
