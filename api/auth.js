import { list } from '@vercel/blob';
import { createHmac } from 'crypto';

/* ── Token helpers ─────────────────────────────────────── */
const SECRET = process.env.TOKEN_SECRET || 'liga-mx-tok-fallback';

function makeToken(userId) {
  const ts  = Date.now();
  const pay = `${userId}:${ts}`;
  const sig = createHmac('sha256', SECRET).update(pay).digest('hex');
  return Buffer.from(`${pay}:${sig}`).toString('base64');
}

export function verifyToken(token) {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const last = raw.lastIndexOf(':');
    const sig  = raw.slice(last + 1);
    const pay  = raw.slice(0, last);
    if (createHmac('sha256', SECRET).update(pay).digest('hex') !== sig) return null;
    const col    = pay.indexOf(':');
    const userId = pay.slice(0, col);
    const ts     = Number(pay.slice(col + 1));
    if (isNaN(ts) || Date.now() - ts > 30 * 24 * 60 * 60 * 1000) return null;
    return userId;
  } catch { return null; }
}

/* ── Password hash (idéntica a la del cliente para migración) ── */
function legacyHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36) + s.length.toString(36);
}

/* ── Blob helpers — fetch directo para compatibilidad con store privado ── */
const TOKEN     = process.env.BLOB_READ_WRITE_TOKEN;
const USERS_KEY = 'liga-mx/users.json';

async function blobWrite(pathname, data) {
  const r = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'content-type': 'application/json',
      'x-vercel-blob-public': '0',
      'x-vercel-blob-add-random-suffix': '0',
    },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`Blob write (${r.status}): ${await r.text()}`);
}

async function readUsers() {
  try {
    const { blobs } = await list({ prefix: USERS_KEY, token: TOKEN });
    if (!blobs.length) return [];
    const r = await fetch(blobs[0].downloadUrl);
    return r.ok ? r.json() : [];
  } catch { return []; }
}

async function writeUsers(users) {
  await blobWrite(USERS_KEY, users);
}

/* ── Handler ───────────────────────────────────────────── */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')  return res.status(405).end();

  try {
    return await _handle(req, res);
  } catch (err) {
    console.error('[auth] unhandled error:', err);
    return res.status(500).json({ error: `Error interno: ${err.message}` });
  }
}

async function _handle(req, res) {
  const { action, username, password, name, token, updates, bootstrap } = req.body || {};
  let users = await readUsers();

  /* ── register ── */
  if (action === 'register') {
    if (!name || !username || !password)
      return res.json({ error: 'Todos los campos son requeridos.' });
    if ((password || '').length < 4)
      return res.json({ error: 'La contraseña debe tener mínimo 4 caracteres.' });
    if (users.find(u => u.username.toLowerCase() === username.trim().toLowerCase()))
      return res.json({ error: 'El nombre de usuario ya está en uso.' });
    const user = {
      id: `u${Date.now()}`,
      username: username.trim(),
      name: name.trim(),
      passwordHash: legacyHash(password),
      avatar: null,
    };
    users.push(user);
    await writeUsers(users);
    return res.json({
      user:  { id: user.id, username: user.username, name: user.name, avatar: null },
      token: makeToken(user.id),
    });
  }

  /* ── login ── */
  if (action === 'login') {
    let user = users.find(u => u.username.toLowerCase() === (username || '').trim().toLowerCase());

    // Migración transparente desde localStorage
    if (!user && bootstrap?.user) {
      const bu = bootstrap.user;
      if (bu.username.toLowerCase() === username.trim().toLowerCase()
          && bu.passwordHash === legacyHash(password)) {
        user = { id: bu.id, username: bu.username, name: bu.name, passwordHash: bu.passwordHash, avatar: bu.avatar || null };
        users.push(user);
        await writeUsers(users);
        if (bootstrap.data) {
          await blobWrite(`liga-mx/data/${user.id}.json`, bootstrap.data);
        }
      }
    }

    if (!user)                                       return res.json({ error: 'Usuario no encontrado.' });
    if (user.passwordHash !== legacyHash(password))  return res.json({ error: 'Contraseña incorrecta.' });
    return res.json({
      user:  { id: user.id, username: user.username, name: user.name, avatar: user.avatar },
      token: makeToken(user.id),
    });
  }

  /* ── verify ── */
  if (action === 'verify') {
    const uid = verifyToken(token);
    if (!uid) return res.json({ error: 'Sesión inválida.' });
    const user = users.find(u => u.id === uid);
    if (!user) return res.json({ error: 'Usuario no encontrado.' });
    return res.json({ user: { id: user.id, username: user.username, name: user.name, avatar: user.avatar } });
  }

  /* ── update ── */
  if (action === 'update') {
    const uid = verifyToken(token);
    if (!uid) return res.json({ error: 'Sesión inválida.' });
    const idx = users.findIndex(u => u.id === uid);
    if (idx < 0) return res.json({ error: 'Usuario no encontrado.' });
    if (updates.username !== undefined) {
      const u = (updates.username || '').trim();
      if (!u) return res.json({ error: 'El nombre de usuario no puede estar vacío.' });
      if (users.find((u2, i) => i !== idx && u2.username.toLowerCase() === u.toLowerCase()))
        return res.json({ error: 'El nombre de usuario ya está en uso.' });
      users[idx].username = u;
    }
    if (updates.name)     users[idx].name     = updates.name.trim();
    if (updates.password) {
      if (updates.password.length < 4) return res.json({ error: 'La contraseña debe tener mínimo 4 caracteres.' });
      users[idx].passwordHash = legacyHash(updates.password);
    }
    if ('avatar' in updates) users[idx].avatar = updates.avatar;
    await writeUsers(users);
    return res.json({ user: { id: users[idx].id, username: users[idx].username, name: users[idx].name, avatar: users[idx].avatar } });
  }

  return res.status(400).json({ error: 'Acción no reconocida.' });
}
