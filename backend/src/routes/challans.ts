import express from 'express';
import prisma from '../prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

function generateChallanNumber() {
  return 'CH-' + Date.now();
}

function buildProductSnapshot(prod: any) {
  return {
    id: prod.id,
    name: prod.name,
    sku: prod.sku,
    category: prod.category,
    unitPrice: String(prod.unitPrice),
    currentStock: prod.currentStock,
    minStockAlert: prod.minStockAlert,
    location: prod.location
  };
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
router.post('/', authenticate, authorize(['Admin', 'Sales']), async (req: AuthRequest, res) => {
  const { customerId, items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(422).json({ success: false, message: 'Items required', errors: [] });
  }

  // Validate items
  for (const it of items) {
    if (!it.productId || !it.quantity || it.quantity <= 0) {
      return res.status(422).json({ success: false, message: 'Invalid items provided', errors: [] });
    }
  }

  try {
    const full = await prisma.$transaction(async (tx) => {
      const challanNumber = generateChallanNumber();
      const products = await Promise.all(items.map((it: any) => tx.product.findUnique({ where: { id: it.productId } })));

      products.forEach((prod, index) => {
        if (!prod) {
          throw { status: 422, message: `Invalid product ${items[index].productId}` };
        }
      });

      const created = await tx.challan.create({
        data: {
          challanNumber,
          customerId,
          status: 'Draft',
          createdById: req.user.id,
          totalQuantity: items.reduce((s: any, i: any) => s + i.quantity, 0)
        }
      });

      for (let index = 0; index < items.length; index += 1) {
        const it = items[index];
        const prod = products[index];
        if (!prod) {
          throw { status: 422, message: `Invalid product ${it.productId}` };
        }
        await tx.challanItem.create({
          data: {
            challanId: created.id,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            unitPrice: prod.unitPrice as any,
            quantity: it.quantity,
            productSnapshot: buildProductSnapshot(prod) as any
          }
        });
      }

      return await tx.challan.findUnique({ where: { id: created.id }, include: { items: true } });
    });

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    console.error(err);
    if (err.status) return res.status(err.status).json({ success: false, message: err.message, errors: [] });
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
router.post('/:id/confirm', authenticate, authorize(['Admin', 'Sales']), async (req: AuthRequest, res) => {
  const id = req.params.id;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const ch = await tx.challan.findUnique({ where: { id }, include: { items: true } });
      if (!ch) throw { status: 404, message: 'Challan not found' };
      if (ch.status !== 'Draft') throw { status: 409, message: 'Only Draft can be confirmed' };

      const requiredByProduct = ch.items.reduce((map: Record<string, number>, item) => {
        map[item.productId] = (map[item.productId] || 0) + item.quantity;
        return map;
      }, {});

      const productIds = Object.keys(requiredByProduct);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });

      if (products.length !== productIds.length) {
        throw { status: 422, message: 'One or more products in this challan no longer exist' };
      }

      for (const prod of products) {
        const requiredQty = requiredByProduct[prod.id] || 0;
        if (requiredQty > prod.currentStock) {
          throw { status: 409, message: `Insufficient stock for ${prod.name}` };
        }
      }

      for (const prod of products) {
        const decrementQty = requiredByProduct[prod.id];
        await tx.product.update({
          where: { id: prod.id },
          data: {
            currentStock: { decrement: decrementQty }
          }
        });

        await tx.stockMovement.create({
          data: {
            productId: prod.id,
            quantity: decrementQty,
            movementType: 'OUT',
            reason: `Challan ${ch.challanNumber}`,
            userId: req.user.id
          }
        });
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
