import express from 'express';
import prisma from '../prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

function generateChallanNumber() {
  return 'CH-' + Date.now();
}

// List challans
router.get('/', authenticate, authorize(['Admin','Sales','Accounts','Warehouse']), async (req: AuthRequest, res) => {
  const page = Math.max(1, parseInt((req.query.page as string) || '1'));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10')));
  const where: any = {};
  if (req.query.status) where.status = req.query.status as any;
  if (req.query.customerId) where.customerId = req.query.customerId as string;
  if (req.query.search) where.challanNumber = { contains: req.query.search as string };

  const total = await prisma.challan.count({ where });
  const data = await prisma.challan.findMany({ where, skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data, page, limit, total, totalPages: Math.ceil(total/limit) });
});

// Create challan (draft)
router.post('/', authenticate, authorize(['Admin','Sales']), async (req: AuthRequest, res) => {
  const { customerId, items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(422).json({ success: false, message: 'Items required', errors: [] });
  try {
    // create challan and items (store snapshot)
    const challanNumber = generateChallanNumber();
    const created = await prisma.challan.create({ data: { challanNumber, customerId, status: 'Draft', createdById: req.user.id, totalQuantity: items.reduce((s:any,i:any)=>s+i.quantity,0) } });
    for (const it of items) {
      const prod = await prisma.product.findUnique({ where: { id: it.productId } });
      if (!prod) {
        await prisma.challan.delete({ where: { id: created.id } });
        return res.status(422).json({ success: false, message: `Invalid product ${it.productId}`, errors: [] });
      }
      await prisma.challanItem.create({ data: { challanId: created.id, productId: prod.id, productName: prod.name, sku: prod.sku, unitPrice: prod.unitPrice as any, quantity: it.quantity } });
    }
    const full = await prisma.challan.findUnique({ where: { id: created.id }, include: { items: true } });
    res.status(201).json({ success: true, data: full });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
});

// Get challan details
router.get('/:id', authenticate, authorize(['Admin','Sales','Accounts','Warehouse']), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const ch = await prisma.challan.findUnique({ where: { id }, include: { items: true, customer: true } });
  if (!ch) return res.status(404).json({ success: false, message: 'Not found', errors: [] });
  res.json({ success: true, data: ch });
});

// Confirm challan (transaction)
router.post('/:id/confirm', authenticate, authorize(['Admin','Sales']), async (req: AuthRequest, res) => {
  const id = req.params.id;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const ch = await tx.challan.findUnique({ where: { id }, include: { items: true } });
      if (!ch) throw { status: 404, message: 'Challan not found' };
      if (ch.status !== 'Draft') throw { status: 409, message: 'Only Draft can be confirmed' };

      // validate stock for all items
      for (const it of ch.items) {
        const prod = await tx.product.findUnique({ where: { id: it.productId } });
        if (!prod) throw { status: 422, message: `Product ${it.productId} not found` };
        if (it.quantity > prod.currentStock) throw { status: 409, message: `Insufficient stock for ${prod.name}` };
      }

      // reduce stock and create movements
      for (const it of ch.items) {
        await tx.product.update({ where: { id: it.productId }, data: { currentStock: { decrement: it.quantity } as any } });
        await tx.stockMovement.create({ data: { productId: it.productId, quantity: it.quantity, movementType: 'OUT', reason: `Challan ${ch.challanNumber}`, userId: req.user.id } });
      }

      const updated = await tx.challan.update({ where: { id }, data: { status: 'Confirmed' } });
      return updated;
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    console.error(err);
    if (err.status) return res.status(err.status).json({ success: false, message: err.message, errors: [] });
    res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
});

// Cancel challan
router.post('/:id/cancel', authenticate, authorize(['Admin','Sales']), async (req: AuthRequest, res) => {
  const id = req.params.id;
  try {
    const ch = await prisma.challan.findUnique({ where: { id } });
    if (!ch) return res.status(404).json({ success: false, message: 'Not found', errors: [] });
    if (ch.status === 'Confirmed') return res.status(409).json({ success: false, message: 'Cannot cancel confirmed challan', errors: [] });
    const updated = await prisma.challan.update({ where: { id }, data: { status: 'Cancelled' } });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
});

export default router;
