import { put, list } from '@vercel/blob';
import { verifyToken } from './auth.js';

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

function dataKey(userId) { return `liga-mx/data/${userId}.json`; }

async function readUserData(userId) {
  try {
    const { blobs } = await list({ prefix: dataKey(userId), token: TOKEN });
    if (!blobs.length) return null;
    const r = await fetch(blobs[0].downloadUrl);
    return r.ok ? r.json() : null;
  } catch { return null; }
}

async function writeUserData(userId, data) {
  await put(dataKey(userId), JSON.stringify(data), {
    access: 'public', addRandomSuffix: false, token: TOKEN,
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const rawToken = (req.headers.authorization || '').replace('Bearer ', '');
  const userId   = verifyToken(rawToken);
  if (!userId) return res.status(401).json({ error: 'No autorizado.' });

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
}
