import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { sendOtpEmail, sendWelcomeEmail } from '../lib/email';
import { AuthRequest } from '../middleware/auth';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function register(req: Request, res: Response) {
  const { firstName, lastName, email, phone, password } = req.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { firstName, lastName, displayName: `${firstName} ${lastName}`, email, phone, passwordHash, role: 'resident' },
  });
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id } });
  return res.status(201).json({ user: sanitizeUser(user), tokens: { accessToken, refreshToken } });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (!user.isActive) return res.status(403).json({ message: 'Account suspended or banned' });
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id } });
  return res.json({ user: sanitizeUser(user), tokens: { accessToken, refreshToken } });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });
  try {
    const { userId } = verifyRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored) return res.status(401).json({ message: 'Invalid refresh token' });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) return res.status(401).json({ message: 'User inactive' });
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const newAccess = signAccessToken(user.id, user.role);
    const newRefresh = signRefreshToken(user.id);
    await prisma.refreshToken.create({ data: { token: newRefresh, userId: user.id } });
    return res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}

export async function logout(req: AuthRequest, res: Response) {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken, userId: req.userId } });
  }
  return res.json({ message: 'Logged out' });
}

export async function verifyAddress(req: AuthRequest, res: Response) {
  const { address, lat, lng } = req.body;
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.pendingVerification.upsert({
    where: { userId: req.userId! },
    update: { otp, expiresAt, address, lat, lng },
    create: { userId: req.userId!, otp, expiresAt, address, lat, lng },
  });
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  await sendOtpEmail(user!.email, otp);
  return res.json({ message: 'OTP sent', maskedEmail: maskEmail(user!.email) });
}

export async function verifyOtp(req: AuthRequest, res: Response) {
  const { otp } = req.body;
  const pending = await prisma.pendingVerification.findUnique({ where: { userId: req.userId! } });
  if (!pending || pending.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
  if (pending.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });

  const neighborhood = await findOrCreateNeighborhood(pending.lat, pending.lng, pending.address);
  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: { isAddressVerified: true, neighborhoodId: neighborhood.id, lat: pending.lat, lng: pending.lng, address: pending.address },
  });
  await prisma.pendingVerification.delete({ where: { userId: req.userId! } });
  await sendWelcomeEmail(user.email, user.firstName, neighborhood.name);
  return res.json({ user: sanitizeUser(user), neighborhood });
}

export async function resendOtp(req: AuthRequest, res: Response) {
  const pending = await prisma.pendingVerification.findUnique({ where: { userId: req.userId! } });
  if (!pending) return res.status(400).json({ message: 'No pending verification' });
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.pendingVerification.update({ where: { userId: req.userId! }, data: { otp, expiresAt } });
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  await sendOtpEmail(user!.email, otp);
  return res.json({ message: 'OTP resent' });
}

async function findOrCreateNeighborhood(lat: number, lng: number, address: string) {
  const zipMatch = address.match(/\b\d{5}\b/);
  const zip = zipMatch ? zipMatch[0] : '00000';
  let neighborhood = await prisma.neighborhood.findFirst({ where: { zip } });
  if (!neighborhood) {
    const parts = address.split(',');
    neighborhood = await prisma.neighborhood.create({
      data: {
        name: parts[0]?.trim() || 'My Neighborhood',
        city: parts[1]?.trim() || 'Unknown City',
        state: parts[2]?.trim()?.split(' ')[1] || 'XX',
        zip,
        isActive: true,
        lat,
        lng,
      },
    });
  }
  return neighborhood;
}

function sanitizeUser(user: { id: string; firstName: string; lastName: string; displayName: string; email: string; phone?: string | null; role: string; isAddressVerified: boolean; neighborhoodId?: string | null; avatarUrl?: string | null; bio?: string | null }) {
  const { ...safe } = user;
  return safe;
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  return `${name[0]}${'*'.repeat(Math.max(name.length - 2, 1))}${name[name.length - 1]}@${domain}`;
}
