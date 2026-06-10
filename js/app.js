/* ── Utilities ─────────────────────────────────────────── */
function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }
function hexRgb(hex) {
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return `${r},${g},${b}`;
}

/* ── Toast ─────────────────────────────────────────────── */
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const dot = document.createElement('span');
  dot.className = 'toast-dot';
  t.appendChild(dot);
  t.appendChild(document.createTextNode(msg));
  qs('#toast-container').appendChild(t); 
  setTimeout(() => { t.classList.add('removing'); setTimeout(() => t.remove(), 200); }, 2800);
}

/* ── Confirm dialog ────────────────────────────────────── */
let _confirmResolve = null;
function confirmDialog(msg, title = 'Confirmar acción') {
  return new Promise(resolve => {
    _confirmResolve = resolve;
    qs('#confirm-title').textContent = title;
    qs('#confirm-message').textContent = msg;
    openModal('modal-confirm');
  });
}
qs('#btn-confirm-ok').addEventListener('click', () => { closeModal('modal-confirm'); if (_confirmResolve) _confirmResolve(true);  _confirmResolve = null; });
qs('#btn-confirm-cancel').addEventListener('click', () => { closeModal('modal-confirm'); if (_confirmResolve) _confirmResolve(false); _confirmResolve = null; });

/* ── Modals ────────────────────────────────────────────── */
function openModal(id) {
  const el = qs(`#${id}`);
  el.style.display = 'flex';
  requestAnimationFrame(() => el.classList.add('open'));
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const el = qs(`#${id}`);
  el.classList.remove('open');
  el.style.display = 'none';
  if (!qsa('.modal-backdrop').some(m => m.style.display === 'flex'))
    document.body.style.overflow = '';
}
document.addEventListener('click', e => { const d = e.target.closest('[data-dismiss]'); if (d) closeModal(d.dataset.dismiss); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') qsa('.modal-backdrop').filter(m => m.style.display === 'flex').forEach(m => closeModal(m.id)); });
qsa('.modal-backdrop').forEach(bd => bd.addEventListener('click', e => { if (e.target === bd) closeModal(bd.id); }));

/* ── Logo fallback helper ──────────────────────────────── */
function logoImg(team, size = 'sm') {
  if (!team) return '';
  const cls = { lg: 'team-logo-lg', md: 'team-logo-md', table: 'team-logo', sm: 'team-logo-sm' }[size] || 'team-logo-sm';
  return `<img src="${team.logo}" alt="${team.name}" class="${cls}" loading="lazy"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <span class="team-badge" style="background:${team.color};color:${team.text};display:none">${team.short}</span>`;
}

/* ── SVG icons (inline) ────────────────────────────────── */
const SVG = {
  stadium: `<svg viewBox="0 0 20 20" fill="currentColor" style="width:13px;height:13px"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>`,
  calendar: `<svg viewBox="0 0 20 20" fill="currentColor" style="width:13px;height:13px"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>`,
  clock:    `<svg viewBox="0 0 20 20" fill="currentColor" style="width:13px;height:13px"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>`,
  trash:    `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 7a1 1 0 012 0v4a1 1 0 11-2 0V9zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V9z" clip-rule="evenodd"/></svg>`,
  edit:     `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>`,
  goal:     `<svg viewBox="0 0 20 20" fill="currentColor" style="width:11px;height:11px"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 6l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3z" fill="currentColor"/></svg>`,
};

/* ── Date/time formatter ───────────────────────────────── */
function fmtDate(fecha, hora) {
  if (!fecha) return '';
  const d = new Date(fecha + 'T12:00:00');
  const datePart = d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
  return hora ? `${datePart} ${hora}` : datePart;
}
function sortKey(p) {
  if (!p.fecha) return '9999-99-99T99:99';
  return `${p.fecha}T${p.hora || '00:00'}`;
}

/* ── Auth state & multi-torneo override ────────────── */
let _authUser = null;

Store.get = function () {
  if (!_authUser) return this._initial();
  const t = TorneoStore.getTorneoActual(_authUser.id);
  if (!t) return this._initial();
  if (!t.liguilla) t.liguilla = this._initialLiguilla();
  const addMeta = m => {
    if (!('idaEstadio' in m))
      Object.assign(m, { idaEstadio:'', idaFecha:'', idaHora:'', vueltaEstadio:'', vueltaFecha:'', vueltaHora:'' });
  };
  t.liguilla.cuartos?.forEach(addMeta);
  t.liguilla.semis?.forEach(addMeta);
  if (t.liguilla.final) addMeta(t.liguilla.final);
  return t;
};

Store.set = function (state) {
  if (!_authUser) return;
  TorneoStore.saveTorneo(_authUser.id, state);
};

/* ═══════════════════════════════════════════════════════
   STANDINGS
═══════════════════════════════════════════════════════ */
function calculateStandings(jornadas) {
  const map = {};
  LIGA_MX_TEAMS.forEach(t => { map[t.id] = { team: t, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0, form: [] }; });
  [...jornadas].sort((a, b) => a.numero - b.numero).forEach(jornada => {
    jornada.partidos.forEach(p => {
      if (!p.jugado || p.golesLocal == null || p.golesVisitante == null) return;
      const L = map[p.localId], V = map[p.visitanteId];
      if (!L || !V) return;
      const gl = Number(p.golesLocal), gv = Number(p.golesVisitante);
      L.pj++; V.pj++; L.gf += gl; L.gc += gv; V.gf += gv; V.gc += gl;
      if (gl > gv)      { L.g++; L.pts += 3; L.form.push('W'); V.p++; V.form.push('L'); }
      else if (gl < gv) { V.g++; V.pts += 3; V.form.push('W'); L.p++; L.form.push('L'); }
      else              { L.e++; L.pts++;    L.form.push('D'); V.e++; V.pts++;    V.form.push('D'); }
    });
  });
  return Object.values(map)
    .map(s => ({ ...s, dg: s.gf - s.gc, form: s.form.slice(-5) }))
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.team.name.localeCompare(b.team.name));
}

function renderStandings() {
  const state = Store.get();
  const rows  = calculateStandings(state.jornadas);
  const totalJugados = state.jornadas.reduce((s, j) => s + j.partidos.filter(p => p.jugado).length, 0);
  qs('#header-stats').innerHTML = `
    <div class="stat-chip"><span class="val">${state.jornadas.length}</span><span class="lbl">Jornadas</span></div>
    <div class="stat-chip"><span class="val">${totalJugados}</span><span class="lbl">Jugados</span></div>`;

  qs('#standings-tbody').innerHTML = rows.map((s, i) => {
    const pos = i + 1, zone = pos <= 8 ? 'zone-liguilla' : '';
    const dgCls = s.dg > 0 ? 'dg-pos' : s.dg < 0 ? 'dg-neg' : 'dg-zero';
    const dgSign = s.dg > 0 ? '+' : '';
    const formHTML = s.form.length
      ? s.form.map(r => `<span class="form-dot ${r}" title="${r==='W'?'Victoria':r==='D'?'Empate':'Derrota'}">${r}</span>`).join('')
      : '<span style="color:var(--text-sm);font-size:.7rem">—</span>';
    return `<tr class="${zone}">
      <td class="col-pos"><span class="pos-num">${pos}</span></td>
      <td class="col-team"><div class="team-cell">${logoImg(s.team,'table')}<span class="team-name">${s.team.name}</span></div></td>
      <td>${s.pj}</td><td>${s.g}</td><td>${s.e}</td><td>${s.p}</td>
      <td>${s.gf}</td><td>${s.gc}</td>
      <td class="${dgCls}">${dgSign}${s.dg}</td>
      <td class="col-pts">${s.pts}</td>
      <td class="col-form"><div class="form-badges">${formHTML}</div></td>
    </tr>`;
  }).join('');
}

/* ═══════════════════════════════════════════════════════
   JORNADAS
═══════════════════════════════════════════════════════ */
function renderJornadas() {
  const openIds = new Set(qsa('.jornada-card.open').map(c => c.dataset.jornadaId));

  const state     = Store.get();
  const container = qs('#jornadas-container');
  const emptyEl   = qs('#empty-jornadas');

  if (!state.jornadas.length) {
    container.innerHTML = '';
    emptyEl.classList.add('visible');
    return;
  }
  emptyEl.classList.remove('visible');

  const sorted = [...state.jornadas].sort((a, b) => a.numero - b.numero);

  container.innerHTML = sorted.map(jornada => {
    const total       = jornada.partidos.length;
    const jugados     = jornada.partidos.filter(p => p.jugado).length;
    const pct         = total > 0 ? Math.round(jugados / total * 100) : 0;
    const allPlayed   = total > 0 && jugados === total;
    const totalGoals  = jornada.partidos
      .filter(p => p.jugado && p.golesLocal != null)
      .reduce((s, p) => s + Number(p.golesLocal) + Number(p.golesVisitante), 0);

    // Unique teams used → show "+ Partido" only if <18 teams assigned
    const usedTeams = new Set();
    jornada.partidos.forEach(p => { usedTeams.add(p.localId); usedTeams.add(p.visitanteId); });
    const canAddMatch = usedTeams.size < 18;

    // Sort matches by fecha+hora
    const partidos = [...jornada.partidos].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

    const matchesHTML = partidos.map(p => {
      const local = getTeamById(p.localId);
      const visit = getTeamById(p.visitanteId);
      if (!local || !visit) return '';
      const played   = p.jugado;
      const scoreL   = played && p.golesLocal    != null ? p.golesLocal    : '–';
      const scoreV   = played && p.golesVisitante != null ? p.golesVisitante : '–';
      const statusCls = played ? 'played' : 'pending';

      // Meta info (stadium, date, time)
      const metaParts = [];
      if (p.estadio) metaParts.push(`<span class="match-meta-item">${SVG.stadium} ${p.estadio}</span>`);
      if (p.fecha)   metaParts.push(`<span class="match-meta-item">${SVG.calendar} ${fmtDate(p.fecha, p.hora)}</span>`);
      const metaHTML = metaParts.length ? `<div class="match-meta">${metaParts.join('')}</div>` : '';

      return `
        <div class="match-card ${statusCls}" style="--lcrgb:${hexRgb(local.color)};--vcrgb:${hexRgb(visit.color)}" data-jornada="${jornada.id}" data-partido="${p.id}" role="button">
          <div class="match-team">
            ${logoImg(local,'sm')}
            <span class="match-team-name">${local.name}</span>
          </div>
          <div class="match-score-center">
            <div class="match-score">
              <span class="score-num">${scoreL}</span>
              <span class="score-sep">:</span>
              <span class="score-num">${scoreV}</span>
            </div>
            <span class="match-status ${statusCls}">${played ? 'Jugado' : 'Pendiente'}</span>
          </div>
          <div class="match-team right">
            <span class="match-team-name">${visit.name}</span>
            ${logoImg(visit,'sm')}
          </div>
          <div class="match-card-actions">
            <button class="btn-icon" data-edit-partido="${p.id}" data-edit-jornada="${jornada.id}" title="Editar resultado">
              ${SVG.edit}
            </button>
            ${!played ? `<button class="btn-icon danger" data-del-partido="${p.id}" data-del-jornada="${jornada.id}" title="Eliminar partido">${SVG.trash}</button>` : ''}
          </div>
          ${metaHTML}
        </div>`;
    }).join('');

    return `
      <div class="jornada-card" data-jornada-id="${jornada.id}">
        <div class="jornada-header" data-toggle-jornada="${jornada.id}">
          <div class="jornada-header-left">
            <div class="jornada-num-badge">J${jornada.numero}</div>
            <div class="jornada-info">
              <div class="jornada-title">Jornada ${jornada.numero}</div>
              <div class="jornada-meta">
                <span class="jornada-count">${total} partido${total !== 1 ? 's' : ''}</span>
                <div class="jornada-progress">
                  <div class="progress-pill"><div class="progress-fill" style="width:${pct}%"></div></div>
                  <span class="progress-label">${jugados}/${total}</span>
                </div>
                ${jugados > 0 ? `<span class="jornada-goals">${SVG.goal} ${totalGoals} gol${totalGoals !== 1 ? 'es' : ''}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="jornada-header-right">
            ${canAddMatch && !allPlayed ? `
              <button class="btn btn-sm btn-secondary" data-add-partido="${jornada.id}" style="z-index:1">
                <svg viewBox="0 0 20 20" fill="currentColor" style="width:13px;height:13px"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
                Partido
              </button>` : ''}
            ${!allPlayed ? `
              <button class="btn-icon danger" data-del-jornada-main="${jornada.id}" style="z-index:1" title="Eliminar jornada">
                ${SVG.trash}
              </button>` : ''}
            <svg class="chevron" viewBox="0 0 20 20" fill="currentColor" style="pointer-events:none">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
        <div class="jornada-body">
          <div class="matches-grid">
            ${matchesHTML || '<p style="text-align:center;color:var(--text-sm);font-size:.8rem;padding:16px">Sin partidos. Agrega el primero.</p>'}
          </div>
        </div>
      </div>`;
  }).join('');

  openIds.forEach(id => {
    const card = qs(`.jornada-card[data-jornada-id="${id}"]`);
    if (card) card.classList.add('open');
  });

  bindJornadaEvents();
}

function bindJornadaEvents() {
  qsa('[data-toggle-jornada]').forEach(btn => {
    btn.addEventListener('click', e => {
      if (e.target.closest('[data-add-partido]') || e.target.closest('[data-del-jornada-main]')) return;
      btn.closest('.jornada-card').classList.toggle('open');
    });
  });
  qsa('.match-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.match-card-actions')) return;
      openResultadoModal(card.dataset.jornada, card.dataset.partido);
    });
  });
  qsa('[data-edit-partido]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openResultadoModal(btn.dataset.editJornada, btn.dataset.editPartido); });
  });
  qsa('[data-del-partido]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (await confirmDialog('¿Eliminar este partido? Se recalcularán las estadísticas.'))
        deletePartido(btn.dataset.delJornada, btn.dataset.delPartido);
    });
  });
  qsa('[data-add-partido]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openJornadaModal('add', btn.dataset.addPartido); });
  });
  qsa('[data-del-jornada-main]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (await confirmDialog('¿Eliminar esta jornada y todos sus partidos?', 'Eliminar Jornada'))
        deleteJornada(btn.dataset.delJornadaMain);
    });
  });
}

/* ═══════════════════════════════════════════════════════
   JORNADA MODAL — crear / agregar partidos
═══════════════════════════════════════════════════════ */
let _modalRows = [];   // [{ localId, visitanteId, estadio, fecha, hora }]
let _modalMode = 'create';
let _modalJornadaId = null;

function openJornadaModal(mode, jornadaId = null) {
  _modalMode = mode;
  _modalJornadaId = jornadaId;
  _modalRows = [{ localId: '', visitanteId: '', estadio: '', fecha: '', hora: '' }];

  const numGroup = qs('#jornada-num-group');
  const numInput = qs('#jornada-num');

  if (mode === 'create') {
    qs('#modal-jornada-title').textContent = 'Nueva Jornada';
    numGroup.style.display = '';
    const state = Store.get();
    numInput.value    = state.jornadas.reduce((m, j) => Math.max(m, j.numero), 0) + 1;
    numInput.disabled = false;
  } else {
    const jornada = Store.get().jornadas.find(j => String(j.id) === String(jornadaId));
    qs('#modal-jornada-title').textContent = `Agregar Partidos — Jornada ${jornada?.numero ?? ''}`;
    numGroup.style.display = 'none';
  }

  renderMatchRows();
  openModal('modal-jornada');
}

/* Teams already used across the whole modal (other rows + existing jornada) */
function getGlobalUsedTeams(excludeRowIdx = -1) {
  const used = new Set();
  _modalRows.forEach((r, i) => {
    if (i === excludeRowIdx) return;
    if (r.localId)     used.add(r.localId);
    if (r.visitanteId) used.add(r.visitanteId);
  });
  if (_modalMode === 'add' && _modalJornadaId) {
    const jornada = Store.get().jornadas.find(j => String(j.id) === String(_modalJornadaId));
    jornada?.partidos.forEach(p => { used.add(p.localId); used.add(p.visitanteId); });
  }
  return used;
}

/* Total unique teams committed (for "+ Partido" visibility) */
function totalUsedTeams() {
  const used = new Set();
  _modalRows.forEach(r => { if (r.localId) used.add(r.localId); if (r.visitanteId) used.add(r.visitanteId); });
  if (_modalMode === 'add' && _modalJornadaId) {
    const jornada = Store.get().jornadas.find(j => String(j.id) === String(_modalJornadaId));
    jornada?.partidos.forEach(p => { used.add(p.localId); used.add(p.visitanteId); });
  }
  return used.size;
}

function stadiumField(row, i) {
  const localTeam = row.localId ? getTeamById(row.localId) : null;
  if (!localTeam) {
    return `<input type="text" class="form-input form-input-sm" placeholder="Selecciona equipo local primero" disabled style="flex:1;opacity:.5">`;
  }
  if (localTeam.extraStadiums) {
    const opts = localTeam.extraStadiums.map(s =>
      `<option value="${s}" ${row.estadio === s ? 'selected' : ''}>${s}</option>`
    ).join('');
    return `<select class="form-input form-input-sm" data-role="estadio" data-idx="${i}" style="flex:1">${opts}</select>`;
  }
  return `<input type="text" class="form-input form-input-sm" value="${localTeam.stadium}" readonly style="flex:1;color:var(--text-md)">`;
}

function renderMatchRows() {
  const list = qs('#match-rows-list');
  const allUsed = totalUsedTeams();

  // Show/hide "+ Partido" button (max 9 partidos, max 18 equipos únicos)
  qs('#btn-add-row').style.display = (_modalRows.length >= 9 || allUsed >= 18) ? 'none' : '';

  if (!_modalRows.length) {
    list.innerHTML = '<div class="no-rows-msg">Haz clic en "+ Partido" para agregar un partido.</div>';
    return;
  }

  list.innerHTML = _modalRows.map((row, i) => {
    const globalUsed = getGlobalUsedTeams(i);
    // Exclude: global used + same-row's opponent
    const excludeL = new Set([...globalUsed, row.visitanteId].filter(Boolean));
    const excludeV = new Set([...globalUsed, row.localId].filter(Boolean));

    // Available teams = all teams NOT excluded (keep current selection even if somehow in set)
    const localTeams   = LIGA_MX_TEAMS_ALPHA.filter(t => !excludeL.has(t.id) || t.id === row.localId);
    const visitTeams   = LIGA_MX_TEAMS_ALPHA.filter(t => !excludeV.has(t.id) || t.id === row.visitanteId);

    const localOpts = localTeams.map(t =>
      `<option value="${t.id}" ${t.id === row.localId ? 'selected' : ''}>${t.name}</option>`).join('');
    const visitOpts = visitTeams.map(t =>
      `<option value="${t.id}" ${t.id === row.visitanteId ? 'selected' : ''}>${t.name}</option>`).join('');

    return `
      <div class="match-row" data-row="${i}">
        <div class="match-row-teams">
          <select class="form-input form-input-sm" data-role="local" data-idx="${i}">
            <option value="">Local...</option>${localOpts}
          </select>
          <span class="match-row-vs">vs</span>
          <select class="form-input form-input-sm" data-role="visitante" data-idx="${i}">
            <option value="">Visitante...</option>${visitOpts}
          </select>
        </div>
        <div class="match-row-stadium">
          ${SVG.stadium}
          ${stadiumField(row, i)}
        </div>
        <div class="match-row-datetime">
          <div class="match-row-datetime-field">
            ${SVG.calendar}
            <input type="date" class="form-input form-input-sm" data-role="fecha" data-idx="${i}"
                   value="${row.fecha || ''}" style="flex:1">
          </div>
          <div class="match-row-datetime-field">
            ${SVG.clock}
            <input type="time" class="form-input form-input-sm" data-role="hora" data-idx="${i}"
                   value="${row.hora || ''}" style="flex:1">
          </div>
          <button type="button" class="match-row-del" data-del-row="${i}" title="Eliminar fila">
            ${SVG.trash}
          </button>
        </div>
      </div>`;
  }).join('');

  // Bind events on freshly rendered elements
  qsa('[data-role="local"], [data-role="visitante"]', list).forEach(sel => {
    sel.addEventListener('change', () => {
      const idx  = Number(sel.dataset.idx);
      const role = sel.dataset.role;
      _modalRows[idx][role === 'local' ? 'localId' : 'visitanteId'] = sel.value;
      // Auto-set stadium when local changes
      if (role === 'local') {
        const t = getTeamById(sel.value);
        _modalRows[idx].estadio = t ? (t.extraStadiums ? t.extraStadiums[0] : t.stadium) : '';
      }
      renderMatchRows();
    });
  });
  qsa('[data-role="estadio"]', list).forEach(sel => {
    sel.addEventListener('change', () => {
      _modalRows[Number(sel.dataset.idx)].estadio = sel.value;
    });
  });
  qsa('[data-role="fecha"]', list).forEach(inp => {
    inp.addEventListener('change', () => { _modalRows[Number(inp.dataset.idx)].fecha = inp.value; });
  });
  qsa('[data-role="hora"]', list).forEach(inp => {
    inp.addEventListener('change', () => { _modalRows[Number(inp.dataset.idx)].hora = inp.value; });
  });
  qsa('[data-del-row]', list).forEach(btn => {
    btn.addEventListener('click', () => {
      _modalRows.splice(Number(btn.dataset.delRow), 1);
      renderMatchRows();
    });
  });
}

qs('#btn-add-row').addEventListener('click', () => {
  if (_modalRows.length >= 9) { toast('Máximo 9 partidos por jornada.', 'error'); return; }
  _modalRows.push({ localId: '', visitanteId: '', estadio: '', fecha: '', hora: '' });
  renderMatchRows();
});

qs('#btn-save-jornada').addEventListener('click', () => {
  _modalMode === 'create' ? saveNewJornada() : saveAddPartidos();
});

function buildPartidosFromRows(state) {
  return _modalRows
    .filter(r => r.localId && r.visitanteId)
    .map(r => {
      const team = getTeamById(r.localId);
      const estadio = r.estadio || (team?.extraStadiums ? team.extraStadiums[0] : team?.stadium) || '';
      return { id: state._np++, localId: r.localId, visitanteId: r.visitanteId, estadio, fecha: r.fecha || '', hora: r.hora || '', golesLocal: null, golesVisitante: null, jugado: false };
    });
}

function saveNewJornada() {
  const num = Number(qs('#jornada-num').value);
  if (!num || num < 1 || num > 17) { toast('El número de jornada debe estar entre 1 y 17.', 'error'); return; }
  const state = Store.get();
  if (state.jornadas.length >= 17) { toast('Máximo 17 jornadas por torneo (formato Liga MX).', 'error'); return; }
  if (state.jornadas.some(j => j.numero === num)) { toast(`Ya existe la Jornada ${num}.`, 'error'); return; }
  const partidos = buildPartidosFromRows(state);
  if (!partidos.length) { toast('Agrega al menos un partido con ambos equipos.', 'error'); return; }
  if (partidos.length > 9) { toast('Máximo 9 partidos por jornada.', 'error'); return; }
  state.jornadas.push({ id: state._nj++, numero: num, partidos });
  Store.set(state);
  closeModal('modal-jornada');
  renderAll();
  toast(`Jornada ${num} creada con ${partidos.length} partido${partidos.length > 1 ? 's' : ''}.`);
}

function saveAddPartidos() {
  const state   = Store.get();
  const jornada = state.jornadas.find(j => String(j.id) === String(_modalJornadaId));
  if (!jornada) return;
  const partidos = buildPartidosFromRows(state);
  if (!partidos.length) { toast('Agrega al menos un partido con ambos equipos.', 'error'); return; }
  if (jornada.partidos.length + partidos.length > 9) {
    toast(`Máximo 9 partidos por jornada (ya tiene ${jornada.partidos.length}).`, 'error'); return;
  }
  jornada.partidos.push(...partidos);
  Store.set(state);
  closeModal('modal-jornada');
  renderAll();
  toast(`${partidos.length} partido${partidos.length > 1 ? 's agregados' : ' agregado'}.`);
}

/* ═══════════════════════════════════════════════════════
   RESULTADO MODAL (partidos regulares)
═══════════════════════════════════════════════════════ */
function openResultadoModal(jornadaId, partidoId) {
  const state   = Store.get();
  const jornada = state.jornadas.find(j => String(j.id) === String(jornadaId));
  const partido = jornada?.partidos.find(p => String(p.id) === String(partidoId));
  if (!partido) return;
  const local = getTeamById(partido.localId);
  const visit = getTeamById(partido.visitanteId);
  if (!local || !visit) return;

  qs('#res-jornada-id').value = jornadaId;
  qs('#res-partido-id').value = partidoId;
  qs('#res-jugado').checked   = partido.jugado;

  // Stadium field: dropdown if Cruz Azul, readonly text otherwise
  const stadiumInput = local.extraStadiums
    ? `<select class="form-input form-input-sm" id="res-estadio">
        ${local.extraStadiums.map(s => `<option value="${s}" ${(partido.estadio || local.extraStadiums[0]) === s ? 'selected' : ''}>${s}</option>`).join('')}
       </select>`
    : `<input type="text" class="form-input form-input-sm" id="res-estadio"
              value="${partido.estadio || local.stadium || ''}" readonly style="color:var(--text-md)">`;

  qs('#score-editor').innerHTML = `
    <div class="score-editor-inner">
      <div class="score-team-block">
        <img src="${local.logo}" alt="${local.name}" style="width:52px;height:52px;object-fit:contain"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <span class="score-team-badge-lg" style="background:${local.color};color:${local.text};display:none">${local.short}</span>
        <span class="score-team-name-sm">${local.name}</span>
      </div>
      <div class="score-input-wrap">
        <input type="number" class="score-input" id="score-local" min="0" max="99" placeholder="0"
               value="${partido.golesLocal != null ? partido.golesLocal : ''}">
        <span class="score-sep-lg">:</span>
        <input type="number" class="score-input" id="score-visitante" min="0" max="99" placeholder="0"
               value="${partido.golesVisitante != null ? partido.golesVisitante : ''}">
      </div>
      <div class="score-team-block right">
        <img src="${visit.logo}" alt="${visit.name}" style="width:52px;height:52px;object-fit:contain"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <span class="score-team-badge-lg" style="background:${visit.color};color:${visit.text};display:none">${visit.short}</span>
        <span class="score-team-name-sm">${visit.name}</span>
      </div>
    </div>
    <div class="res-details">
      <div class="res-detail-row">
        ${SVG.stadium}
        <span class="res-detail-label">Estadio</span>
        ${stadiumInput}
      </div>
      <div class="res-detail-row">
        ${SVG.calendar}
        <span class="res-detail-label">Fecha</span>
        <input type="date" class="form-input form-input-sm" id="res-fecha" value="${partido.fecha || ''}">
      </div>
      <div class="res-detail-row">
        ${SVG.clock}
        <span class="res-detail-label">Hora</span>
        <input type="time" class="form-input form-input-sm" id="res-hora" value="${partido.hora || ''}">
      </div>
    </div>`;

  openModal('modal-resultado');
  qsa('#score-local, #score-visitante').forEach(inp => inp.addEventListener('input', () => {
    if (qs('#score-local').value !== '' && qs('#score-visitante').value !== '')
      qs('#res-jugado').checked = true;
  }));
}

qs('#btn-save-resultado').addEventListener('click', saveResultado);
qs('#btn-clear-result').addEventListener('click', clearResultado);

function saveResultado() {
  const jornadaId = qs('#res-jornada-id').value;
  const partidoId = qs('#res-partido-id').value;
  const jugado    = qs('#res-jugado').checked;
  const scoreL    = qs('#score-local').value;
  const scoreV    = qs('#score-visitante').value;
  if (jugado && (scoreL === '' || scoreV === '')) { toast('Ingresa el marcador para marcar como jugado.', 'error'); return; }

  const state   = Store.get();
  const jornada = state.jornadas.find(j => String(j.id) === String(jornadaId));
  const partido = jornada?.partidos.find(p => String(p.id) === String(partidoId));
  if (!partido) return;

  partido.jugado         = jugado;
  partido.golesLocal     = jugado && scoreL !== '' ? Number(scoreL) : null;
  partido.golesVisitante = jugado && scoreV !== '' ? Number(scoreV) : null;
  partido.estadio        = qs('#res-estadio')?.value || partido.estadio || '';
  partido.fecha          = qs('#res-fecha')?.value   || '';
  partido.hora           = qs('#res-hora')?.value    || '';

  Store.set(state);
  closeModal('modal-resultado');
  renderAll();
  const local = getTeamById(partido.localId), visit = getTeamById(partido.visitanteId);
  toast(jugado ? `${local?.name} ${partido.golesLocal} – ${partido.golesVisitante} ${visit?.name}` : 'Datos guardados.');

  const next = findNextPendingPartido(jornada, partidoId);
  if (next) {
    const nL = getTeamById(next.localId), nV = getTeamById(next.visitanteId);
    confirmDialog(`${nL?.name} vs ${nV?.name}`, '¿Capturar el siguiente partido?')
      .then(ok => { if (ok) openResultadoModal(jornadaId, next.id); });
  }
}

function findNextPendingPartido(jornada, currentPartidoId) {
  const sorted = [...jornada.partidos].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const idx = sorted.findIndex(p => String(p.id) === String(currentPartidoId));
  for (let i = idx + 1; i < sorted.length; i++) {
    if (!sorted[i].jugado) return sorted[i];
  }
  for (let i = 0; i < idx; i++) {
    if (!sorted[i].jugado) return sorted[i];
  }
  return null;
}

function clearResultado() {
  const state   = Store.get();
  const jornadaId = qs('#res-jornada-id').value;
  const partidoId = qs('#res-partido-id').value;
  const jornada = state.jornadas.find(j => String(j.id) === String(jornadaId));
  const partido = jornada?.partidos.find(p => String(p.id) === String(partidoId));
  if (!partido) return;
  partido.jugado = false; partido.golesLocal = null; partido.golesVisitante = null;
  Store.set(state);
  closeModal('modal-resultado');
  renderAll();
  toast('Resultado eliminado.', 'info');
}

function deletePartido(jornadaId, partidoId) {
  const state   = Store.get();
  const jornada = state.jornadas.find(j => String(j.id) === String(jornadaId));
  if (!jornada) return;
  jornada.partidos = jornada.partidos.filter(p => String(p.id) !== String(partidoId));
  Store.set(state); renderAll(); toast('Partido eliminado.', 'info');
}
function deleteJornada(jornadaId) {
  const state = Store.get();
  state.jornadas = state.jornadas.filter(j => String(j.id) !== String(jornadaId));
  Store.set(state); renderAll(); toast('Jornada eliminada.', 'info');
}

/* ═══════════════════════════════════════════════════════
   LIGUILLA
═══════════════════════════════════════════════════════ */
function computeWinner(match) {
  if (!match.homeId || !match.awayId) return null;
  if (match.manualWinner && match.winnerId) return match.winnerId;
  const idaDone    = match.idaHome    != null && match.idaAway    != null;
  const vueltaDone = match.vueltaHome != null && match.vueltaAway != null;
  if (!idaDone || !vueltaDone) return null;
  const homeAgg = Number(match.idaHome) + Number(match.vueltaAway);
  const awayAgg = Number(match.idaAway) + Number(match.vueltaHome);
  return homeAgg >= awayAgg ? match.homeId : match.awayId;
}
function getAgg(match) {
  const idaDone    = match.idaHome    != null && match.idaAway    != null;
  const vueltaDone = match.vueltaHome != null && match.vueltaAway != null;
  let h = 0, a = 0;
  if (idaDone)    { h += Number(match.idaHome);    a += Number(match.idaAway); }
  if (vueltaDone) { h += Number(match.vueltaAway); a += Number(match.vueltaHome); }
  return { h, a, done: idaDone && vueltaDone };
}

function initLiguilla() {
  const state    = Store.get();
  const top8     = calculateStandings(state.jornadas).slice(0, 8);
  const lig      = state.liguilla;
  lig.active     = true;
  lig.cuartos[0].homeId = top8[0].team.id; lig.cuartos[0].awayId = top8[7].team.id;
  lig.cuartos[1].homeId = top8[1].team.id; lig.cuartos[1].awayId = top8[6].team.id;
  lig.cuartos[2].homeId = top8[2].team.id; lig.cuartos[2].awayId = top8[5].team.id;
  lig.cuartos[3].homeId = top8[3].team.id; lig.cuartos[3].awayId = top8[4].team.id;
  lig.cuartos.forEach(m => { m.idaHome=null;m.idaAway=null;m.vueltaHome=null;m.vueltaAway=null;m.winnerId=null;m.manualWinner=false; });
  lig.semis.forEach(m => Object.assign(m,{homeId:null,awayId:null,idaHome:null,idaAway:null,vueltaHome:null,vueltaAway:null,winnerId:null,manualWinner:false}));
  Object.assign(lig.final,{homeId:null,awayId:null,idaHome:null,idaAway:null,vueltaHome:null,vueltaAway:null,winnerId:null,manualWinner:false});
  lig.champion = null;
  Store.set(state); renderLiguilla(); toast('Bracket de Liguilla generado.');
}

function updateBracketProgression(state) {
  const lig = state.liguilla;
  lig.cuartos.forEach(m => { m.winnerId = computeWinner(m); });
  const qWinners = lig.cuartos.map(m => m.winnerId).filter(Boolean);
  if (qWinners.length >= 2) {
    const standings = calculateStandings(state.jornadas);
    const seed = id => { const i = standings.findIndex(s => s.team.id === id); return i >= 0 ? i+1 : 99; };
    const seeded = qWinners.map(id => ({ id, s: seed(id) })).sort((a, b) => a.s - b.s);
    if (seeded.length >= 2) {
      const [s1h, s1a] = [seeded[0].id, seeded[seeded.length-1].id];
      if (lig.semis[0].homeId !== s1h || lig.semis[0].awayId !== s1a) {
        Object.assign(lig.semis[0],{homeId:s1h,awayId:s1a,idaHome:null,idaAway:null,vueltaHome:null,vueltaAway:null,winnerId:null,manualWinner:false});
      }
    }
    if (seeded.length >= 4) {
      const [s2h, s2a] = [seeded[1].id, seeded[2].id];
      if (lig.semis[1].homeId !== s2h || lig.semis[1].awayId !== s2a) {
        Object.assign(lig.semis[1],{homeId:s2h,awayId:s2a,idaHome:null,idaAway:null,vueltaHome:null,vueltaAway:null,winnerId:null,manualWinner:false});
      }
    }
  }
  lig.semis.forEach(m => { m.winnerId = computeWinner(m); });
  const [s1w, s2w] = [lig.semis[0].winnerId, lig.semis[1].winnerId];
  if (s1w && s2w && (lig.final.homeId !== s1w || lig.final.awayId !== s2w)) {
    Object.assign(lig.final,{homeId:s1w,awayId:s2w,idaHome:null,idaAway:null,vueltaHome:null,vueltaAway:null,winnerId:null,manualWinner:false});
  }
  lig.final.winnerId = computeWinner(lig.final);
  lig.champion = lig.final.winnerId || null;
}

function bMatchHTML(match, round) {
  if (!match.homeId || !match.awayId)
    return `<div class="b-match tbd"><div class="b-match-tbd">Por definir</div></div>`;
  const home = getTeamById(match.homeId), away = getTeamById(match.awayId);
  const winner = match.winnerId, agg = getAgg(match);
  function teamRow(team, isHome) {
    const isWinner = winner === team.id, isLoser = winner && winner !== team.id;
    const sIda    = isHome ? match.idaHome    : match.idaAway;
    const sVuelta = isHome ? match.vueltaAway : match.vueltaHome;
    const aggVal  = isHome ? agg.h : agg.a;
    return `<div class="b-match-row ${isWinner?'winner':isLoser?'loser':''}">
      <div class="b-match-team">
        <img src="${team.logo}" alt="${team.name}" class="team-logo-sm"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <span class="team-badge" style="background:${team.color};color:${team.text};display:none;width:20px;height:20px;min-width:20px;border-radius:4px;font-size:.5rem">${team.short}</span>
        <span class="b-match-team-name">${team.name}</span>
      </div>
      <div class="b-match-scores">
        <div class="b-score-block"><span class="b-score-lbl">Ida</span><span class="b-score-val">${sIda!=null?sIda:'–'}</span></div>
        <span class="b-score-sep">·</span>
        <div class="b-score-block"><span class="b-score-lbl">Vuelta</span><span class="b-score-val">${sVuelta!=null?sVuelta:'–'}</span></div>
        ${agg.done?`<span class="b-score-sep">·</span><div class="b-score-block"><span class="b-score-lbl">Agg</span><span class="b-score-val" style="${isWinner?'color:var(--green)':''}">${aggVal}</span></div>`:''}
      </div>
    </div>`;
  }
  const metaIdaParts = [], metaVueltaParts = [];
  if (match.idaEstadio)  metaIdaParts.push(match.idaEstadio);
  if (match.idaFecha)    metaIdaParts.push(fmtDate(match.idaFecha, match.idaHora));
  if (match.vueltaEstadio) metaVueltaParts.push(match.vueltaEstadio);
  if (match.vueltaFecha)   metaVueltaParts.push(fmtDate(match.vueltaFecha, match.vueltaHora));
  const metaHTML = (metaIdaParts.length || metaVueltaParts.length) ? `
    <div class="b-match-meta">
      ${metaIdaParts.length   ? `<span class="b-meta-item">${SVG.stadium} <em>Ida:</em> ${metaIdaParts.join(' · ')}</span>` : ''}
      ${metaVueltaParts.length? `<span class="b-meta-item">${SVG.stadium} <em>Vuelta:</em> ${metaVueltaParts.join(' · ')}</span>` : ''}
    </div>` : '';
  return `<div class="b-match" data-lig-round="${round}" data-lig-id="${match.id}" title="Click para editar">
    ${teamRow(home,true)}${teamRow(away,false)}
    ${agg.done?`<div class="b-agg">Global: <span>${agg.h}–${agg.a}</span>${winner?` · Avanza: <span>${getTeamById(winner)?.name}</span>`:''}</div>`:''}
    ${metaHTML}
  </div>`;
}

function renderLiguilla() {
  const state = Store.get(), lig = state.liguilla;
  const container = qs('#liguilla-container');
  const initBtn = qs('#btn-init-liguilla'), resetBtn = qs('#btn-reset-liguilla');
  const warnEl  = qs('#bracket-warning'),   warnText = qs('#bracket-warning-text');

  if (!lig.active) {
    initBtn.style.display = ''; resetBtn.style.display = 'none'; warnEl.style.display = 'none';
    container.innerHTML = `<div class="card" style="padding:0"><div class="liguilla-empty"><div style="font-size:3rem;margin-bottom:12px">🏆</div><p>El bracket se genera automáticamente desde los primeros <strong>8 equipos</strong> de la tabla.</p></div></div>`;
    return;
  }
  updateBracketProgression(state); Store.set(state);
  initBtn.style.display = 'none'; resetBtn.style.display = '';
  const allQ = lig.cuartos.every(m => m.winnerId), allS = lig.semis.every(m => m.winnerId);
  warnEl.style.display = (!allQ || !allS) ? 'flex' : 'none';
  if (!allQ) warnText.textContent = 'Completa los cuartos para definir las semifinales';
  else if (!allS) warnText.textContent = 'Completa las semifinales para definir la final';

  const champ = lig.champion ? getTeamById(lig.champion) : null;
  container.innerHTML = `
    <div class="bracket-card">
      <div class="liguilla-bracket-scroll">
        <div class="bracket-grid">
          <div class="bracket-col">
            <div class="bracket-col-header">Cuartos de Final</div>
            <div class="bracket-col-body">${lig.cuartos.map(m => bMatchHTML(m,'cuartos')).join('')}</div>
          </div>
          <div class="bracket-col">
            <div class="bracket-col-header">Semifinal</div>
            <div class="bracket-col-body" style="justify-content:space-around;gap:24px">
              ${bMatchHTML(lig.semis[0],'semis-0')}${bMatchHTML(lig.semis[1],'semis-1')}
            </div>
          </div>
          <div class="bracket-col">
            <div class="bracket-col-header">Final</div>
            <div class="bracket-col-body" style="justify-content:center">${bMatchHTML(lig.final,'final')}</div>
          </div>
          <div class="bracket-col">
            <div class="bracket-col-header gold">🏆 Campeón</div>
            <div class="bracket-col-body" style="justify-content:center">
              <div class="champion-card">
                ${champ ? `
                  <div class="champion-trophy">🏆</div>
                  <span class="champion-label">Campeón</span>
                  <div class="champion-team">
                    <img src="${champ.logo}" alt="${champ.name}" class="champion-logo"
                         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                    <span class="team-badge" style="background:${champ.color};color:${champ.text};display:none;width:64px;height:64px;border-radius:16px;font-size:.85rem">${champ.short}</span>
                    <span class="champion-name">${champ.name}</span>
                  </div>` : `
                  <div class="champion-empty">
                    <div class="champion-empty-icon">🏆</div>
                    <span class="champion-empty-text">Por definir</span>
                  </div>`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  bindBracketEvents();
}

function bindBracketEvents() {
  qsa('[data-lig-round]').forEach(card => {
    if (card.classList.contains('tbd')) return;
    card.addEventListener('click', () => openLiguillaModal(card.dataset.ligRound, card.dataset.ligId));
  });
}

function openLiguillaModal(round, matchId) {
  const state = Store.get(), lig = state.liguilla;
  let match, titleText;
  if (round === 'cuartos')   { match = lig.cuartos.find(m => m.id === matchId); titleText = `Cuartos — ${match?.label || ''}`; }
  else if (round === 'semis-0') { match = lig.semis[0]; titleText = 'Semifinal 1'; }
  else if (round === 'semis-1') { match = lig.semis[1]; titleText = 'Semifinal 2'; }
  else                          { match = lig.final;    titleText = 'Gran Final'; }
  if (!match?.homeId || !match?.awayId) return;

  const home = getTeamById(match.homeId), away = getTeamById(match.awayId);
  qs('#lig-modal-title').textContent = titleText;
  qs('#lig-match-round').value = round;
  qs('#lig-match-id').value    = matchId;
  const agg = getAgg(match), winner = match.winnerId;
  const homeWin = winner === match.homeId, awayWin = winner === match.awayId;

  /* ── Estadios por defecto ── */
  const idaDefaultStadium    = away.extraStadiums ? away.extraStadiums[0] : away.stadium;
  const vueltaDefaultStadium = home.extraStadiums ? home.extraStadiums[0] : home.stadium;

  function teamBlock(team, role) {
    return `
      <div class="lig-leg-team">
        <img src="${team.logo}" alt="${team.name}" class="team-logo-md"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <span class="team-badge" style="background:${team.color};color:${team.text};display:none;width:38px;height:38px;min-width:38px;border-radius:10px;font-size:.6rem">${team.short}</span>
        <span class="lig-leg-team-name">${team.name}</span>
        <span class="lig-leg-team-role">${role}</span>
      </div>`;
  }

  function legMeta(idPrefix, estadio, fecha, hora) {
    return `
      <div class="lig-leg-meta">
        <div class="lig-meta-field lig-meta-estadio">
          ${SVG.stadium}
          <input type="text" class="form-input form-input-sm" id="${idPrefix}-estadio"
                 placeholder="Estadio" value="${estadio}">
        </div>
        <div class="lig-meta-field">
          ${SVG.calendar}
          <input type="date" class="form-input form-input-sm" id="${idPrefix}-fecha" value="${fecha}">
        </div>
        <div class="lig-meta-field">
          ${SVG.clock}
          <input type="time" class="form-input form-input-sm" id="${idPrefix}-hora" value="${hora}">
        </div>
      </div>`;
  }

  qs('#lig-score-editor').innerHTML = `
    <div class="lig-legs">

      <!-- IDA — equipo visitante del bracket es LOCAL aquí -->
      <div class="lig-leg">
        <div class="lig-leg-title">
          <span class="lig-leg-badge ida">Ida</span>
          <span class="lig-leg-role">${away.name} local · ${home.name} visitante</span>
        </div>
        <div class="lig-leg-match">
          ${teamBlock(away, 'Local')}
          <div class="lig-leg-score">
            <input type="number" class="lig-score-in" id="lig-ida-away" min="0" max="99"
                   placeholder="0" value="${match.idaAway != null ? match.idaAway : ''}">
            <span class="lig-score-sep">:</span>
            <input type="number" class="lig-score-in" id="lig-ida-home" min="0" max="99"
                   placeholder="0" value="${match.idaHome != null ? match.idaHome : ''}">
          </div>
          ${teamBlock(home, 'Visitante')}
        </div>
        ${legMeta('lig-ida', match.idaEstadio || idaDefaultStadium, match.idaFecha || '', match.idaHora || '')}
      </div>

      <!-- VUELTA — equipo home del bracket es LOCAL aquí -->
      <div class="lig-leg">
        <div class="lig-leg-title">
          <span class="lig-leg-badge vuelta">Vuelta</span>
          <span class="lig-leg-role">${home.name} local · ${away.name} visitante</span>
        </div>
        <div class="lig-leg-match">
          ${teamBlock(home, 'Local')}
          <div class="lig-leg-score">
            <input type="number" class="lig-score-in" id="lig-vuelta-away" min="0" max="99"
                   placeholder="0" value="${match.vueltaAway != null ? match.vueltaAway : ''}">
            <span class="lig-score-sep">:</span>
            <input type="number" class="lig-score-in" id="lig-vuelta-home" min="0" max="99"
                   placeholder="0" value="${match.vueltaHome != null ? match.vueltaHome : ''}">
          </div>
          ${teamBlock(away, 'Visitante')}
        </div>
        ${legMeta('lig-vuelta', match.vueltaEstadio || vueltaDefaultStadium, match.vueltaFecha || '', match.vueltaHora || '')}
      </div>

    </div>

    <!-- Global en vivo -->
    <div class="agg-live-row">
      <span class="agg-team-name">${home.name}</span>
      <div class="agg-display" id="agg-live" style="opacity:${agg.done ? 1 : .35}">
        <div class="agg-display-title">Global</div>
        <div class="agg-display-score">${agg.done ? `${agg.h} – ${agg.a}` : '– – –'}</div>
      </div>
      <span class="agg-team-name right">${away.name}</span>
    </div>

    <!-- Ganador manual -->
    <div class="winner-select-group form-group" style="margin-top:10px">
      <div class="winner-select-label">⚡ Ganador manual (en caso de empate global el mejor sembrado avanza automáticamente)</div>
      <select class="form-input" id="lig-manual-winner">
        <option value="">— Automático —</option>
        <option value="${home.id}" ${homeWin ? 'selected' : ''}>${home.name}</option>
        <option value="${away.id}" ${awayWin ? 'selected' : ''}>${away.name}</option>
      </select>
    </div>`;

  qsa('.lig-score-in').forEach(inp => inp.addEventListener('input', () => {
    const iH = qs('#lig-ida-home').value,    iA = qs('#lig-ida-away').value;
    const vA = qs('#lig-vuelta-away').value, vH = qs('#lig-vuelta-home').value;
    const div = qs('#agg-live');
    if (iH !== '' && iA !== '' && vA !== '' && vH !== '') {
      div.style.opacity = '1';
      /* homeAgg = idaHome + vueltaAway  |  awayAgg = idaAway + vueltaHome */
      div.querySelector('.agg-display-score').textContent = `${Number(iH)+Number(vA)} – ${Number(iA)+Number(vH)}`;
    } else {
      div.style.opacity = '.35';
    }
  }));

  openModal('modal-lig-resultado');
}

qs('#btn-lig-save').addEventListener('click', saveLiguillaResult);
qs('#btn-lig-clear').addEventListener('click', clearLiguillaResult);

function saveLiguillaResult() {
  const round = qs('#lig-match-round').value, matchId = qs('#lig-match-id').value;
  const state = Store.get(), lig = state.liguilla;
  let match;
  if (round==='cuartos') match = lig.cuartos.find(m=>m.id===matchId);
  else if (round==='semis-0') match = lig.semis[0];
  else if (round==='semis-1') match = lig.semis[1];
  else match = lig.final;
  if (!match) return;
  match.idaHome    = qs('#lig-ida-home').value    !== '' ? Number(qs('#lig-ida-home').value)    : null;
  match.idaAway    = qs('#lig-ida-away').value    !== '' ? Number(qs('#lig-ida-away').value)    : null;
  match.vueltaHome = qs('#lig-vuelta-home').value !== '' ? Number(qs('#lig-vuelta-home').value) : null;
  match.vueltaAway = qs('#lig-vuelta-away').value !== '' ? Number(qs('#lig-vuelta-away').value) : null;
  match.idaEstadio    = qs('#lig-ida-estadio').value    || '';
  match.idaFecha      = qs('#lig-ida-fecha').value      || '';
  match.idaHora       = qs('#lig-ida-hora').value       || '';
  match.vueltaEstadio = qs('#lig-vuelta-estadio').value || '';
  match.vueltaFecha   = qs('#lig-vuelta-fecha').value   || '';
  match.vueltaHora    = qs('#lig-vuelta-hora').value    || '';
  const mw = qs('#lig-manual-winner').value;
  match.manualWinner = !!mw; match.winnerId = mw || null;
  Store.set(state); closeModal('modal-lig-resultado'); renderLiguilla();
  const w = computeWinner(match);
  toast(w ? `${getTeamById(w)?.name} avanza a la siguiente ronda.` : 'Resultado guardado.');
}

function clearLiguillaResult() {
  const round = qs('#lig-match-round').value, matchId = qs('#lig-match-id').value;
  const state = Store.get(), lig = state.liguilla;
  let match;
  if (round==='cuartos') match = lig.cuartos.find(m=>m.id===matchId);
  else if (round==='semis-0') match = lig.semis[0];
  else if (round==='semis-1') match = lig.semis[1];
  else match = lig.final;
  if (!match) return;
  Object.assign(match,{idaHome:null,idaAway:null,vueltaHome:null,vueltaAway:null,winnerId:null,manualWinner:false,idaEstadio:'',idaFecha:'',idaHora:'',vueltaEstadio:'',vueltaFecha:'',vueltaHora:''});
  Store.set(state); closeModal('modal-lig-resultado'); renderLiguilla(); toast('Resultado limpiado.','info');
}

qs('#btn-init-liguilla').addEventListener('click', initLiguilla);
qs('#btn-reset-liguilla').addEventListener('click', async () => {
  if (await confirmDialog('¿Reiniciar el bracket? Se perderán todos los resultados de Liguilla.','Reiniciar Bracket')) {
    const state = Store.get(); state.liguilla = Store._initialLiguilla();
    Store.set(state); renderLiguilla(); toast('Bracket reiniciado.','info');
  }
});

/* ── Tabs ──────────────────────────────────────────────── */
qsa('.nav-tab').forEach(tab => tab.addEventListener('click', () => {
  const target = tab.dataset.tab;
  qsa('.nav-tab').forEach(t => t.classList.remove('active'));
  qsa('.tab-panel').forEach(p => p.classList.remove('active'));
  tab.classList.add('active');
  qs(`#tab-${target}`).classList.add('active');
  if (target === 'graficas') renderGraficas();
}));

qs('#btn-nueva-jornada').addEventListener('click', () => openJornadaModal('create'));
qs('#btn-empty-jornada').addEventListener('click', () => openJornadaModal('create'));

function renderAll() {
  renderHeader();
  renderStandings();
  renderJornadas();
  renderLiguilla();
  if (qs('#tab-graficas')?.classList.contains('active')) renderGraficas();
}

function renderHeader() {
  if (!_authUser) return;
  const state = Store.get();
  qs('#season-badge').textContent = state.nombre || state.season || '—';
  renderTorneoSelector();
}

/* ═══════════════════════════════════════════════════════
   AUTH — pantalla de inicio de sesión
═══════════════════════════════════════════════════════ */
function showAuthScreen() {
  qs('#auth-screen').style.display = 'flex';
  qs('#app-screen').style.display  = 'none';
}
function hideAuthScreen() {
  qs('#auth-screen').style.display = 'none';
  qs('#app-screen').style.display  = '';
}

function initAuthForms() {
  qsa('.auth-tab').forEach(tab => tab.addEventListener('click', () => {
    qsa('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const mode = tab.dataset.auth;
    qs('#form-login').style.display    = mode === 'login'    ? '' : 'none';
    qs('#form-register').style.display = mode === 'register' ? '' : 'none';
  }));

  qs('#form-login').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = qs('#form-login .auth-submit');
    btn.disabled = true; btn.textContent = 'Entrando…';
    const r = await AuthStore.login({ username: qs('#login-username').value, password: qs('#login-password').value });
    btn.disabled = false; btn.textContent = 'Entrar';
    r.error ? showAuthError('login', r.error) : loginUser(r.user);
  });

  qs('#form-register').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = qs('#form-register .auth-submit');
    btn.disabled = true; btn.textContent = 'Creando cuenta…';
    const r = await AuthStore.register({
      username: qs('#reg-username').value,
      name:     qs('#reg-name').value,
      password: qs('#reg-password').value,
    });
    btn.disabled = false; btn.textContent = 'Crear cuenta';
    r.error ? showAuthError('register', r.error) : loginUser(r.user);
  });
}

function showAuthError(form, msg) {
  const el = qs(form === 'login' ? '#login-error' : '#reg-error');
  el.textContent = msg;
  el.style.display = '';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

function migrateOldData(userId) {
  const raw = localStorage.getItem('liga-mx-v1');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (!data.jornadas?.length) return;
    if (TorneoStore.getTorneos(userId).length > 0) return;
    const torneo = {
      id: `t${Date.now()}`,
      nombre: data.season || 'Clausura 2026',
      season: data.season || 'Clausura 2026',
      jornadas: data.jornadas,
      liguilla: data.liguilla || Store._initialLiguilla(),
      _nj: data._nj || 1, _np: data._np || 1,
    };
    TorneoStore.saveTorneo(userId, torneo);
    TorneoStore.setTorneoActual(userId, torneo.id);
    localStorage.removeItem('liga-mx-v1');
    toast('Datos anteriores importados.', 'info');
  } catch {}
}

async function loginUser(user) {
  _authUser = user;
  // Cargar datos frescos desde Vercel Blob (fuente de verdad)
  await TorneoStore.loadFromBlob(user.id);
  // Migración desde formato v1 (solo si el store sigue vacío)
  migrateOldData(user.id);
  hideAuthScreen();
  renderUserMenu();
  renderTorneoSelector();
  renderAll();
  if (!TorneoStore.getTorneos(user.id).length) {
    qs('#welcome-name').textContent = user.name.split(' ')[0];
    openModal('modal-welcome');
  }
}

async function initApp() {
  initAuthForms();
  const user = await AuthStore.getCurrentUser();
  user ? loginUser(user) : showAuthScreen();
}

/* ═══════════════════════════════════════════════════════
   USER MENU
═══════════════════════════════════════════════════════ */
function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
}
function avatarBg(id) {
  const colors = ['#e74c3c','#e67e22','#27ae60','#2980b9','#8e44ad','#e91e63','#00b894','#0984e3'];
  let h = 0;
  for (const c of id) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return colors[Math.abs(h) % colors.length];
}
function avatarHTML(user, large = false) {
  const size = large ? 64 : 30;
  const fs   = large ? '1.3rem' : '.7rem';
  if (user.avatar)
    return `<img src="${user.avatar}" class="avatar-img" alt="${user.name}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover">`;
  return `<span style="background:${avatarBg(user.id)};width:${size}px;height:${size}px;min-width:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${fs};font-weight:800;color:#fff">${getInitials(user.name)}</span>`;
}

function renderUserMenu() {
  if (!_authUser) return;
  qs('#header-user-avatar').innerHTML = avatarHTML(_authUser);
  qs('#header-greeting').textContent  = `¡Hola, ${_authUser.name.split(' ')[0]}!`;
}

// User menu toggle — position fixed so overlay no es recortado por overflow del header
qs('#user-menu-btn').addEventListener('click', e => {
  e.stopPropagation();
  const dd  = qs('#user-dropdown');
  const btn = qs('#user-menu-btn');
  if (dd.style.display !== 'none') { dd.style.display = 'none'; return; }
  const rect = btn.getBoundingClientRect();
  dd.style.top   = `${rect.bottom + 8}px`;
  dd.style.right = `${window.innerWidth - rect.right}px`;
  dd.style.display = '';
});
document.addEventListener('click', () => { qs('#user-dropdown').style.display = 'none'; });

qs('#btn-logout').addEventListener('click', () => {
  AuthStore.logout();
  _authUser = null;
  showAuthScreen();
  toast('Sesión cerrada.', 'info');
});

qs('#btn-open-profile').addEventListener('click', () => {
  qs('#user-dropdown').style.display = 'none';
  openProfileModal();
});

/* ═══════════════════════════════════════════════════════
   TORNEO SELECTOR
═══════════════════════════════════════════════════════ */
function renderTorneoSelector() {
  if (!_authUser) return;
  const torneos = TorneoStore.getTorneos(_authUser.id);
  const current = TorneoStore.getTorneoActual(_authUser.id);
  const sel = qs('#torneo-select');
  sel.innerHTML = torneos.map(t =>
    `<option value="${t.id}" ${t.id === current?.id ? 'selected' : ''}>${t.nombre}</option>`
  ).join('') || '<option value="">Sin torneos</option>';
}

qs('#torneo-select').addEventListener('change', () => {
  if (!_authUser) return;
  TorneoStore.setTorneoActual(_authUser.id, qs('#torneo-select').value);
  renderAll();
});

qs('#btn-manage-torneos').addEventListener('click', () => {
  renderTorneosList();
  openModal('modal-torneos');
});

/* ═══════════════════════════════════════════════════════
   TORNEOS MODAL
═══════════════════════════════════════════════════════ */
function renderTorneosList() {
  if (!_authUser) return;
  const torneos = TorneoStore.getTorneos(_authUser.id);
  const current = TorneoStore.getTorneoActual(_authUser.id);
  const container = qs('#torneos-list');
  if (!torneos.length) {
    container.innerHTML = '<p class="empty-msg">Aún no hay torneos. Crea el primero abajo.</p>';
    return;
  }
  container.innerHTML = torneos.map(t => `
    <div class="torneo-item ${t.id === current?.id ? 'active' : ''}">
      <div class="torneo-item-info">
        <span class="torneo-item-name" data-edit-name="${t.id}">${t.nombre}</span>
        ${t.id === current?.id ? '<span class="torneo-active-badge">Activo</span>' : ''}
      </div>
      <div class="torneo-item-actions">
        ${t.id !== current?.id ? `<button class="btn btn-sm btn-ghost" data-select-torneo="${t.id}">Usar</button>` : ''}
        <button class="btn btn-sm btn-ghost" data-rename-torneo="${t.id}" title="Renombrar">${SVG.edit}</button>
        <button class="btn btn-sm btn-danger-ghost" data-delete-torneo="${t.id}" title="Eliminar">${SVG.trash}</button>
      </div>
    </div>`).join('');

  qsa('[data-select-torneo]', container).forEach(btn => {
    btn.addEventListener('click', () => {
      TorneoStore.setTorneoActual(_authUser.id, btn.dataset.selectTorneo);
      renderTorneosList(); renderAll();
      toast(`Torneo: ${Store.get().nombre || Store.get().season}`);
    });
  });

  qsa('[data-rename-torneo]', container).forEach(btn => {
    btn.addEventListener('click', () => {
      const tid   = btn.dataset.renameTorneo;
      const nameEl = container.querySelector(`[data-edit-name="${tid}"]`);
      nameEl.contentEditable = 'true'; nameEl.focus();
      const range = document.createRange(); range.selectNodeContents(nameEl);
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      const save = () => {
        nameEl.contentEditable = 'false';
        const n = nameEl.textContent.trim();
        if (n) { TorneoStore.renameTorneo(_authUser.id, tid, n); renderTorneosList(); renderAll(); }
      };
      nameEl.addEventListener('blur', save, { once: true });
      nameEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); } });
    });
  });

  qsa('[data-delete-torneo]', container).forEach(btn => {
    btn.addEventListener('click', async () => {
      const tid = btn.dataset.deleteTorneo;
      const t   = TorneoStore.getTorneos(_authUser.id).find(t => t.id === tid);
      if (!t) return;
      if (!await confirmDialog(`¿Eliminar "${t.nombre}"? Se perderán todos sus datos.`, 'Eliminar torneo')) return;
      TorneoStore.deleteTorneo(_authUser.id, tid);
      renderTorneosList(); renderAll();
      toast('Torneo eliminado.', 'info');
    });
  });
}

qs('#btn-crear-torneo').addEventListener('click', () => {
  const nombre = qs('#new-torneo-name').value.trim();
  if (!nombre) { toast('Ingresa un nombre para el torneo.', 'error'); return; }
  TorneoStore.createTorneo(_authUser.id, nombre);
  qs('#new-torneo-name').value = '';
  renderTorneosList(); renderTorneoSelector();
  toast(`Torneo "${nombre}" creado.`);
});

/* ═══════════════════════════════════════════════════════
   PROFILE MODAL
═══════════════════════════════════════════════════════ */
function openProfileModal() {
  if (!_authUser) return;
  const u = _authUser;
  qs('#profile-avatar-preview').innerHTML = avatarHTML(u, true);
  qs('#profile-name').value      = u.name;
  qs('#profile-username').value  = u.username;
  qs('#profile-password').value  = '';
  qs('#profile-error').style.display   = 'none';
  qs('#profile-success').style.display = 'none';
  qs('#btn-remove-avatar').style.display = u.avatar ? '' : 'none';
  openModal('modal-profile');
}

qs('#btn-change-avatar').addEventListener('click', () => qs('#profile-avatar-file').click());
qs('#profile-avatar-file').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const src = ev.target.result;
    qs('#profile-avatar-preview').innerHTML = `<img src="${src}" class="avatar-img" style="width:64px;height:64px;border-radius:50%;object-fit:cover">`;
    qs('#btn-remove-avatar').style.display = '';
    qs('#profile-avatar-file')._pendingAvatar = src;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});
qs('#btn-remove-avatar').addEventListener('click', () => {
  qs('#profile-avatar-preview').innerHTML = avatarHTML({ ..._authUser, avatar: null }, true);
  qs('#btn-remove-avatar').style.display = 'none';
  qs('#profile-avatar-file')._pendingAvatar = null;
});

qs('#btn-save-profile').addEventListener('click', async () => {
  if (!_authUser) return;
  const fileInput = qs('#profile-avatar-file');
  const updates   = {
    name:     qs('#profile-name').value,
    username: qs('#profile-username').value,
  };
  if (qs('#profile-password').value) updates.password = qs('#profile-password').value;
  if ('_pendingAvatar' in fileInput) updates.avatar = fileInput._pendingAvatar;

  const btn = qs('#btn-save-profile');
  btn.disabled = true; btn.textContent = 'Guardando…';
  const r = await AuthStore.updateUser(_authUser.id, updates);
  btn.disabled = false; btn.textContent = 'Guardar cambios';

  if (r.error) {
    const el = qs('#profile-error');
    el.textContent = r.error; el.style.display = '';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
    return;
  }
  _authUser = r.user;
  delete fileInput._pendingAvatar;
  renderUserMenu();
  renderAll();
  qs('#profile-success').style.display = '';
  setTimeout(() => { qs('#profile-success').style.display = 'none'; }, 3000);
});

/* ═══════════════════════════════════════════════════════
   GRÁFICAS — Evolución de posiciones jornada por jornada
═══════════════════════════════════════════════════════ */
let _posChart = null;
let _visibleTeams = new Set(LIGA_MX_TEAMS.map(t => t.id));

function buildPositionHistory() {
  const state = Store.get();
  const sorted = [...state.jornadas].sort((a, b) => a.numero - b.numero);
  if (!sorted.length) return { labels: [], datasets: [] };

  const labels = sorted.map(j => `J${j.numero}`);
  const history = {};
  LIGA_MX_TEAMS.forEach(t => { history[t.id] = []; });

  for (let i = 0; i < sorted.length; i++) {
    const subset = sorted.slice(0, i + 1);
    const standings = calculateStandings(subset);
    LIGA_MX_TEAMS.forEach(t => {
      const pos = standings.findIndex(s => s.team.id === t.id);
      history[t.id].push(pos >= 0 ? pos + 1 : 18);
    });
  }

  const datasets = LIGA_MX_TEAMS.map(t => ({
    label: t.name,
    teamId: t.id,
    data: history[t.id],
    borderColor: t.color,
    backgroundColor: t.color + '22',
    borderWidth: 2.5,
    pointRadius: 3,
    pointHoverRadius: 6,
    pointBackgroundColor: t.color,
    tension: 0.3,
    hidden: !_visibleTeams.has(t.id),
  }));

  return { labels, datasets };
}

const _liguillaZonePlugin = {
  id: 'liguillaZone',
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!scales.y || !chartArea) return;
    const y1 = scales.y.getPixelForValue(0.5);
    const y8 = scales.y.getPixelForValue(8.5);
    const yTop = Math.min(y1, y8), yBot = Math.max(y1, y8);
    ctx.save();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.fillRect(chartArea.left, yTop, chartArea.right - chartArea.left, yBot - yTop);
    ctx.restore();
  },
};

function renderGraficas() {
  if (!_authUser) return;
  const { labels, datasets } = buildPositionHistory();

  const wrap  = qs('#grafica-chart-wrap');
  const empty = qs('#grafica-empty');
  const canvas = qs('#grafica-canvas');
  if (!canvas) return;

  if (!labels.length) {
    if (empty)  empty.style.display  = '';
    if (wrap)   wrap.style.display   = 'none';
    renderGraficaTeams();
    return;
  }
  if (empty)  empty.style.display  = 'none';
  if (wrap)   wrap.style.display   = '';

  if (_posChart) {
    _posChart.data.labels   = labels;
    _posChart.data.datasets = datasets;
    _posChart.update('none');
  } else {
    _posChart = new Chart(canvas, {
      type: 'line',
      plugins: [_liguillaZonePlugin],
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            reverse: true,
            min: 0.5,
            max: 18.5,
            ticks: {
              stepSize: 1,
              color: '#7da88a',
              font: { size: 11 },
              callback: v => {
                if (!Number.isInteger(v)) return null;
                if (v === 1) return '1° ';
                if (v === 8) return '8° ';
                return `${v}`;
              },
            },
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { color: 'rgba(255,255,255,0.08)' },
          },
          x: {
            ticks: { color: '#7da88a', font: { size: 11 } },
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { color: 'rgba(255,255,255,0.08)' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0c1913',
            borderColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1,
            titleColor: '#ddeee1',
            bodyColor: '#7da88a',
            padding: 14,
            itemSort: (a, b) => a.parsed.y - b.parsed.y,
            callbacks: {
              title: items => items[0]?.label || '',
              label: ctx => {
                const pos = ctx.parsed.y;
                const zone = pos <= 8 ? ' ✦' : '';
                return `  ${pos}°  ${ctx.dataset.label}${zone}`;
              },
            },
          },
        },
        interaction: { mode: 'index', intersect: false },
        animation: { duration: 250 },
      },
    });
  }

  renderGraficaTeams();
}

function renderGraficaTeams() {
  const container = qs('#grafica-teams');
  if (!container) return;
  container.innerHTML = LIGA_MX_TEAMS.map(t => {
    const active = _visibleTeams.has(t.id);
    return `<button class="team-chip${active ? ' active' : ''}" data-team-id="${t.id}" title="${t.name}"
      style="${active ? `border-color:${t.color}40` : ''}">
      <img src="${t.logo}" class="chip-logo" alt="${t.short}" onerror="this.style.display='none'">
      <span class="chip-name">${t.short}</span>
    </button>`;
  }).join('');

  qsa('.team-chip', container).forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.dataset.teamId;
      if (_visibleTeams.has(id)) _visibleTeams.delete(id);
      else _visibleTeams.add(id);

      const visible = _visibleTeams.has(id);
      chip.classList.toggle('active', visible);
      const team = getTeamById(id);
      chip.style.borderColor = visible && team ? team.color + '40' : '';

      if (_posChart) {
        const ds = _posChart.data.datasets.find(d => d.teamId === id);
        if (ds) { ds.hidden = !visible; _posChart.update('none'); }
      }
    });
  });
}

qs('#btn-graf-todos').addEventListener('click', () => {
  _visibleTeams = new Set(LIGA_MX_TEAMS.map(t => t.id));
  renderGraficas();
});
qs('#btn-graf-ninguno').addEventListener('click', () => {
  _visibleTeams = new Set();
  renderGraficas();
});
qs('#btn-graf-top8').addEventListener('click', () => {
  const state     = Store.get();
  const standings = calculateStandings(state.jornadas);
  _visibleTeams   = new Set(standings.slice(0, 8).map(s => s.team.id));
  renderGraficas();
});

/* ═══════════════════════════════════════════════════════
   GUIDED TOUR
═══════════════════════════════════════════════════════ */
const TOUR_STEPS = [
  {
    title: '¡Bienvenido a Liga MX Tracker! 🏆',
    body: 'Esta guía te lleva por todas las secciones de la app paso a paso para que puedas configurar tu primera temporada. Usa <strong>Siguiente ›</strong> y <strong>‹ Anterior</strong> para navegar, o <strong>Saltar</strong> si prefieres explorar por tu cuenta.',
    target: null,
    position: 'center',
  },
  {
    title: '🗂️ Selector de Torneo',
    body: 'Un <strong>torneo</strong> es una temporada completa — por ejemplo "Clausura 2026" o "Apertura 2025". Este selector muestra el torneo activo y te permite cambiar entre varios. Cada torneo guarda sus propias jornadas, resultados y liguilla de forma independiente.',
    target: '#torneo-selector-wrap',
    position: 'bottom',
  },
  {
    title: '⚙️ Gestionar Torneos',
    body: 'Con este botón (ícono de controles) abres el <strong>panel de torneos</strong>: crea nuevos, renómbralos, cambia entre ellos o elimínalos. <em>El primer paso siempre es crear un torneo antes de agregar jornadas.</em>',
    target: '#btn-manage-torneos',
    position: 'bottom',
  },
  {
    title: '📊 Tabla de Posiciones',
    body: 'La <strong>Tabla</strong> muestra los 18 equipos ordenados por puntos — Victoria = 3 pts, Empate = 1 pt, Derrota = 0. Los <strong>8 primeros</strong> (marcados en verde) clasifican a la Liguilla. La tabla se recalcula automáticamente con cada resultado que captures.',
    target: 'button[data-tab="tabla"]',
    position: 'bottom',
    tab: 'tabla',
  },
  {
    title: '📈 Cómo leer la Tabla',
    body: '<strong>PJ</strong> Partidos Jugados &nbsp;·&nbsp; <strong>G/E/P</strong> Ganados, Empates, Perdidos &nbsp;·&nbsp; <strong>GF/GC</strong> Goles a Favor y en Contra &nbsp;·&nbsp; <strong>DG</strong> Diferencia de Goles &nbsp;·&nbsp; <strong>Pts</strong> Puntos totales &nbsp;·&nbsp; <strong>Forma</strong> últimos 5 partidos: W=Victoria, D=Empate, L=Derrota.',
    target: '.standings-table',
    position: 'bottom',
    tab: 'tabla',
  },
  {
    title: '📅 Jornadas',
    body: 'Aquí registras los partidos de cada fecha del torneo. La Liga MX tiene <strong>17 jornadas</strong> con hasta 9 partidos cada una (9 partidos × 2 equipos = los 18 equipos completos). Puedes agregar estadio, fecha y hora de cada encuentro.',
    target: 'button[data-tab="jornadas"]',
    position: 'bottom',
    tab: 'tabla',
  },
  {
    title: '➕ Crear una Jornada',
    body: 'Haz clic en <strong>"Nueva Jornada"</strong> para agregar una fecha. Elige el número de jornada (1–17) y agrega partidos seleccionando equipo local y visitante. El estadio se rellena automáticamente según el equipo local. Puedes agregar hasta 9 partidos por jornada.',
    target: '#btn-nueva-jornada',
    position: 'bottom',
    tab: 'jornadas',
  },
  {
    title: '⚽ Capturar Resultados',
    body: 'Una vez creada la jornada, <strong>haz clic en cualquier tarjeta de partido</strong> para abrir el editor de resultado. Ingresa los goles de cada equipo, activa "Partido jugado" y guarda. La tabla se actualiza al instante. La app te ofrecerá capturar el siguiente partido pendiente automáticamente.',
    target: '#tab-jornadas',
    position: 'top',
    tab: 'jornadas',
  },
  {
    title: '🏆 Liguilla (Playoff)',
    body: 'Cuando los 8 primeros de la tabla estén definidos, usa <strong>"Generar Bracket"</strong> en esta sección. El sistema arma cuartos, semis y gran final automáticamente. Cada ronda se juega con <strong>partido de ida y vuelta</strong>; el marcador global decide al clasificado. En empate global, el mejor sembrado avanza (o puedes elegir manualmente).',
    target: 'button[data-tab="liguilla"]',
    position: 'bottom',
    tab: 'tabla',
  },
  {
    title: '📊 Gráficas de Evolución',
    body: 'Las gráficas muestran cómo cambió la <strong>posición de cada equipo</strong> jornada a jornada. Usa los filtros inferiores para comparar equipos específicos, ver solo el Top 8 o deseleccionarlos todos. La zona verde indica las posiciones que clasifican a Liguilla.',
    target: 'button[data-tab="graficas"]',
    position: 'bottom',
    tab: 'tabla',
  },
  {
    title: '¡Todo listo! Crea tu primer torneo 🎉',
    body: 'Ya conoces toda la app. El <strong>primer paso es crear tu torneo</strong>: haz clic en el ícono de ajustes junto al selector, escribe el nombre (ej: "Clausura 2026") y presiona Crear. Después agrega tu primera jornada y comienza a capturar resultados. ¡Suerte!',
    target: '#btn-manage-torneos',
    position: 'bottom',
    tab: 'tabla',
  },
];

let _tourStep = 0;

function startTour() {
  _tourStep = 0;
  qs('#tour-overlay').style.display = '';
  qs('#tour-step-total').textContent = TOUR_STEPS.length;
  _tourGoTo(0);
}

function endTour() {
  qs('#tour-overlay').style.display = 'none';
}

function _tourGoTo(idx) {
  _tourStep = Math.max(0, Math.min(idx, TOUR_STEPS.length - 1));
  const step = TOUR_STEPS[_tourStep];

  if (step.tab) {
    qsa('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === step.tab));
    qsa('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + step.tab));
  }

  qs('#tour-title').innerHTML = step.title;
  qs('#tour-body').innerHTML  = step.body;
  qs('#tour-step-num').textContent = _tourStep + 1;
  qs('#tour-prev').style.display = _tourStep === 0 ? 'none' : '';

  const isLast = _tourStep === TOUR_STEPS.length - 1;
  const hasTorneos = _authUser && TorneoStore.getTorneos(_authUser.id).length > 0;
  qs('#tour-next').textContent = isLast
    ? (hasTorneos ? 'Finalizar ✓' : 'Crear mi torneo →')
    : 'Siguiente ›';

  qs('#tour-dots').innerHTML = TOUR_STEPS.map((_, i) =>
    `<span class="tour-dot${i === _tourStep ? ' active' : i < _tourStep ? ' done' : ''}"></span>`
  ).join('');

  _tourPosition(step.target ? qs(step.target) : null, step.position || 'center');
}

function _tourPosition(targetEl, position) {
  const backdrop  = qs('#tour-backdrop');
  const spotlight = qs('#tour-spotlight');
  const card      = qs('#tour-card');

  if (!targetEl) {
    backdrop.style.display  = '';
    spotlight.style.display = 'none';
    card.style.transform = 'translate(-50%, -50%)';
    card.style.top  = '50%';
    card.style.left = '50%';
    return;
  }

  backdrop.style.display  = 'none';
  spotlight.style.display = '';
  card.style.transform    = '';

  targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  setTimeout(() => {
    const rect  = targetEl.getBoundingClientRect();
    const pad   = 8;
    const cardW = 400;
    const vw    = window.innerWidth;
    const vh    = window.innerHeight;

    spotlight.style.top    = `${rect.top  - pad}px`;
    spotlight.style.left   = `${rect.left - pad}px`;
    spotlight.style.width  = `${rect.width  + pad * 2}px`;
    spotlight.style.height = `${rect.height + pad * 2}px`;

    let top, left;
    if (position === 'bottom') {
      top = rect.bottom + pad + 14;
      if (top + 250 > vh) top = rect.top - pad - 14 - 210;
    } else {
      top = rect.top - pad - 14 - 210;
      if (top < 16) top = rect.bottom + pad + 14;
    }

    left = rect.left + rect.width / 2 - cardW / 2;
    left = Math.max(12, Math.min(left, vw - cardW - 12));
    top  = Math.max(16, Math.min(top, vh - 230));

    card.style.top  = `${top}px`;
    card.style.left = `${left}px`;
  }, 320);
}

qs('#tour-next').addEventListener('click', () => {
  if (_tourStep >= TOUR_STEPS.length - 1) {
    const hasTorneos = _authUser && TorneoStore.getTorneos(_authUser.id).length > 0;
    endTour();
    if (!hasTorneos) { renderTorneosList(); openModal('modal-torneos'); }
    return;
  }
  _tourGoTo(_tourStep + 1);
});

qs('#tour-prev').addEventListener('click', () => { if (_tourStep > 0) _tourGoTo(_tourStep - 1); });
qs('#tour-skip').addEventListener('click', endTour);

qs('#btn-welcome-skip').addEventListener('click', () => closeModal('modal-welcome'));
qs('#btn-welcome-tour').addEventListener('click', () => { closeModal('modal-welcome'); startTour(); });

/* ── Boot ───────────────────────────────────────────── */
initApp();
