import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import { getTeamById } from '../../data/teams'
import { fmtDate, sortKey } from '../../utils/datetime'
import { useApp } from '../../context/AppContext'

const ICO_STADIUM = <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
const ICO_CALENDAR = <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
const ICO_CLOCK = <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>

function TeamBlock({ team }) {
  const [err, setErr] = useState(false)
  return (
    <div className="score-team-block">
      {!err
        ? <img src={team.logo} alt={team.name} style={{ width: 52, height: 52, objectFit: 'contain' }} onError={() => setErr(true)} />
        : <span className="score-team-badge-lg" style={{ background: team.color, color: team.text, display: 'flex' }}>{team.short}</span>}
      <span className="score-team-name-sm">{team.name}</span>
    </div>
  )
}

export default function ResultadoModal({ isOpen, jornadaId, partidoId, onClose, onSaved }) {
  const { currentTorneo, addToast, confirm } = useApp()

  const [scoreL, setScoreL] = useState('')
  const [scoreV, setScoreV] = useState('')
  const [jugado, setJugado] = useState(false)
  const [estadio, setEstadio] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')

  const jornada = currentTorneo?.jornadas.find(j => String(j.id) === String(jornadaId))
  const partido  = jornada?.partidos.find(p => String(p.id) === String(partidoId))
  const local    = partido ? getTeamById(partido.localId)     : null
  const visit    = partido ? getTeamById(partido.visitanteId) : null

  useEffect(() => {
    if (!partido || !isOpen) return
    setScoreL(partido.golesLocal    != null ? String(partido.golesLocal)    : '')
    setScoreV(partido.golesVisitante != null ? String(partido.golesVisitante) : '')
    setJugado(partido.jugado || false)
    setEstadio(partido.estadio || local?.stadium || '')
    setFecha(partido.fecha || '')
    setHora(partido.hora || '')
  }, [partido, isOpen])

  useEffect(() => {
    if (scoreL !== '' && scoreV !== '') setJugado(true)
  }, [scoreL, scoreV])

  function findNext() {
    if (!jornada) return null
    const sorted = [...jornada.partidos].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
    const idx = sorted.findIndex(p => String(p.id) === String(partidoId))
    for (let i = idx + 1; i < sorted.length; i++) if (!sorted[i].jugado) return sorted[i]
    for (let i = 0; i < idx; i++) if (!sorted[i].jugado) return sorted[i]
    return null
  }

  async function handleSave() {
    if (jugado && (scoreL === '' || scoreV === '')) {
      addToast('Ingresa el marcador para marcar como jugado.', 'error'); return
    }
    const update = {
      jugado,
      golesLocal:      jugado && scoreL !== '' ? Number(scoreL) : null,
      golesVisitante:  jugado && scoreV !== '' ? Number(scoreV) : null,
      estadio: estadio || '',
      fecha:   fecha   || '',
      hora:    hora    || '',
    }
    onSaved(jornadaId, partidoId, update)
    onClose()

    const nL = local?.name, nV = visit?.name
    addToast(jugado ? `${nL} ${update.golesLocal} – ${update.golesVisitante} ${nV}` : 'Datos guardados.')

    const next = findNext()
    if (next) {
      const nLn = getTeamById(next.localId)?.name, nVn = getTeamById(next.visitanteId)?.name
      const ok = await confirm(`${nLn} vs ${nVn}`, '¿Capturar el siguiente partido?', 'Sí, capturar', 'btn-primary')
      if (ok) onSaved(jornadaId, next.id, null, true)
    }
  }

  function handleClear() {
    onSaved(jornadaId, partidoId, { jugado: false, golesLocal: null, golesVisitante: null })
    onClose()
    addToast('Resultado eliminado.', 'info')
  }

  if (!local || !visit || !partido) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="modal-sm">
      <div className="modal-header">
        <h3>Editar Resultado</h3>
        <button className="modal-close" onClick={onClose}><CloseIcon /></button>
      </div>
      <div className="modal-body">
        <div id="score-editor">
          <div className="score-editor-inner">
            <TeamBlock team={local} />
            <div className="score-input-wrap">
              <input type="number" className="score-input" id="score-local" min="0" max="99" placeholder="0"
                value={scoreL} onChange={e => setScoreL(e.target.value)} />
              <span className="score-sep-lg">:</span>
              <input type="number" className="score-input" id="score-visitante" min="0" max="99" placeholder="0"
                value={scoreV} onChange={e => setScoreV(e.target.value)} />
            </div>
            <TeamBlock team={visit} />
          </div>

          <div className="res-details">
            <div className="res-detail-row">
              {ICO_STADIUM}
              <span className="res-detail-label">Estadio</span>
              {local.extraStadiums ? (
                <select className="form-input form-input-sm" value={estadio} onChange={e => setEstadio(e.target.value)}>
                  {local.extraStadiums.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <input type="text" className="form-input form-input-sm" value={estadio}
                  readOnly style={{ color: 'var(--text-md)' }} />
              )}
            </div>
            <div className="res-detail-row">
              {ICO_CALENDAR}
              <span className="res-detail-label">Fecha</span>
              <input type="date" className="form-input form-input-sm"
                value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            <div className="res-detail-row">
              {ICO_CLOCK}
              <span className="res-detail-label">Hora</span>
              <input type="time" className="form-input form-input-sm"
                value={hora} onChange={e => setHora(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="form-toggle">
            <input type="checkbox" checked={jugado} onChange={e => setJugado(e.target.checked)} />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
            <span>Partido jugado</span>
          </label>
        </div>
      </div>

      <div className="modal-footer modal-footer-split">
        <button className="btn btn-danger-ghost btn-sm" onClick={handleClear}>
          <CloseIcon /> Limpiar
        </button>
        <div className="modal-footer-right">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
        </div>
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
