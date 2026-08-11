import express from 'express';
import prisma from '../prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, authorize(['Admin','Warehouse','Accounts']), async (req: AuthRequest, res) => {
  const page = Math.max(1, parseInt((req.query.page as string) || '1'));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10')));

  const total = await prisma.stockMovement.count();
  const data = await prisma.stockMovement.findMany({ skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' }, include: { product: true, user: true } });

  res.json({ success: true, data, page, limit, total, totalPages: Math.ceil(total/limit) });
});

export default router;
