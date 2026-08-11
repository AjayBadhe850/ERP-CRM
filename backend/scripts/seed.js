"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = __importDefault(require("../src/prisma"));
const hash_1 = require("../src/utils/hash");
dotenv_1.default.config();
async function seed() {
    try {
        // Users
        const pwd = await (0, hash_1.hashPassword)('Password123!');
        const users = [
            { name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
            { name: 'Sales User', email: 'sales@example.com', role: 'Sales' },
            { name: 'Warehouse User', email: 'warehouse@example.com', role: 'Warehouse' },
            { name: 'Accounts User', email: 'accounts@example.com', role: 'Accounts' }
        ];
        for (const u of users) {
            await prisma_1.default.user.upsert({
                where: { email: u.email },
                update: {},
                create: { name: u.name, email: u.email, passwordHash: pwd, role: u.role }
            });
        }
        const products = [
            { name: 'Product A', sku: 'PRODA', unitPrice: 10.5, currentStock: 100 },
            { name: 'Product B', sku: 'PRODB', unitPrice: 5.0, currentStock: 50 }
        ];
        for (const p of products) {
            await prisma_1.default.product.upsert({
                where: { sku: p.sku },
                update: {},
                create: { name: p.name, sku: p.sku, unitPrice: p.unitPrice, currentStock: p.currentStock }
            });
        }
        const customers = [
            { name: 'Customer One', mobile: '9999000001', email: 'cust1@example.com', customerType: 'Retail' },
            { name: 'Customer Two', mobile: '9999000002', email: 'cust2@example.com', customerType: 'Wholesale' }
        ];
        for (const c of customers) {
            const existing = await prisma_1.default.customer.findFirst({ where: { mobile: c.mobile } });
            if (!existing) {
                await prisma_1.default.customer.create({ data: { name: c.name, mobile: c.mobile, email: c.email, customerType: c.customerType } });
            }
        }
        console.log('Seed completed');
    }
    catch (err) {
        console.error('Seed failed', err);
        process.exit(1);
    }
    finally {
        await prisma_1.default.$disconnect();
        process.exit(0);
    }
}
seed();
