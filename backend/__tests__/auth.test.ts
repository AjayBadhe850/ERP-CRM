import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma';
import { hashPassword } from '../src/utils/hash';

describe('Auth', () => {
  beforeAll(async () => {
    const pwd = await hashPassword('Password123!');
    await prisma.user.upsert({ where: { email: 'testauth@example.com' }, update: {}, create: { name: 'Test Auth', email: 'testauth@example.com', passwordHash: pwd, role: 'Admin' as any } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'testauth@example.com' } });
    await prisma.$disconnect();
  });

  it('returns 400 for missing fields', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('authenticates valid user', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'testauth@example.com', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });
});
