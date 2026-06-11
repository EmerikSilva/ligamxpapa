import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import { LIGA_MX_TEAMS_ALPHA, getTeamById } from '../../data/teams'
import { useApp } from '../../context/AppContext'

const EMPTY_ROW = () => ({ localId: '', visitanteId: '', estadio: '', fecha: '', hora: '' })

const ICO_STADIUM = (
  <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}>
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
)
const ICO_CALENDAR = (
  <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}>
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
)
const ICO_CLOCK = (
  <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
)
const ICO_TRASH = (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 7a1 1 0 012 0v4a1 1 0 11-2 0V9zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
  </svg>
)
const ICO_PLUS = (
  <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}>
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
)

export default function JornadaModal({ isOpen, mode, jornadaId, onClose, onSave }) {
  const { currentTorneo, addToast } = useApp()
  const [rows, setRows] = useState([EMPTY_ROW()])
  const [jornadaNum, setJornadaNum] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setRows([EMPTY_ROW()])
    if (mode === 'create') {
      const maxNum = (currentTorneo?.jornadas || []).reduce((m, j) => Math.max(m, j.numero), 0)
      setJornadaNum(String(maxNum + 1))
    }
  }, [isOpen, mode, currentTorneo])

  function getGlobalUsed(excludeIdx = -1) {
    const used = new Set()
    rows.forEach((r, i) => {
      if (i === excludeIdx) return
      if (r.localId) used.add(r.localId)
      if (r.visitanteId) used.add(r.visitanteId)
    })
    if (mode === 'add' && jornadaId) {
      const jornada = currentTorneo?.jornadas.find(j => String(j.id) === String(jornadaId))
      jornada?.partidos.forEach(p => { used.add(p.localId); used.add(p.visitanteId) })
    }
    return used
  }

  function totalUsed() {
    const s = new Set()
    rows.forEach(r => { if (r.localId) s.add(r.localId); if (r.visitanteId) s.add(r.visitanteId) })
    if (mode === 'add' && jornadaId) {
      const j = currentTorneo?.jornadas.find(j => String(j.id) === String(jornadaId))
      j?.partidos.forEach(p => { s.add(p.localId); s.add(p.visitanteId) })
    }
    return s.size
  }

  function updateRow(idx, field, value) {
    setRows(prev => {
      const next = prev.map((r, i) => i === idx ? { ...r, [field]: value } : r)
      if (field === 'localId') {
        const team = getTeamById(value)
        next[idx].estadio = team ? (team.extraStadiums ? team.extraStadiums[0] : team.stadium) : ''
      }
      return next
    })
  }

  function handleSave() {
    const torneo = currentTorneo
    if (!torneo) return
    const num = Number(jornadaNum)

    if (mode === 'create') {
      if (!num || num < 1 || num > 17) { addToast('El número de jornada debe estar entre 1 y 17.', 'error'); return }
      if (torneo.jornadas.length >= 17) { addToast('Máximo 17 jornadas por torneo.', 'error'); return }
      if (torneo.jornadas.some(j => j.numero === num)) { addToast(`Ya existe la Jornada ${num}.`, 'error'); return }
    }

    const validRows = rows.filter(r => r.localId && r.visitanteId)
    if (!validRows.length) { addToast('Agrega al menos un partido con ambos equipos.', 'error'); return }
    if (validRows.length > 9) { addToast('Máximo 9 partidos por jornada.', 'error'); return }

    if (mode === 'add') {
      const j = torneo.jornadas.find(j => String(j.id) === String(jornadaId))
      if (j && j.partidos.length + validRows.length > 9) {
        addToast(`Máximo 9 partidos por jornada (ya tiene ${j.partidos.length}).`, 'error'); return
      }
    }

    let np = torneo._np
    const partidos = validRows.map(r => {
      const team = getTeamById(r.localId)
      const estadio = r.estadio || (team?.extraStadiums ? team.extraStadiums[0] : team?.stadium) || ''
      return { id: np++, localId: r.localId, visitanteId: r.visitanteId, estadio, fecha: r.fecha || '', hora: r.hora || '', golesLocal: null, golesVisitante: null, jugado: false }
    })

    onSave({ mode, jornadaId, num, partidos, newNp: np })
  }

  const jornada = mode === 'add' ? currentTorneo?.jornadas.find(j => String(j.id) === String(jornadaId)) : null
  const canAddRow = rows.length < 9 && totalUsed() < 18

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h3>{mode === 'create' ? 'Nueva Jornada' : `Agregar Partidos — Jornada ${jornada?.numero ?? ''}`}</h3>
        <button className="modal-close" onClick={onClose}><CloseIcon /></button>
      </div>
      <div className="modal-body">
        {mode === 'create' && (
          <div className="form-group" id="jornada-num-group">
            <label className="form-label">Número de Jornada <span className="form-hint">(máx. 17)</span></label>
            <input type="number" className="form-input" min="1" max="17" placeholder="Ej: 1"
              value={jornadaNum} onChange={e => setJornadaNum(e.target.value)} />
          </div>
        )}

        <div className="match-rows-editor">
          <div className="match-rows-header">
            <span className="form-label">Partidos <span className="form-hint">(máx. 9 por jornada)</span></span>
            {canAddRow && (
              <button type="button" className="btn btn-sm btn-secondary" id="btn-add-row"
                onClick={() => setRows(prev => [...prev, EMPTY_ROW()])}>
                {ICO_PLUS} Partido
              </button>
            )}
          </div>

          <div id="match-rows-list">
            {rows.length === 0 && (
              <div className="no-rows-msg">Haz clic en "+ Partido" para agregar un partido.</div>
            )}
            {rows.map((row, i) => {
              const globalUsed = getGlobalUsed(i)
              const excL = new Set([...globalUsed, row.visitanteId].filter(Boolean))
              const excV = new Set([...globalUsed, row.localId].filter(Boolean))
              const localTeams = LIGA_MX_TEAMS_ALPHA.filter(t => !excL.has(t.id) || t.id === row.localId)
              const visitTeams = LIGA_MX_TEAMS_ALPHA.filter(t => !excV.has(t.id) || t.id === row.visitanteId)
              const localTeam = row.localId ? getTeamById(row.localId) : null

              return (
                <div key={i} className="match-row">
                  <div className="match-row-teams">
                    <select className="form-input form-input-sm" value={row.localId}
                      onChange={e => updateRow(i, 'localId', e.target.value)}>
                      <option value="">Local...</option>
                      {localTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <span className="match-row-vs">vs</span>
                    <select className="form-input form-input-sm" value={row.visitanteId}
                      onChange={e => updateRow(i, 'visitanteId', e.target.value)}>
                      <option value="">Visitante...</option>
                      {visitTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div className="match-row-stadium">
                    {ICO_STADIUM}
                    {!localTeam ? (
                      <input type="text" className="form-input form-input-sm" placeholder="Selecciona equipo local primero"
                        disabled style={{ flex: 1, opacity: .5 }} />
                    ) : localTeam.extraStadiums ? (
                      <select className="form-input form-input-sm" style={{ flex: 1 }}
                        value={row.estadio || localTeam.extraStadiums[0]}
                        onChange={e => updateRow(i, 'estadio', e.target.value)}>
                        {localTeam.extraStadiums.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <input type="text" className="form-input form-input-sm" value={localTeam.stadium}
                        readOnly style={{ flex: 1, color: 'var(--text-md)' }} />
                    )}
                  </div>

                  <div className="match-row-datetime">
                    <div className="match-row-datetime-field">
                      {ICO_CALENDAR}
                      <input type="date" className="form-input form-input-sm" style={{ flex: 1 }}
                        value={row.fecha} onChange={e => updateRow(i, 'fecha', e.target.value)} />
                    </div>
                    <div className="match-row-datetime-field">
                      {ICO_CLOCK}
                      <input type="time" className="form-input form-input-sm" style={{ flex: 1 }}
                        value={row.hora} onChange={e => updateRow(i, 'hora', e.target.value)} />
                    </div>
                    <button type="button" className="match-row-del"
                      onClick={() => setRows(prev => prev.filter((_, j) => j !== i))}>
                      {ICO_TRASH}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
      </div>
    </Modal>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
}
