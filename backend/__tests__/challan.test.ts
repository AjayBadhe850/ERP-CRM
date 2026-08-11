import prisma from '../src/prisma';
import { hashPassword } from '../src/utils/hash';

describe('Challan confirmation', () => {
  let userId: string;
  let productId: string;
  let challanId: string;

  beforeAll(async () => {
    const pwd = await hashPassword('Password123!');
    const user = await prisma.user.upsert({ where: { email: 'testchallan@example.com' }, update: {}, create: { name: 'Challan User', email: 'testchallan@example.com', passwordHash: pwd, role: 'Sales' as any } });
    userId = user.id;
    const product = await prisma.product.create({ data: { name: 'TstProd', sku: 'TSTPROD', unitPrice: 2.5 as any, currentStock: 5 } });
    productId = product.id;
    const cust = await prisma.customer.create({ data: { name: 'C', mobile: '9000000000', customerType: 'Retail' as any } });
    const ch = await prisma.challan.create({ data: { challanNumber: 'CH-TEST', customerId: cust.id, status: 'Draft', createdById: userId, totalQuantity: 2 } });
    challanId = ch.id;
    await prisma.challanItem.create({ data: { challanId: ch.id, productId: productId, productName: 'TstProd', sku: 'TSTPROD', unitPrice: 2.5 as any, quantity: 2 } });
  });

  afterAll(async () => {
    await prisma.challanItem.deleteMany({ where: {} });
    await prisma.challan.deleteMany({ where: {} });
    await prisma.product.deleteMany({ where: { sku: 'TSTPROD' } });
    await prisma.user.deleteMany({ where: { email: 'testchallan@example.com' } });
    await prisma.customer.deleteMany({ where: { mobile: '9000000000' } });
    await prisma.$disconnect();
  });

  it('confirms challan when stock sufficient', async () => {
    // run the same logic used by API: transactionally reduce stock
    const before = await prisma.product.findUnique({ where: { id: productId } });
    expect(before?.currentStock).toBe(5);

    // perform confirmation
    await prisma.$transaction(async (tx) => {
      const ch = await tx.challan.findUnique({ where: { id: challanId }, include: { items: true } });
      if (!ch) throw new Error('missing');
      for (const it of ch.items) {
        const prod = await tx.product.findUnique({ where: { id: it.productId } });
        if (!prod) throw new Error('prod missing');
        if (it.quantity > prod.currentStock) throw new Error('insufficient');
      }
      for (const it of ch.items) {
        await tx.product.update({ where: { id: it.productId }, data: { currentStock: { decrement: it.quantity } as any } });
        await tx.stockMovement.create({ data: { productId: it.productId, quantity: it.quantity, movementType: 'OUT', reason: 'Test', userId } });
      }
      await tx.challan.update({ where: { id: challanId }, data: { status: 'Confirmed' } });
    });

    const after = await prisma.product.findUnique({ where: { id: productId } });
    expect(after?.currentStock).toBe(3);
  });
});
