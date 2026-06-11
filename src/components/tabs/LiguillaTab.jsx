import { useState } from 'react'
import LogoImg from '../ui/LogoImg'
import LiguillaModal from '../modals/LiguillaModal'
import { getTeamById } from '../../data/teams'
import { calculateStandings } from '../../utils/standings'
import { computeWinner, getAgg, updateBracketProgression, initialLiguilla } from '../../utils/liguilla'
import { fmtDate } from '../../utils/datetime'
import { useApp } from '../../context/AppContext'

const ICO_STADIUM  = <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
const ICO_WARNING  = <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
const ICO_TROPHY   = <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>

function MatchCard({ match, onEdit }) {
  if (!match.homeId || !match.awayId) {
    return <div className="b-match tbd"><div className="b-match-tbd">Por definir</div></div>
  }
  const home = getTeamById(match.homeId)
  const away = getTeamById(match.awayId)
  const winner = match.winnerId
  const agg    = getAgg(match)

  function TeamRow({ team, isHome }) {
    const [err, setErr] = useState(false)
    const isWinner = winner === team.id
    const isLoser  = winner && winner !== team.id
    const sIda     = isHome ? match.idaHome    : match.idaAway
    const sVuelta  = isHome ? match.vueltaAway : match.vueltaHome
    const aggVal   = isHome ? agg.h : agg.a
    return (
      <div className={`b-match-row ${isWinner ? 'winner' : isLoser ? 'loser' : ''}`}>
        <div className="b-match-team">
          {!err
            ? <img src={team.logo} alt={team.name} className="team-logo-sm" onError={() => setErr(true)} />
            : <span className="team-badge" style={{ background: team.color, color: team.text, display: 'flex', width: 20, height: 20, minWidth: 20, borderRadius: 4, fontSize: '.5rem' }}>{team.short}</span>}
          <span className="b-match-team-name">{team.name}</span>
        </div>
        <div className="b-match-scores">
          <div className="b-score-block"><span className="b-score-lbl">Ida</span><span className="b-score-val">{sIda != null ? sIda : '–'}</span></div>
          <span className="b-score-sep">·</span>
          <div className="b-score-block"><span className="b-score-lbl">Vuelta</span><span className="b-score-val">{sVuelta != null ? sVuelta : '–'}</span></div>
          {agg.done && <>
            <span className="b-score-sep">·</span>
            <div className="b-score-block">
              <span className="b-score-lbl">Agg</span>
              <span className="b-score-val" style={{ color: isWinner ? 'var(--green)' : '' }}>{aggVal}</span>
            </div>
          </>}
        </div>
      </div>
    )
  }

  const metaIda    = [match.idaEstadio, match.idaFecha ? fmtDate(match.idaFecha, match.idaHora) : ''].filter(Boolean)
  const metaVuelta = [match.vueltaEstadio, match.vueltaFecha ? fmtDate(match.vueltaFecha, match.vueltaHora) : ''].filter(Boolean)

  return (
    <div className="b-match" title="Click para editar" onClick={onEdit}>
      <TeamRow team={home} isHome />
      <TeamRow team={away} isHome={false} />
      {agg.done && (
        <div className="b-agg">
          Global: <span>{agg.h}–{agg.a}</span>
          {winner && <> · Avanza: <span>{getTeamById(winner)?.name}</span></>}
        </div>
      )}
      {(metaIda.length > 0 || metaVuelta.length > 0) && (
        <div className="b-match-meta">
          {metaIda.length    > 0 && <span className="b-meta-item">{ICO_STADIUM} <em>Ida:</em> {metaIda.join(' · ')}</span>}
          {metaVuelta.length > 0 && <span className="b-meta-item">{ICO_STADIUM} <em>Vuelta:</em> {metaVuelta.join(' · ')}</span>}
        </div>
      )}
    </div>
  )
}

export default function LiguillaTab({ isActive }) {
  const { currentTorneo, updateCurrentTorneo, confirm, addToast } = useApp()
  const [ligModal, setLigModal] = useState(null) // null | { round, matchId }

  if (!isActive || !currentTorneo) return null

  const lig = currentTorneo.liguilla
  if (!lig) return null

  function handleInit() {
    const standings = calculateStandings(currentTorneo.jornadas || [])
    const top8 = standings.slice(0, 8)
    const meta = { idaHome: null, idaAway: null, vueltaHome: null, vueltaAway: null, winnerId: null, manualWinner: false, idaEstadio: '', idaFecha: '', idaHora: '', vueltaEstadio: '', vueltaFecha: '', vueltaHora: '' }
    const newLig = {
      ...initialLiguilla(),
      active: true,
      cuartos: [
        { id: 'q1', label: '1° vs 8°', seed1: 1, seed2: 8, homeId: top8[0]?.team.id || null, awayId: top8[7]?.team.id || null, ...meta },
        { id: 'q2', label: '2° vs 7°', seed1: 2, seed2: 7, homeId: top8[1]?.team.id || null, awayId: top8[6]?.team.id || null, ...meta },
        { id: 'q3', label: '3° vs 6°', seed1: 3, seed2: 6, homeId: top8[2]?.team.id || null, awayId: top8[5]?.team.id || null, ...meta },
        { id: 'q4', label: '4° vs 5°', seed1: 4, seed2: 5, homeId: top8[3]?.team.id || null, awayId: top8[4]?.team.id || null, ...meta },
      ],
    }
    updateCurrentTorneo({ ...currentTorneo, liguilla: newLig })
    addToast('Bracket de Liguilla generado.')
  }

  async function handleReset() {
    if (!await confirm('¿Reiniciar el bracket? Se perderán todos los resultados de Liguilla.', 'Reiniciar Bracket', 'Reiniciar', 'btn-danger')) return
    updateCurrentTorneo({ ...currentTorneo, liguilla: initialLiguilla() })
    addToast('Bracket reiniciado.', 'info')
  }

  function handleLigSave(round, matchId, update) {
    const standings = calculateStandings(currentTorneo.jornadas || [])
    let newLig = JSON.parse(JSON.stringify(lig))

    let match
    if (round === 'cuartos')  match = newLig.cuartos.find(m => m.id === matchId)
    else if (round === 'semis-0') match = newLig.semis[0]
    else if (round === 'semis-1') match = newLig.semis[1]
    else                          match = newLig.final
    if (!match) return

    Object.assign(match, update)

    // Update progression
    const updated = updateBracketProgression({ ...currentTorneo, liguilla: newLig }, standings)
    updateCurrentTorneo(updated)

    const w = computeWinner(match)
    addToast(w ? `${getTeamById(w)?.name} avanza a la siguiente ronda.` : 'Resultado guardado.')
    setLigModal(null)
  }

  const allQ = lig.cuartos?.every(m => m.winnerId)
  const allS = lig.semis?.every(m => m.winnerId)
  const champ = lig.champion ? getTeamById(lig.champion) : null

  if (!lig.active) {
    return (
      <div className="tab-panel active" id="tab-liguilla">
        <div className="section-header">
          <h2 className="section-title">Liguilla</h2>
          <div className="bracket-actions">
            <button className="btn btn-primary" id="btn-init-liguilla" onClick={handleInit}>
              {ICO_TROPHY} Generar Bracket
            </button>
          </div>
        </div>
        <div id="liguilla-container">
          <div className="card" style={{ padding: 0 }}>
            <div className="liguilla-empty">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏆</div>
              <p>El bracket se genera automáticamente desde los primeros <strong>8 equipos</strong> de la tabla.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tab-panel active" id="tab-liguilla">
      <div className="section-header">
        <h2 className="section-title">Liguilla</h2>
        <div className="bracket-actions">
          {(!allQ || !allS) && (
            <span className="bracket-warning">
              {ICO_WARNING}
              <span>
                {!allQ ? 'Completa los cuartos para definir las semifinales'
                  : 'Completa las semifinales para definir la final'}
              </span>
            </span>
          )}
          <button className="btn btn-sm btn-secondary" id="btn-reset-liguilla" onClick={handleReset}>
            Reiniciar Bracket
          </button>
        </div>
      </div>

      <div id="liguilla-container">
        <div className="bracket-card">
          <div className="liguilla-bracket-scroll">
            <div className="bracket-grid">
              <div className="bracket-col">
                <div className="bracket-col-header">Cuartos de Final</div>
                <div className="bracket-col-body">
                  {lig.cuartos.map(m => (
                    <MatchCard key={m.id} match={m} onEdit={() => setLigModal({ round: 'cuartos', matchId: m.id })} />
                  ))}
                </div>
              </div>
              <div className="bracket-col">
                <div className="bracket-col-header">Semifinal</div>
                <div className="bracket-col-body" style={{ justifyContent: 'space-around', gap: 24 }}>
                  <MatchCard match={lig.semis[0]} onEdit={() => setLigModal({ round: 'semis-0', matchId: lig.semis[0].id })} />
                  <MatchCard match={lig.semis[1]} onEdit={() => setLigModal({ round: 'semis-1', matchId: lig.semis[1].id })} />
                </div>
              </div>
              <div className="bracket-col">
                <div className="bracket-col-header">Final</div>
                <div className="bracket-col-body" style={{ justifyContent: 'center' }}>
                  <MatchCard match={lig.final} onEdit={() => setLigModal({ round: 'final', matchId: lig.final.id })} />
                </div>
              </div>
              <div className="bracket-col">
                <div className="bracket-col-header gold">🏆 Campeón</div>
                <div className="bracket-col-body" style={{ justifyContent: 'center' }}>
                  <div className="champion-card">
                    {champ ? (
                      <>
                        <div className="champion-trophy">🏆</div>
                        <span className="champion-label">Campeón</span>
                        <div className="champion-team">
                          <LogoImg team={champ} size="lg" />
                          <span className="champion-name">{champ.name}</span>
                        </div>
                      </>
                    ) : (
                      <div className="champion-empty">
                        <div className="champion-empty-icon">🏆</div>
                        <span className="champion-empty-text">Por definir</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ligModal && (
        <LiguillaModal
          isOpen
          round={ligModal.round}
          matchId={ligModal.matchId}
          onClose={() => setLigModal(null)}
          onSaved={handleLigSave}
        />
      )}
    </div>
  )
}
