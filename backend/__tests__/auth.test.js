"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const prisma_1 = __importDefault(require("../src/prisma"));
const hash_1 = require("../src/utils/hash");
describe('Auth', () => {
    beforeAll(async () => {
        const pwd = await (0, hash_1.hashPassword)('Password123!');
        await prisma_1.default.user.upsert({ where: { email: 'testauth@example.com' }, update: {}, create: { name: 'Test Auth', email: 'testauth@example.com', passwordHash: pwd, role: 'Admin' } });
    });
    afterAll(async () => {
        await prisma_1.default.user.deleteMany({ where: { email: 'testauth@example.com' } });
        await prisma_1.default.$disconnect();
    });
    it('returns 400 for missing fields', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/auth/login').send({});
        expect(res.status).toBe(400);
    });
    it('authenticates valid user', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/auth/login').send({ email: 'testauth@example.com', password: 'Password123!' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
    });
});
