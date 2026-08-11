import express from 'express';
import prisma from '../prisma';
import { comparePassword } from '../utils/hash';
import { generateToken } from '../middleware/auth';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required', errors: [] });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials', errors: [] });

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials', errors: [] });

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    return res.status(200).json({ success: true, data: { token } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
});

export default router;
