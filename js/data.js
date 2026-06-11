/* ══════════════════════════════════════════════════════
   DATOS ESTÁTICOS — equipos Liga MX
══════════════════════════════════════════════════════ */
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
  { id: 'mazatlan',  name: 'Atlante',             short: 'ATE',  color: '#003087', text: '#FFD700', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/20702.png', stadium: 'Estadio Azteca/Banorte', extraStadiums: ['Estadio Azteca/Banorte', 'Estadio Azteca'] },
  { id: 'juarez',    name: 'FC Juárez',          short: 'JUA',  color: '#BE1522', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/17851.png', stadium: 'Estadio Olímpico Benito Juárez' },
  { id: 'queretaro', name: 'Querétaro',          short: 'QRO',  color: '#0C3F87', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/222.png',   stadium: 'Estadio La Corregidora' },
  { id: 'tijuana',   name: 'Club Tijuana',       short: 'TIJ',  color: '#1A1A1A', text: '#CC0000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/10125.png', stadium: 'Estadio Caliente' },
  { id: 'sanluis',   name: 'Atlético San Luis',  short: 'ASL',  color: '#C8102E', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/15720.png', stadium: 'Estadio Alfonso Lastras' },
  { id: 'leon',      name: 'León',               short: 'LEO',  color: '#006847', text: '#F7D321', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/228.png',   stadium: 'Estadio Nou Camp León' },
  { id: 'pachuca',   name: 'Pachuca',            short: 'PAC',  color: '#1B3FA0', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/234.png',   stadium: 'Estadio Hidalgo' },
  { id: 'puebla',    name: 'Puebla',             short: 'PUE',  color: '#0B2E6F', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/231.png',   stadium: 'Estadio Cuauhtémoc' },
];

const LIGA_MX_TEAMS_ALPHA = [...LIGA_MX_TEAMS].sort((a, b) => a.name.localeCompare(b.name, 'es'));
function getTeamById(id) { return LIGA_MX_TEAMS.find(t => t.id === id) || null; }

/* ══════════════════════════════════════════════════════
   STORE — estado del torneo activo (caché síncrona)
══════════════════════════════════════════════════════ */
const Store = {
  KEY: 'liga-mx-v1',

  get() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this._initial();
      const data = JSON.parse(raw);
      if (!data.liguilla) data.liguilla = this._initialLiguilla();
      const addMeta = m => {
        if (!('idaEstadio' in m))
          Object.assign(m, { idaEstadio:'', idaFecha:'', idaHora:'', vueltaEstadio:'', vueltaFecha:'', vueltaHora:'' });
      };
      data.liguilla.cuartos?.forEach(addMeta);
      data.liguilla.semis?.forEach(addMeta);
      if (data.liguilla.final) addMeta(data.liguilla.final);
      return data;
    } catch { return this._initial(); }
  },

  set(state) { localStorage.setItem(this.KEY, JSON.stringify(state)); },

  _initial() {
    return { season: 'Clausura 2026', jornadas: [], liguilla: this._initialLiguilla(), _nj: 1, _np: 1 };
  },

  _initialLiguilla() {
    const meta = { idaEstadio:'', idaFecha:'', idaHora:'', vueltaEstadio:'', vueltaFecha:'', vueltaHora:'' };
    const base = { idaHome:null, idaAway:null, vueltaHome:null, vueltaAway:null, winnerId:null, manualWinner:false, ...meta };
    return {
      active: false,
      cuartos: [
        { id:'q1', label:'1° vs 8°', seed1:1, seed2:8, homeId:null, awayId:null, ...base },
        { id:'q2', label:'2° vs 7°', seed1:2, seed2:7, homeId:null, awayId:null, ...base },
        { id:'q3', label:'3° vs 6°', seed1:3, seed2:6, homeId:null, awayId:null, ...base },
        { id:'q4', label:'4° vs 5°', seed1:4, seed2:5, homeId:null, awayId:null, ...base },
      ],
      semis:   [{ id:'s1', homeId:null, awayId:null, ...base }, { id:'s2', homeId:null, awayId:null, ...base }],
      final:   { id:'f1', homeId:null, awayId:null, ...base },
      champion: null,
    };
  },
};

/* ══════════════════════════════════════════════════════
   AUTH STORE — respaldado por /api/auth
══════════════════════════════════════════════════════ */

/* Hash idéntico al del servidor para migración */
function _legacyHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36) + s.length.toString(36);
}

const AuthStore = {
  _token() { return localStorage.getItem('liga-mx-token'); },
  _setToken(t) { localStorage.setItem('liga-mx-token', t); },
  _clearToken() { localStorage.removeItem('liga-mx-token'); },

  async _api(body) {
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await r.json();
    } catch { return { error: 'Sin conexión. Verifica tu internet.' }; }
  },

  async getCurrentUser() {
    const tok = this._token();
    if (tok) {
      const r = await this._api({ action: 'verify', token: tok });
      if (r.user) return r.user;
      this._clearToken();
    }
    // Fallback offline: sesión localStorage antigua
    try {
      const s = JSON.parse(localStorage.getItem('liga-mx-session') || 'null');
      if (!s?.userId) return null;
      const us = JSON.parse(localStorage.getItem('liga-mx-users') || '[]');
      const u  = us.find(u => u.id === s.userId);
      return u ? { id: u.id, username: u.username, name: u.name, avatar: u.avatar || null } : null;
    } catch { return null; }
  },

  async login({ username, password }) {
    // Recopilar datos localStorage para migración transparente
    let bootstrap;
    try {
      const us = JSON.parse(localStorage.getItem('liga-mx-users') || '[]');
      const bu = us.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      if (bu) {
        const raw = localStorage.getItem(`liga-mx-data-${bu.id}`);
        bootstrap = { user: bu, data: raw ? JSON.parse(raw) : null };
      }
    } catch {}

    const r = await this._api({ action: 'login', username, password, bootstrap });
    if (r.token) this._setToken(r.token);
    return r;
  },

  async register({ username, name, password }) {
    const r = await this._api({ action: 'register', username, name, password });
    if (r.token) this._setToken(r.token);
    return r;
  },

  logout() { this._clearToken(); localStorage.removeItem('liga-mx-session'); },

  async updateUser(userId, updates) {
    const r = await this._api({ action: 'update', token: this._token(), updates });
    return r;
  },
};

/* ══════════════════════════════════════════════════════
   TORNEO STORE — caché local + sincronización con blob
══════════════════════════════════════════════════════ */
const TorneoStore = {
  _key(uid) { return `liga-mx-data-${uid}`; },

  getData(uid) {
    try {
      const raw = localStorage.getItem(this._key(uid));
      if (!raw) return { torneoActualId: null, torneos: [] };
      return JSON.parse(raw);
    } catch { return { torneoActualId: null, torneos: [] }; }
  },

  /* Guarda en localStorage y dispara sync asíncrono con blob */
  saveData(uid, d) {
    localStorage.setItem(this._key(uid), JSON.stringify(d));
    const tok = AuthStore._token();
    if (tok) {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify(d),
      }).catch(() => {});
    }
  },

  /* Carga datos frescos desde blob y actualiza el caché local */
  async loadFromBlob(uid) {
    const tok = AuthStore._token();
    if (!tok) return;
    try {
      const r = await fetch('/api/data', { headers: { Authorization: `Bearer ${tok}` } });
      if (!r.ok) return;
      const blob = await r.json();
      if (blob.torneos !== undefined) {
        // Blob tiene datos → es la fuente de verdad
        if (blob.torneos.length || !this.getData(uid).torneos.length) {
          localStorage.setItem(this._key(uid), JSON.stringify(blob));
        } else {
          // Blob vacío pero localStorage tiene datos → subir al blob
          const local = this.getData(uid);
          await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
            body: JSON.stringify(local),
          });
        }
      }
    } catch {}
  },

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
