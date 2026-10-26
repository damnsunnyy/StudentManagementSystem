import crypto from 'node:crypto';
import { promisify } from 'node:util';
import User from './models/User.js';

const scrypt = promisify(crypto.scrypt);

const secret = process.env.AUTH_SECRET || 'nexacampus-local-demo-change-this-secret';
const demoAccounts = [
  { email: process.env.ADMIN_EMAIL || 'admin@nexacampus.edu', password: process.env.ADMIN_PASSWORD, name: 'Jamie Davis', role: 'admin' },
  { email: process.env.USER_EMAIL || 'user@nexacampus.edu', password: process.env.USER_PASSWORD, name: 'Taylor Morgan', role: 'user' },
];

function sign(value) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

export function issueToken(account) {
  const payload = Buffer.from(JSON.stringify({ email: account.email, name: account.name, role: account.role, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return res.status(401).json({ message: 'Your session is invalid. Please sign in again.' });
  const expected = sign(payload);
  const a = Buffer.from(signature); const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({ message: 'Your session is invalid. Please sign in again.' });
  try {
    const account = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (account.exp < Date.now()) return res.status(401).json({ message: 'Your session expired. Please sign in again.' });
    req.account = account;
    next();
  } catch { return res.status(401).json({ message: 'Your session is invalid. Please sign in again.' }); }
}

export function requireAdmin(req, res, next) {
  if (req.account?.role !== 'admin') return res.status(403).json({ message: 'Administrator access is required for this action.' });
  next();
}

export function findDemoAccount(email, password) {
  return demoAccounts.find((account) => account.password && account.email.toLowerCase() === String(email).trim().toLowerCase() && account.password === password);
}

export function findDemoAccountForRole(role) {
  return demoAccounts.find((account) => account.role === role && account.password);
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}

export async function verifyPassword(password, passwordHash) {
  const [salt, stored] = passwordHash.split(':');
  const key = await scrypt(password, salt, 64);
  const expected = Buffer.from(stored, 'hex');
  return key.length === expected.length && crypto.timingSafeEqual(key, expected);
}

export async function findRegisteredAccount(email, password) {
  const account = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+passwordHash');
  if (!account || !await verifyPassword(password, account.passwordHash)) return null;
  return { email: account.email, name: account.name, role: account.role };
}

export async function createRegisteredAccount({ name, email, password }) {
  const passwordHash = await hashPassword(password);
  const account = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash, role: 'user' });
  return { email: account.email, name: account.name, role: account.role };
}
