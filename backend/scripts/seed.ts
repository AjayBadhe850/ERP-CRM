import dotenv from 'dotenv';
import prisma from '../src/prisma';
import { hashPassword } from '../src/utils/hash';

dotenv.config();

async function seed() {
  try {
    // Users
    const pwd = await hashPassword('Password123!');
    const users = [
      { name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
      { name: 'Sales User', email: 'sales@example.com', role: 'Sales' },
      { name: 'Warehouse User', email: 'warehouse@example.com', role: 'Warehouse' },
      { name: 'Accounts User', email: 'accounts@example.com', role: 'Accounts' }
    ];

    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { name: u.name, email: u.email, passwordHash: pwd, role: u.role as any }
      });
    }

    const products = [
      { name: 'Product A', sku: 'PRODA', unitPrice: 10.5, currentStock: 100 },
      { name: 'Product B', sku: 'PRODB', unitPrice: 5.0, currentStock: 50 }
    ];

    for (const p of products) {
      await prisma.product.upsert({
        where: { sku: p.sku },
        update: {},
        create: { name: p.name, sku: p.sku, unitPrice: p.unitPrice as any, currentStock: p.currentStock }
      });
    }

    const customers = [
      { name: 'Customer One', mobile: '9999000001', email: 'cust1@example.com', customerType: 'Retail' },
      { name: 'Customer Two', mobile: '9999000002', email: 'cust2@example.com', customerType: 'Wholesale' }
    ];

    for (const c of customers) {
      const existing = await prisma.customer.findFirst({ where: { mobile: c.mobile } });
      if (!existing) {
        await prisma.customer.create({ data: { name: c.name, mobile: c.mobile, email: c.email, customerType: c.customerType as any } });
      }
    }

    console.log('Seed completed');
  } catch (err) {
    console.error('Seed failed', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

seed();
