"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../src/prisma"));
const hash_1 = require("../src/utils/hash");
describe('Challan confirmation', () => {
    let userId;
    let productId;
    let challanId;
    beforeAll(async () => {
        const pwd = await (0, hash_1.hashPassword)('Password123!');
        const user = await prisma_1.default.user.upsert({ where: { email: 'testchallan@example.com' }, update: {}, create: { name: 'Challan User', email: 'testchallan@example.com', passwordHash: pwd, role: 'Sales' } });
        userId = user.id;
        const product = await prisma_1.default.product.create({ data: { name: 'TstProd', sku: 'TSTPROD', unitPrice: 2.5, currentStock: 5 } });
        productId = product.id;
        const cust = await prisma_1.default.customer.create({ data: { name: 'C', mobile: '9000000000', customerType: 'Retail' } });
        const ch = await prisma_1.default.challan.create({ data: { challanNumber: 'CH-TEST', customerId: cust.id, status: 'Draft', createdById: userId, totalQuantity: 2 } });
        challanId = ch.id;
        await prisma_1.default.challanItem.create({ data: { challanId: ch.id, productId: productId, productName: 'TstProd', sku: 'TSTPROD', unitPrice: 2.5, quantity: 2 } });
    });
    afterAll(async () => {
        await prisma_1.default.challanItem.deleteMany({ where: {} });
        await prisma_1.default.challan.deleteMany({ where: {} });
        await prisma_1.default.product.deleteMany({ where: { sku: 'TSTPROD' } });
        await prisma_1.default.user.deleteMany({ where: { email: 'testchallan@example.com' } });
        await prisma_1.default.customer.deleteMany({ where: { mobile: '9000000000' } });
        await prisma_1.default.$disconnect();
    });
    it('confirms challan when stock sufficient', async () => {
        // run the same logic used by API: transactionally reduce stock
        const before = await prisma_1.default.product.findUnique({ where: { id: productId } });
        expect(before?.currentStock).toBe(5);
        // perform confirmation
        await prisma_1.default.$transaction(async (tx) => {
            const ch = await tx.challan.findUnique({ where: { id: challanId }, include: { items: true } });
            if (!ch)
                throw new Error('missing');
            for (const it of ch.items) {
                const prod = await tx.product.findUnique({ where: { id: it.productId } });
                if (!prod)
                    throw new Error('prod missing');
                if (it.quantity > prod.currentStock)
                    throw new Error('insufficient');
            }
            for (const it of ch.items) {
                await tx.product.update({ where: { id: it.productId }, data: { currentStock: { decrement: it.quantity } } });
                await tx.stockMovement.create({ data: { productId: it.productId, quantity: it.quantity, movementType: 'OUT', reason: 'Test', userId } });
            }
            await tx.challan.update({ where: { id: challanId }, data: { status: 'Confirmed' } });
        });
        const after = await prisma_1.default.product.findUnique({ where: { id: productId } });
        expect(after?.currentStock).toBe(3);
    });
});
