import { put, list } from '@vercel/blob';
import {
  createCipheriv, createDecipheriv,
  randomBytes, scryptSync,
} from 'crypto';
import { verifyToken } from './auth.js';

/* ── Encryption (same key derivation as auth.js) ───────── */
const ENC_KEY = scryptSync(
  process.env.TOKEN_SECRET || 'liga-mx-tok-fallback',
  'liga-mx-encrypt-salt-v1',
  32
);

function encrypt(text) {
  const iv     = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', ENC_KEY, iv);
  const enc    = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag    = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decrypt(b64) {
  const buf      = Buffer.from(b64, 'base64');
  const iv       = buf.subarray(0, 12);
  const tag      = buf.subarray(12, 28);
  const enc      = buf.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', ENC_KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

/* ── Blob helpers ──────────────────────────────────────── */
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

function dataKey(userId) { return `liga-mx/data/${userId}.json`; }

async function readUserData(userId) {
  try {
    const { blobs } = await list({ prefix: dataKey(userId), token: BLOB_TOKEN });
    if (!blobs.length) return null;
    const r = await fetch(blobs[0].downloadUrl);
    if (!r.ok) return null;
    const raw = await r.text();
    try {
      return JSON.parse(decrypt(raw));
    } catch {
      // Migration: old unencrypted format
      try { return JSON.parse(raw); } catch { return null; }
    }
  } catch { return null; }
}

async function writeUserData(userId, data) {
  const payload = encrypt(JSON.stringify(data));
  await put(dataKey(userId), payload, {
    access: 'public', addRandomSuffix: false, token: BLOB_TOKEN,
    contentType: 'text/plain; charset=utf-8',
  });
}

/* ── Handler ───────────────────────────────────────────── */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const rawToken = (req.headers.authorization || '').replace('Bearer ', '');
  const userId   = verifyToken(rawToken);
  if (!userId) return res.status(401).json({ error: 'No autorizado.' });

  try {
    if (req.method === 'GET') {
      const data = await readUserData(userId);
      return res.json(data || { torneoActualId: null, torneos: [] });
    }

    if (req.method === 'POST') {
      if (!req.body || typeof req.body !== 'object')
        return res.status(400).json({ error: 'Datos inválidos.' });
      await writeUserData(userId, req.body);
      return res.json({ ok: true });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('[data] error:', err);
    return res.status(500).json({ error: `Error interno: ${err.message}` });
  }
}
