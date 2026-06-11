export function initialLiguilla() {
  const meta = { idaEstadio: '', idaFecha: '', idaHora: '', vueltaEstadio: '', vueltaFecha: '', vueltaHora: '' }
  const base = { idaHome: null, idaAway: null, vueltaHome: null, vueltaAway: null, winnerId: null, manualWinner: false, ...meta }
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
    final: { id: 'f1', homeId: null, awayId: null, ...base },
    champion: null,
  }
}

export function ensureLiguillaFields(torneo) {
  if (!torneo.liguilla) {
    return { ...torneo, liguilla: initialLiguilla() }
  }
  const lig = torneo.liguilla
  const addMeta = m => {
    if (!('idaEstadio' in m)) {
      return { ...m, idaEstadio: '', idaFecha: '', idaHora: '', vueltaEstadio: '', vueltaFecha: '', vueltaHora: '' }
    }
    return m
  }
  return {
    ...torneo,
    liguilla: {
      ...lig,
      cuartos: (lig.cuartos || []).map(addMeta),
      semis:   (lig.semis   || []).map(addMeta),
      final:   lig.final ? addMeta(lig.final) : initialLiguilla().final,
    },
  }
}

export function computeWinner(match) {
  if (!match.homeId || !match.awayId) return null
  if (match.manualWinner && match.winnerId) return match.winnerId
  const idaDone    = match.idaHome    != null && match.idaAway    != null
  const vueltaDone = match.vueltaHome != null && match.vueltaAway != null
  if (!idaDone || !vueltaDone) return null
  const homeAgg = Number(match.idaHome) + Number(match.vueltaAway)
  const awayAgg = Number(match.idaAway) + Number(match.vueltaHome)
  return homeAgg >= awayAgg ? match.homeId : match.awayId
}

export function getAgg(match) {
  const idaDone    = match.idaHome    != null && match.idaAway    != null
  const vueltaDone = match.vueltaHome != null && match.vueltaAway != null
  let h = 0, a = 0
  if (idaDone)    { h += Number(match.idaHome);    a += Number(match.idaAway) }
  if (vueltaDone) { h += Number(match.vueltaAway); a += Number(match.vueltaHome) }
  return { h, a, done: idaDone && vueltaDone }
}

export function updateBracketProgression(torneo, standings) {
  const lig = JSON.parse(JSON.stringify(torneo.liguilla))

  lig.cuartos.forEach(m => { m.winnerId = computeWinner(m) })

  const qWinners = lig.cuartos.map(m => m.winnerId).filter(Boolean)
  if (qWinners.length >= 2) {
    const seed = id => { const i = standings.findIndex(s => s.team.id === id); return i >= 0 ? i + 1 : 99 }
    const seeded = qWinners.map(id => ({ id, s: seed(id) })).sort((a, b) => a.s - b.s)

    if (seeded.length >= 2) {
      const [s1h, s1a] = [seeded[0].id, seeded[seeded.length - 1].id]
      if (lig.semis[0].homeId !== s1h || lig.semis[0].awayId !== s1a) {
        Object.assign(lig.semis[0], { homeId: s1h, awayId: s1a, idaHome: null, idaAway: null, vueltaHome: null, vueltaAway: null, winnerId: null, manualWinner: false })
      }
    }
    if (seeded.length >= 4) {
      const [s2h, s2a] = [seeded[1].id, seeded[2].id]
      if (lig.semis[1].homeId !== s2h || lig.semis[1].awayId !== s2a) {
        Object.assign(lig.semis[1], { homeId: s2h, awayId: s2a, idaHome: null, idaAway: null, vueltaHome: null, vueltaAway: null, winnerId: null, manualWinner: false })
      }
    }
  }

  lig.semis.forEach(m => { m.winnerId = computeWinner(m) })

  const [s1w, s2w] = [lig.semis[0].winnerId, lig.semis[1].winnerId]
  if (s1w && s2w && (lig.final.homeId !== s1w || lig.final.awayId !== s2w)) {
    Object.assign(lig.final, { homeId: s1w, awayId: s2w, idaHome: null, idaAway: null, vueltaHome: null, vueltaAway: null, winnerId: null, manualWinner: false })
  }

  lig.final.winnerId = computeWinner(lig.final)
  lig.champion = lig.final.winnerId || null

  return { ...torneo, liguilla: lig }
}
