import express from 'express';
import prisma from '../prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /customers?page=1&limit=10&search=abc&status=Active&type=Retail
router.get('/', authenticate, authorize(['Admin','Sales']), async (req: AuthRequest, res) => {
  const page = Math.max(1, parseInt((req.query.page as string) || '1'));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10')));
  const search = (req.query.search as string) || '';
  const status = (req.query.status as string) || undefined;
  const type = (req.query.type as string) || undefined;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search } },
      { businessName: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (status) where.status = status;
  if (type) where.customerType = type;

  const total = await prisma.customer.count({ where });
  const data = await prisma.customer.findMany({ where, skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' } });

  res.json({ success: true, data, page, limit, total, totalPages: Math.ceil(total/limit) });
});

router.post('/', authenticate, authorize(['Admin','Sales']), async (req: AuthRequest, res) => {
  const { name, mobile, email, businessName, gstNumber, customerType, address, status, followUpDate, notes } = req.body;
  if (!name || !mobile || !customerType) return res.status(422).json({ success: false, message: 'Missing required fields', errors: [] });
  const allowedTypes = ['Retail','Wholesale','Distributor'];
  const allowedStatus = ['Lead','Active','Inactive'];
  if (!allowedTypes.includes(customerType)) return res.status(422).json({ success: false, message: 'Invalid customerType', errors: [] });
  if (status && !allowedStatus.includes(status)) return res.status(422).json({ success: false, message: 'Invalid status', errors: [] });

  try {
    const customer = await prisma.customer.create({ data: { name, mobile, email, businessName, gstNumber, customerType, address, status, followUpDate: followUpDate ? new Date(followUpDate) : null, notes } });
    res.status(201).json({ success: true, data: customer });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
});

router.get('/:id', authenticate, authorize(['Admin','Sales']), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const customer = await prisma.customer.findUnique({ where: { id }, include: { followups: { orderBy: { createdAt: 'desc' } } } });
  if (!customer) return res.status(404).json({ success: false, message: 'Not found', errors: [] });
  res.json({ success: true, data: customer });
});

router.put('/:id', authenticate, authorize(['Admin','Sales']), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const { name, mobile, email, businessName, gstNumber, customerType, address, status, followUpDate, notes } = req.body;
  try {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found', errors: [] });
    const updated = await prisma.customer.update({ where: { id }, data: { name, mobile, email, businessName, gstNumber, customerType, address, status, followUpDate: followUpDate ? new Date(followUpDate) : null, notes } });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
});

router.post('/:id/followups', authenticate, authorize(['Admin','Sales']), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const { note, followupDate } = req.body;
  if (!note) return res.status(422).json({ success: false, message: 'Note is required', errors: [] });
  try {
    const cust = await prisma.customer.findUnique({ where: { id } });
    if (!cust) return res.status(404).json({ success: false, message: 'Customer not found', errors: [] });
    const fu = await prisma.customerFollowup.create({ data: { customerId: id, userId: req.user.id, note, followupDate: followupDate ? new Date(followupDate) : null } });
    res.status(201).json({ success: true, data: fu });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
});

export default router;
