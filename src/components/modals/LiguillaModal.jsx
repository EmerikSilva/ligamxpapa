import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import { getTeamById } from '../../data/teams'
import { getAgg, computeWinner } from '../../utils/liguilla'
import { fmtDate } from '../../utils/datetime'
import { useApp } from '../../context/AppContext'

const ICO_STADIUM  = <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
const ICO_CALENDAR = <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
const ICO_CLOCK    = <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>

function TeamBlock({ team, role }) {
  const [err, setErr] = useState(false)
  return (
    <div className="lig-leg-team">
      {!err
        ? <img src={team.logo} alt={team.name} className="team-logo-md" onError={() => setErr(true)} />
        : <span className="team-badge" style={{ background: team.color, color: team.text, display: 'flex', width: 38, height: 38, minWidth: 38, borderRadius: 10, fontSize: '.6rem' }}>{team.short}</span>}
      <span className="lig-leg-team-name">{team.name}</span>
      <span className="lig-leg-team-role">{role}</span>
    </div>
  )
}

export default function LiguillaModal({ isOpen, round, matchId, onClose, onSaved }) {
  const { currentTorneo, addToast } = useApp()

  const [idaAway, setIdaAway]   = useState('')
  const [idaHome, setIdaHome]   = useState('')
  const [vueltaAway, setVueltaAway] = useState('')
  const [vueltaHome, setVueltaHome] = useState('')
  const [idaEstadio, setIdaEstadio]       = useState('')
  const [idaFecha, setIdaFecha]           = useState('')
  const [idaHora, setIdaHora]             = useState('')
  const [vueltaEstadio, setVueltaEstadio] = useState('')
  const [vueltaFecha, setVueltaFecha]     = useState('')
  const [vueltaHora, setVueltaHora]       = useState('')
  const [manualWinner, setManualWinner]   = useState('')

  function getMatch() {
    const lig = currentTorneo?.liguilla
    if (!lig) return null
    if (round === 'cuartos')  return lig.cuartos.find(m => m.id === matchId) || null
    if (round === 'semis-0')  return lig.semis[0] || null
    if (round === 'semis-1')  return lig.semis[1] || null
    if (round === 'final')    return lig.final    || null
    return null
  }

  const match = getMatch()
  const home  = match?.homeId ? getTeamById(match.homeId) : null
  const away  = match?.awayId ? getTeamById(match.awayId) : null

  useEffect(() => {
    if (!match || !isOpen) return
    setIdaAway(match.idaAway   != null ? String(match.idaAway)   : '')
    setIdaHome(match.idaHome   != null ? String(match.idaHome)   : '')
    setVueltaAway(match.vueltaAway != null ? String(match.vueltaAway) : '')
    setVueltaHome(match.vueltaHome != null ? String(match.vueltaHome) : '')
    setIdaEstadio(match.idaEstadio       || (away?.extraStadiums ? away.extraStadiums[0] : away?.stadium || ''))
    setIdaFecha(match.idaFecha     || '')
    setIdaHora(match.idaHora       || '')
    setVueltaEstadio(match.vueltaEstadio || (home?.extraStadiums ? home.extraStadiums[0] : home?.stadium || ''))
    setVueltaFecha(match.vueltaFecha     || '')
    setVueltaHora(match.vueltaHora       || '')
    setManualWinner(match.winnerId || '')
  }, [match, isOpen])

  const liveAgg = (() => {
    if (idaHome !== '' && idaAway !== '' && vueltaAway !== '' && vueltaHome !== '') {
      return { h: Number(idaHome) + Number(vueltaAway), a: Number(idaAway) + Number(vueltaHome), done: true }
    }
    return { done: false }
  })()

  function handleSave() {
    onSaved(round, matchId, {
      idaHome:    idaHome    !== '' ? Number(idaHome)    : null,
      idaAway:    idaAway    !== '' ? Number(idaAway)    : null,
      vueltaHome: vueltaHome !== '' ? Number(vueltaHome) : null,
      vueltaAway: vueltaAway !== '' ? Number(vueltaAway) : null,
      idaEstadio, idaFecha, idaHora,
      vueltaEstadio, vueltaFecha, vueltaHora,
      manualWinner: !!manualWinner,
      winnerId: manualWinner || null,
    })
  }

  function handleClear() {
    onSaved(round, matchId, {
      idaHome: null, idaAway: null, vueltaHome: null, vueltaAway: null,
      idaEstadio: '', idaFecha: '', idaHora: '',
      vueltaEstadio: '', vueltaFecha: '', vueltaHora: '',
      manualWinner: false, winnerId: null,
    })
    addToast('Resultado limpiado.', 'info')
    onClose()
  }

  const title = round === 'cuartos' ? `Cuartos — ${match?.label || ''}` :
    round === 'semis-0' ? 'Semifinal 1' : round === 'semis-1' ? 'Semifinal 2' : 'Gran Final'

  if (!home || !away) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="modal-close" onClick={onClose}><CloseIcon /></button>
      </div>
      <div className="modal-body">
        <div id="lig-score-editor">
          <div className="lig-legs">
            {/* IDA — away es local aquí */}
            <div className="lig-leg">
              <div className="lig-leg-title">
                <span className="lig-leg-badge ida">Ida</span>
                <span className="lig-leg-role">{away.name} local · {home.name} visitante</span>
              </div>
              <div className="lig-leg-match">
                <TeamBlock team={away} role="Local" />
                <div className="lig-leg-score">
                  <input type="number" className="lig-score-in" min="0" max="99" placeholder="0"
                    value={idaAway} onChange={e => setIdaAway(e.target.value)} />
                  <span className="lig-score-sep">:</span>
                  <input type="number" className="lig-score-in" min="0" max="99" placeholder="0"
                    value={idaHome} onChange={e => setIdaHome(e.target.value)} />
                </div>
                <TeamBlock team={home} role="Visitante" />
              </div>
              <div className="lig-leg-meta">
                <div className="lig-meta-field lig-meta-estadio">
                  {ICO_STADIUM}
                  <input type="text" className="form-input form-input-sm" placeholder="Estadio"
                    value={idaEstadio} onChange={e => setIdaEstadio(e.target.value)} />
                </div>
                <div className="lig-meta-field">
                  {ICO_CALENDAR}
                  <input type="date" className="form-input form-input-sm"
                    value={idaFecha} onChange={e => setIdaFecha(e.target.value)} />
                </div>
                <div className="lig-meta-field">
                  {ICO_CLOCK}
                  <input type="time" className="form-input form-input-sm"
                    value={idaHora} onChange={e => setIdaHora(e.target.value)} />
                </div>
              </div>
            </div>

            {/* VUELTA — home es local aquí */}
            <div className="lig-leg">
              <div className="lig-leg-title">
                <span className="lig-leg-badge vuelta">Vuelta</span>
                <span className="lig-leg-role">{home.name} local · {away.name} visitante</span>
              </div>
              <div className="lig-leg-match">
                <TeamBlock team={home} role="Local" />
                <div className="lig-leg-score">
                  <input type="number" className="lig-score-in" min="0" max="99" placeholder="0"
                    value={vueltaAway} onChange={e => setVueltaAway(e.target.value)} />
                  <span className="lig-score-sep">:</span>
                  <input type="number" className="lig-score-in" min="0" max="99" placeholder="0"
                    value={vueltaHome} onChange={e => setVueltaHome(e.target.value)} />
                </div>
                <TeamBlock team={away} role="Visitante" />
              </div>
              <div className="lig-leg-meta">
                <div className="lig-meta-field lig-meta-estadio">
                  {ICO_STADIUM}
                  <input type="text" className="form-input form-input-sm" placeholder="Estadio"
                    value={vueltaEstadio} onChange={e => setVueltaEstadio(e.target.value)} />
                </div>
                <div className="lig-meta-field">
                  {ICO_CALENDAR}
                  <input type="date" className="form-input form-input-sm"
                    value={vueltaFecha} onChange={e => setVueltaFecha(e.target.value)} />
                </div>
                <div className="lig-meta-field">
                  {ICO_CLOCK}
                  <input type="time" className="form-input form-input-sm"
                    value={vueltaHora} onChange={e => setVueltaHora(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Global en vivo */}
          <div className="agg-live-row">
            <span className="agg-team-name">{home.name}</span>
            <div className="agg-display" style={{ opacity: liveAgg.done ? 1 : .35 }}>
              <div className="agg-display-title">Global</div>
              <div className="agg-display-score">
                {liveAgg.done ? `${liveAgg.h} – ${liveAgg.a}` : '– – –'}
              </div>
            </div>
            <span className="agg-team-name right">{away.name}</span>
          </div>

          <div className="winner-select-group form-group" style={{ marginTop: 10 }}>
            <div className="winner-select-label">
              ⚡ Ganador manual (en caso de empate global el mejor sembrado avanza automáticamente)
            </div>
            <select className="form-input" value={manualWinner} onChange={e => setManualWinner(e.target.value)}>
              <option value="">— Automático —</option>
              <option value={home.id}>{home.name}</option>
              <option value={away.id}>{away.name}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="modal-footer modal-footer-split">
        <button className="btn btn-danger-ghost btn-sm" onClick={handleClear}>Limpiar</button>
        <div className="modal-footer-right">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </Modal>
  )
}

function CloseIcon() {
  return <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
}
