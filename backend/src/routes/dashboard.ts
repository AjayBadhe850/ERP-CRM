import express from 'express';
import prisma from '../prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/stats', authenticate, authorize(['Admin', 'Sales', 'Warehouse', 'Accounts']), async (req: AuthRequest, res) => {
  try {
    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      lowStockProducts,
      draftChallans,
      confirmedChallans
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'Active' } }),
      prisma.product.count(),
      prisma.product.count({ where: { currentStock: { lt: prisma.product.fields.minStockAlert } } }), // This needs adjustment if minStockAlert is dynamic per product
      prisma.challan.count({ where: { status: 'Draft' } }),
      prisma.challan.count({ where: { status: 'Confirmed' } })
    ]);

    // Re-check low stock if the above lt doesn't work as expected with prisma fields
    const allProducts = await prisma.product.findMany({ select: { currentStock: true, minStockAlert: true } });
    const lowStockCount = allProducts.filter(p => p.currentStock < p.minStockAlert).length;

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        totalProducts,
        lowStockProducts: lowStockCount,
        draftChallans,
        confirmedChallans
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
});

export default router;
