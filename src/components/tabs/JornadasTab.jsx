import { useState } from 'react'
import LogoImg from '../ui/LogoImg'
import JornadaModal from '../modals/JornadaModal'
import ResultadoModal from '../modals/ResultadoModal'
import { getTeamById } from '../../data/teams'
import { sortKey, fmtDate } from '../../utils/datetime'
import { useApp } from '../../context/AppContext'

const ICO_STADIUM  = <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
const ICO_CALENDAR = <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
const ICO_TRASH    = <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 7a1 1 0 012 0v4a1 1 0 11-2 0V9zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" /></svg>
const ICO_EDIT     = <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
const ICO_GOAL     = <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 11, height: 11 }}><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M10 6l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3z" fill="currentColor" /></svg>
const ICO_PLUS     = <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
const ICO_CHEVRON  = <svg className="chevron" viewBox="0 0 20 20" fill="currentColor" style={{ pointerEvents: 'none' }}><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>

export default function JornadasTab({ isActive }) {
  const { currentTorneo, updateCurrentTorneo, addToast, confirm } = useApp()

  const [openIds, setOpenIds] = useState(new Set())
  const [jornadaModal, setJornadaModal] = useState(null) // null | { mode, jornadaId }
  const [resultadoModal, setResultadoModal] = useState(null) // null | { jornadaId, partidoId }

  if (!isActive) return null

  const jornadas = [...(currentTorneo?.jornadas || [])].sort((a, b) => a.numero - b.numero)

  function toggleOpen(id) {
    setOpenIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleJornadaSave({ mode, jornadaId, num, partidos, newNp }) {
    const torneo = currentTorneo
    if (!torneo) return
    let newJornadas, newNj = torneo._nj

    if (mode === 'create') {
      newJornadas = [...torneo.jornadas, { id: torneo._nj, numero: num, partidos }]
      newNj = torneo._nj + 1
      addToast(`Jornada ${num} creada con ${partidos.length} partido${partidos.length > 1 ? 's' : ''}.`)
    } else {
      newJornadas = torneo.jornadas.map(j => {
        if (String(j.id) !== String(jornadaId)) return j
        return { ...j, partidos: [...j.partidos, ...partidos] }
      })
      addToast(`${partidos.length} partido${partidos.length > 1 ? 's agregados' : ' agregado'}.`)
    }

    updateCurrentTorneo({ ...torneo, jornadas: newJornadas, _nj: newNj, _np: newNp })
    setJornadaModal(null)
  }

  function handleResultadoSaved(jornadaId, partidoId, update, openNext = false) {
    if (!update) return
    const torneo = currentTorneo
    if (!torneo) return
    const newJornadas = torneo.jornadas.map(j => {
      if (String(j.id) !== String(jornadaId)) return j
      return { ...j, partidos: j.partidos.map(p => String(p.id) === String(partidoId) ? { ...p, ...update } : p) }
    })
    updateCurrentTorneo({ ...torneo, jornadas: newJornadas })
    if (openNext) setResultadoModal({ jornadaId, partidoId })
  }

  async function handleDeleteJornada(jid) {
    if (!await confirm('¿Eliminar esta jornada y todos sus partidos?', 'Eliminar Jornada')) return
    updateCurrentTorneo({ ...currentTorneo, jornadas: currentTorneo.jornadas.filter(j => String(j.id) !== String(jid)) })
    addToast('Jornada eliminada.', 'info')
  }

  async function handleDeletePartido(jid, pid) {
    if (!await confirm('¿Eliminar este partido? Se recalcularán las estadísticas.')) return
    const newJornadas = currentTorneo.jornadas.map(j => {
      if (String(j.id) !== String(jid)) return j
      return { ...j, partidos: j.partidos.filter(p => String(p.id) !== String(pid)) }
    })
    updateCurrentTorneo({ ...currentTorneo, jornadas: newJornadas })
    addToast('Partido eliminado.', 'info')
  }

  return (
    <div className="tab-panel active" id="tab-jornadas">
      <div className="section-header">
        <h2 className="section-title">Jornadas</h2>
        <button className="btn btn-primary" id="btn-nueva-jornada"
          onClick={() => setJornadaModal({ mode: 'create', jornadaId: null })}>
          {ICO_PLUS} Nueva Jornada
        </button>
      </div>

      <div id="jornadas-container">
        {jornadas.map(jornada => {
          const total      = jornada.partidos.length
          const jugados    = jornada.partidos.filter(p => p.jugado).length
          const pct        = total > 0 ? Math.round(jugados / total * 100) : 0
          const allPlayed  = total > 0 && jugados === total
          const totalGoals = jornada.partidos.filter(p => p.jugado && p.golesLocal != null)
            .reduce((s, p) => s + Number(p.golesLocal) + Number(p.golesVisitante), 0)
          const usedTeams  = new Set()
          jornada.partidos.forEach(p => { usedTeams.add(p.localId); usedTeams.add(p.visitanteId) })
          const canAdd     = usedTeams.size < 18
          const isOpen     = openIds.has(String(jornada.id))
          const sorted     = [...jornada.partidos].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))

          return (
            <div key={jornada.id} className={`jornada-card${isOpen ? ' open' : ''}`} data-jornada-id={jornada.id}>
              <div className="jornada-header" onClick={e => {
                if (e.target.closest('[data-add]') || e.target.closest('[data-del]')) return
                toggleOpen(String(jornada.id))
              }}>
                <div className="jornada-header-left">
                  <div className="jornada-num-badge">J{jornada.numero}</div>
                  <div className="jornada-info">
                    <div className="jornada-title">Jornada {jornada.numero}</div>
                    <div className="jornada-meta">
                      <span className="jornada-count">{total} partido{total !== 1 ? 's' : ''}</span>
                      <div className="jornada-progress">
                        <div className="progress-pill"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                        <span className="progress-label">{jugados}/{total}</span>
                      </div>
                      {jugados > 0 && <span className="jornada-goals">{ICO_GOAL} {totalGoals} gol{totalGoals !== 1 ? 'es' : ''}</span>}
                    </div>
                  </div>
                </div>
                <div className="jornada-header-right">
                  {canAdd && !allPlayed && (
                    <button className="btn btn-sm btn-secondary" data-add="1" style={{ zIndex: 1 }}
                      onClick={e => { e.stopPropagation(); setJornadaModal({ mode: 'add', jornadaId: String(jornada.id) }) }}>
                      {ICO_PLUS} Partido
                    </button>
                  )}
                  {!allPlayed && (
                    <button className="btn-icon danger" data-del="1" style={{ zIndex: 1 }} title="Eliminar jornada"
                      onClick={e => { e.stopPropagation(); handleDeleteJornada(String(jornada.id)) }}>
                      {ICO_TRASH}
                    </button>
                  )}
                  {ICO_CHEVRON}
                </div>
              </div>

              <div className="jornada-body">
                <div className="matches-grid">
                  {sorted.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-sm)', fontSize: '.8rem', padding: 16 }}>
                      Sin partidos. Agrega el primero.
                    </p>
                  )}
                  {sorted.map(p => {
                    const loc = getTeamById(p.localId)
                    const vis = getTeamById(p.visitanteId)
                    if (!loc || !vis) return null
                    const played   = p.jugado
                    const scoreL   = played && p.golesLocal    != null ? p.golesLocal    : '–'
                    const scoreV   = played && p.golesVisitante != null ? p.golesVisitante : '–'
                    const lcrgb    = hexRgb(loc.color)
                    const vcrgb    = hexRgb(vis.color)
                    const metaParts = []
                    if (p.estadio) metaParts.push(<span key="s" className="match-meta-item">{ICO_STADIUM} {p.estadio}</span>)
                    if (p.fecha)   metaParts.push(<span key="d" className="match-meta-item">{ICO_CALENDAR} {fmtDate(p.fecha, p.hora)}</span>)

                    return (
                      <div key={p.id}
                        className={`match-card ${played ? 'played' : 'pending'}`}
                        style={{ '--lcrgb': lcrgb, '--vcrgb': vcrgb }}
                        onClick={() => setResultadoModal({ jornadaId: String(jornada.id), partidoId: String(p.id) })}
                      >
                        <div className="match-team">
                          <LogoImg team={loc} size="sm" />
                          <span className="match-team-name">{loc.name}</span>
                        </div>
                        <div className="match-score-center">
                          <div className="match-score">
                            <span className="score-num">{scoreL}</span>
                            <span className="score-sep">:</span>
                            <span className="score-num">{scoreV}</span>
                          </div>
                          <span className={`match-status ${played ? 'played' : 'pending'}`}>
                            {played ? 'Jugado' : 'Pendiente'}
                          </span>
                        </div>
                        <div className="match-team right">
                          <span className="match-team-name">{vis.name}</span>
                          <LogoImg team={vis} size="sm" />
                        </div>
                        <div className="match-card-actions" onClick={e => e.stopPropagation()}>
                          <button className="btn-icon" title="Editar resultado"
                            onClick={e => { e.stopPropagation(); setResultadoModal({ jornadaId: String(jornada.id), partidoId: String(p.id) }) }}>
                            {ICO_EDIT}
                          </button>
                          {!played && (
                            <button className="btn-icon danger" title="Eliminar partido"
                              onClick={e => { e.stopPropagation(); handleDeletePartido(String(jornada.id), String(p.id)) }}>
                              {ICO_TRASH}
                            </button>
                          )}
                        </div>
                        {metaParts.length > 0 && <div className="match-meta">{metaParts}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {jornadas.length === 0 && (
        <div className="empty-state visible" id="empty-jornadas">
          <div className="empty-icon">📅</div>
          <p className="empty-title">Sin jornadas registradas</p>
          <p className="empty-sub">Crea la primera jornada para comenzar a registrar los partidos.</p>
          <button className="btn btn-primary"
            onClick={() => setJornadaModal({ mode: 'create', jornadaId: null })}>
            {ICO_PLUS} Crear primera jornada
          </button>
        </div>
      )}

      <JornadaModal
        isOpen={!!jornadaModal}
        mode={jornadaModal?.mode || 'create'}
        jornadaId={jornadaModal?.jornadaId}
        onClose={() => setJornadaModal(null)}
        onSave={handleJornadaSave}
      />

      {resultadoModal && (
        <ResultadoModal
          isOpen
          jornadaId={resultadoModal.jornadaId}
          partidoId={resultadoModal.partidoId}
          onClose={() => setResultadoModal(null)}
          onSaved={(jid, pid, update, openNext) => {
            handleResultadoSaved(jid, pid, update, false)
            if (openNext) setResultadoModal({ jornadaId: jid, partidoId: pid })
          }}
        />
      )}
    </div>
  )
}

function hexRgb(hex) {
  const h = hex.replace('#', '')
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`
}
