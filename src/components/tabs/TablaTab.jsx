import LogoImg from '../ui/LogoImg'
import { calculateStandings } from '../../utils/standings'
import { useApp } from '../../context/AppContext'

const FORM_LABEL = { W: 'Victoria', D: 'Empate', L: 'Derrota' }

export default function TablaTab({ isActive }) {
  const { currentTorneo } = useApp()
  if (!isActive || !currentTorneo) return null

  const rows = calculateStandings(currentTorneo.jornadas || [])

  return (
    <div className="tab-panel active" id="tab-tabla">
      <div className="section-header">
        <h2 className="section-title">Tabla de Posiciones</h2>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#10b981' }} />
            <span>Liguilla (1–8)</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="table-scroll">
          <table className="standings-table">
            <thead>
              <tr>
                <th className="col-pos">#</th>
                <th className="col-team">Equipo</th>
                <th title="Partidos Jugados">PJ</th>
                <th title="Ganados">G</th>
                <th title="Empates">E</th>
                <th title="Perdidos">P</th>
                <th title="Goles a Favor">GF</th>
                <th title="Goles en Contra">GC</th>
                <th title="Diferencia de Goles">DG</th>
                <th className="col-pts" title="Puntos">Pts</th>
                <th className="col-form" title="Últimos 5 partidos">Forma</th>
              </tr>
            </thead>
            <tbody id="standings-tbody">
              {rows.map((s, i) => {
                const pos = i + 1
                const zone = pos <= 8 ? 'zone-liguilla' : ''
                const dgCls = s.dg > 0 ? 'dg-pos' : s.dg < 0 ? 'dg-neg' : 'dg-zero'
                return (
                  <tr key={s.team.id} className={zone}>
                    <td className="col-pos"><span className="pos-num">{pos}</span></td>
                    <td className="col-team">
                      <div className="team-cell">
                        <LogoImg team={s.team} size="table" />
                        <span className="team-name">{s.team.name}</span>
                      </div>
                    </td>
                    <td>{s.pj}</td>
                    <td>{s.g}</td>
                    <td>{s.e}</td>
                    <td>{s.p}</td>
                    <td>{s.gf}</td>
                    <td>{s.gc}</td>
                    <td className={dgCls}>{s.dg > 0 ? '+' : ''}{s.dg}</td>
                    <td className="col-pts">{s.pts}</td>
                    <td className="col-form">
                      <div className="form-badges">
                        {s.form.length
                          ? s.form.map((r, j) => (
                            <span key={j} className={`form-dot ${r}`} title={FORM_LABEL[r]}>{r}</span>
                          ))
                          : <span style={{ color: 'var(--text-sm)', fontSize: '.7rem' }}>—</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
