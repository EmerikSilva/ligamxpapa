import { LIGA_MX_TEAMS } from '../data/teams'

export function calculateStandings(jornadas) {
  const map = {}
  LIGA_MX_TEAMS.forEach(t => {
    map[t.id] = { team: t, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0, form: [] }
  })

  ;[...jornadas].sort((a, b) => a.numero - b.numero).forEach(jornada => {
    jornada.partidos.forEach(p => {
      if (!p.jugado || p.golesLocal == null || p.golesVisitante == null) return
      const L = map[p.localId], V = map[p.visitanteId]
      if (!L || !V) return
      const gl = Number(p.golesLocal), gv = Number(p.golesVisitante)
      L.pj++; V.pj++; L.gf += gl; L.gc += gv; V.gf += gv; V.gc += gl
      if (gl > gv)      { L.g++; L.pts += 3; L.form.push('W'); V.p++; V.form.push('L') }
      else if (gl < gv) { V.g++; V.pts += 3; V.form.push('W'); L.p++; L.form.push('L') }
      else              { L.e++; L.pts++;     L.form.push('D'); V.e++; V.pts++;     V.form.push('D') }
    })
  })

  return Object.values(map)
    .map(s => ({ ...s, dg: s.gf - s.gc, form: s.form.slice(-5) }))
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.team.name.localeCompare(b.team.name))
}
