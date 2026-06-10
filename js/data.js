const LIGA_MX_TEAMS = [
  { id: 'america',    name: 'América',           short: 'AME',  color: '#FFD100', text: '#002f6c', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/227.png',   stadium: 'Estadio Azteca',extraStadiums: ['Estadio Azteca', 'Estadio Ciudad de los Deportes'] },
  { id: 'guadalajara',name: 'Guadalajara',        short: 'CHI',  color: '#CC0000', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/219.png',   stadium: 'Estadio Akron' },
  { id: 'cruzazul',  name: 'Cruz Azul',          short: 'CAZ',  color: '#1B3FA0', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/218.png',   stadium: 'Estadio Ciudad de los Deportes', extraStadiums: ['Estadio Ciudad de los Deportes', 'Estadio Azteca','Estadio Olímpico Universitario', 'Estadio Cuauhtémoc'] },
  { id: 'pumas',     name: 'Pumas UNAM',         short: 'PUM',  color: '#F7AC1C', text: '#002668', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/233.png',   stadium: 'Estadio Olímpico Universitario' },
  { id: 'tigres',    name: 'Tigres UANL',        short: 'TIG',  color: '#FFB300', text: '#003470', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/232.png',   stadium: 'Estadio Universitario' },
  { id: 'monterrey', name: 'Monterrey',          short: 'MTY',  color: '#0562BB', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/220.png',   stadium: 'Estadio BBVA' },
  { id: 'santos',    name: 'Santos Laguna',      short: 'SAN',  color: '#00A94F', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/225.png',   stadium: 'Estadio Corona' },
  { id: 'toluca',    name: 'Toluca',             short: 'TOL',  color: '#CC0000', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/223.png',   stadium: 'Estadio Nemesio Díez' },
  { id: 'atlas',     name: 'Atlas FC',           short: 'ATL',  color: '#7B0000', text: '#F5A623', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/216.png',   stadium: 'Estadio Jalisco' },
  { id: 'necaxa',    name: 'Necaxa',             short: 'NEC',  color: '#CC0000', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/229.png',   stadium: 'Estadio Victoria' },
  { id: 'mazatlan',  name: 'Mazatlán FC',        short: 'MAZ',  color: '#5B1A7E', text: '#F7C200', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/20702.png', stadium: 'Estadio El Encanto' },
  { id: 'juarez',    name: 'FC Juárez',          short: 'JUA',  color: '#BE1522', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/17851.png', stadium: 'Estadio Olímpico Benito Juárez' },
  { id: 'queretaro', name: 'Querétaro',          short: 'QRO',  color: '#0C3F87', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/222.png',   stadium: 'Estadio La Corregidora' },
  { id: 'tijuana',   name: 'Club Tijuana',       short: 'TIJ',  color: '#1A1A1A', text: '#CC0000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/10125.png', stadium: 'Estadio Caliente' },
  { id: 'sanluis',   name: 'Atlético San Luis',  short: 'ASL',  color: '#C8102E', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/15720.png', stadium: 'Estadio Alfonso Lastras' },
  { id: 'leon',      name: 'León',               short: 'LEO',  color: '#006847', text: '#F7D321', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/228.png',   stadium: 'Estadio Nou Camp León' },
  { id: 'pachuca',   name: 'Pachuca',            short: 'PAC',  color: '#1B3FA0', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/234.png',   stadium: 'Estadio Hidalgo' },
  { id: 'puebla',    name: 'Puebla',             short: 'PUE',  color: '#0B2E6F', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/231.png',   stadium: 'Estadio Cuauhtémoc' },
];

// Equipos ordenados alfabéticamente para uso en select/dropdowns
const LIGA_MX_TEAMS_ALPHA = [...LIGA_MX_TEAMS].sort((a, b) => a.name.localeCompare(b.name, 'es'));

function getTeamById(id) {
  return LIGA_MX_TEAMS.find(t => t.id === id) || null;
}

const Store = {
  KEY: 'liga-mx-v1',

  get() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this._initial();
      const data = JSON.parse(raw);
      if (!data.liguilla) data.liguilla = this._initialLiguilla();
      // Migrate existing matches to include meta fields
      const addMeta = m => {
        if (!('idaEstadio' in m)) {
          m.idaEstadio = ''; m.idaFecha = ''; m.idaHora = '';
          m.vueltaEstadio = ''; m.vueltaFecha = ''; m.vueltaHora = '';
        }
      };
      data.liguilla.cuartos?.forEach(addMeta);
      data.liguilla.semis?.forEach(addMeta);
      if (data.liguilla.final) addMeta(data.liguilla.final);
      return data;
    } catch {
      return this._initial();
    }
  },

  set(state) {
    localStorage.setItem(this.KEY, JSON.stringify(state));
  },

  _initial() {
    return {
      season: 'Clausura 2026',
      jornadas: [],
      liguilla: this._initialLiguilla(),
      _nj: 1,
      _np: 1,
    };
  },

  _initialLiguilla() {
    const meta = { idaEstadio: '', idaFecha: '', idaHora: '', vueltaEstadio: '', vueltaFecha: '', vueltaHora: '' };
    const base = { idaHome: null, idaAway: null, vueltaHome: null, vueltaAway: null, winnerId: null, manualWinner: false, ...meta };
    return {
      active: false,
      cuartos: [
        { id: 'q1', label: '1° vs 8°', seed1: 1, seed2: 8, homeId: null, awayId: null, ...base },
        { id: 'q2', label: '2° vs 7°', seed1: 2, seed2: 7, homeId: null, awayId: null, ...base },
        { id: 'q3', label: '3° vs 6°', seed1: 3, seed2: 6, homeId: null, awayId: null, ...base },
        { id: 'q4', label: '4° vs 5°', seed1: 4, seed2: 5, homeId: null, awayId: null, ...base },
      ],
      semis: [
        { id: 's1', homeId: null, awayId: null, ...base },
        { id: 's2', homeId: null, awayId: null, ...base },
      ],
      final:    { id: 'f1', homeId: null, awayId: null, ...base },
      champion: null,
    };
  },
};

/* ════════════════════════════════════════════════════════
   AUTH STORE
════════════════════════════════════════════════════════ */
const AuthStore = {
  USERS_KEY:   'liga-mx-users',
  SESSION_KEY: 'liga-mx-session',

  _hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36) + s.length.toString(36);
  },

  getUsers()    { try { return JSON.parse(localStorage.getItem(this.USERS_KEY)  || '[]'); } catch { return []; } },
  saveUsers(u)  { localStorage.setItem(this.USERS_KEY, JSON.stringify(u)); },
  getSession()  { try { return JSON.parse(localStorage.getItem(this.SESSION_KEY)); } catch { return null; } },
  setSession(id){ localStorage.setItem(this.SESSION_KEY, JSON.stringify({ userId: id })); },
  clearSession(){ localStorage.removeItem(this.SESSION_KEY); },

  getCurrentUser() {
    const s = this.getSession();
    if (!s?.userId) return null;
    return this.getUsers().find(u => u.id === s.userId) || null;
  },

  register({ username, name, password }) {
    if (!username?.trim() || !name?.trim() || !password) return { error: 'Todos los campos son requeridos' };
    if ((password || '').length < 4) return { error: 'La contraseña debe tener mínimo 4 caracteres' };
    const users = this.getUsers();
    if (users.find(u => u.username.toLowerCase() === username.trim().toLowerCase()))
      return { error: 'El nombre de usuario ya está en uso' };
    const user = {
      id: `u${Date.now()}`,
      username: username.trim(),
      name: name.trim(),
      avatar: null,
      passwordHash: this._hash(password),
      createdAt: Date.now(),
    };
    users.push(user);
    this.saveUsers(users);
    this.setSession(user.id);
    return { user };
  },

  login({ username, password }) {
    const users = this.getUsers();
    const user  = users.find(u => u.username.toLowerCase() === (username || '').trim().toLowerCase());
    if (!user) return { error: 'Usuario no encontrado' };
    if (user.passwordHash !== this._hash(password || '')) return { error: 'Contraseña incorrecta' };
    this.setSession(user.id);
    return { user };
  },

  logout() { this.clearSession(); },

  updateUser(userId, updates) {
    const users = this.getUsers();
    const idx   = users.findIndex(u => u.id === userId);
    if (idx === -1) return { error: 'Usuario no encontrado' };
    if (updates.username !== undefined) {
      const u2 = (updates.username || '').trim();
      if (!u2) return { error: 'El nombre de usuario no puede estar vacío' };
      if (users.find((u, i) => i !== idx && u.username.toLowerCase() === u2.toLowerCase()))
        return { error: 'El nombre de usuario ya está en uso' };
      updates.username = u2;
    }
    if (updates.password !== undefined) {
      if ((updates.password || '').length < 4) return { error: 'La contraseña debe tener mínimo 4 caracteres' };
      updates.passwordHash = this._hash(updates.password);
      delete updates.password;
    }
    if (updates.name !== undefined) updates.name = (updates.name || '').trim();
    users[idx] = { ...users[idx], ...updates };
    this.saveUsers(users);
    return { user: users[idx] };
  },
};

/* ════════════════════════════════════════════════════════
   TORNEO STORE
════════════════════════════════════════════════════════ */
const TorneoStore = {
  _key(uid) { return `liga-mx-data-${uid}`; },

  getData(uid) {
    try {
      const raw = localStorage.getItem(this._key(uid));
      if (!raw) return { torneoActualId: null, torneos: [] };
      return JSON.parse(raw);
    } catch { return { torneoActualId: null, torneos: [] }; }
  },
  saveData(uid, d) { localStorage.setItem(this._key(uid), JSON.stringify(d)); },

  getTorneos(uid) { return this.getData(uid).torneos; },

  getTorneoActual(uid) {
    const d = this.getData(uid);
    return d.torneos.find(t => t.id === d.torneoActualId) || d.torneos[0] || null;
  },

  setTorneoActual(uid, tid) {
    const d = this.getData(uid);
    d.torneoActualId = tid;
    this.saveData(uid, d);
  },

  saveTorneo(uid, torneo) {
    const d   = this.getData(uid);
    const idx = d.torneos.findIndex(t => t.id === torneo.id);
    if (idx >= 0) d.torneos[idx] = torneo;
    else { d.torneos.push(torneo); if (!d.torneoActualId) d.torneoActualId = torneo.id; }
    this.saveData(uid, d);
  },

  createTorneo(uid, nombre) {
    const torneo = {
      id: `t${Date.now()}`,
      nombre: nombre.trim(),
      season: nombre.trim(),
      jornadas: [],
      liguilla: Store._initialLiguilla(),
      _nj: 1, _np: 1,
    };
    this.saveTorneo(uid, torneo);
    const d = this.getData(uid);
    if (!d.torneoActualId || d.torneos.length === 1) {
      d.torneoActualId = torneo.id;
      this.saveData(uid, d);
    }
    return torneo;
  },

  deleteTorneo(uid, tid) {
    const d = this.getData(uid);
    d.torneos = d.torneos.filter(t => t.id !== tid);
    if (d.torneoActualId === tid) d.torneoActualId = d.torneos[0]?.id || null;
    this.saveData(uid, d);
  },

  renameTorneo(uid, tid, nombre) {
    const d = this.getData(uid);
    const t = d.torneos.find(t => t.id === tid);
    if (t) { t.nombre = nombre; t.season = nombre; }
    this.saveData(uid, d);
  },
};
