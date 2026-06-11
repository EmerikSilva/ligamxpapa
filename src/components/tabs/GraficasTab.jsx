import { useState, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { LIGA_MX_TEAMS } from '../../data/teams'
import { calculateStandings } from '../../utils/standings'
import { useApp } from '../../context/AppContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const liguillaZonePlugin = {
  id: 'liguillaZone',
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart
    if (!scales.y || !chartArea) return
    const y1 = scales.y.getPixelForValue(0.5)
    const y8 = scales.y.getPixelForValue(8.5)
    const yTop = Math.min(y1, y8), yBot = Math.max(y1, y8)
    ctx.save()
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)'
    ctx.fillRect(chartArea.left, yTop, chartArea.right - chartArea.left, yBot - yTop)
    ctx.restore()
  },
}
ChartJS.register(liguillaZonePlugin)

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      reverse: true, min: 0.5, max: 18.5,
      ticks: {
        stepSize: 1, color: '#7da88a', font: { size: 11 },
        callback: v => {
          if (!Number.isInteger(v)) return null
          if (v === 1) return '1° '
          if (v === 8) return '8° '
          return `${v}`
        },
      },
      grid:   { color: 'rgba(255,255,255,0.05)' },
      border: { color: 'rgba(255,255,255,0.08)' },
    },
    x: {
      ticks:  { color: '#7da88a', font: { size: 11 } },
      grid:   { color: 'rgba(255,255,255,0.05)' },
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
      bodyColor:  '#7da88a',
      padding: 14,
      itemSort: (a, b) => a.parsed.y - b.parsed.y,
      callbacks: {
        title: items => items[0]?.label || '',
        label: ctx => {
          const pos = ctx.parsed.y
          const zone = pos <= 8 ? ' ✦' : ''
          return `  ${pos}°  ${ctx.dataset.label}${zone}`
        },
      },
    },
  },
  interaction: { mode: 'index', intersect: false },
  animation: { duration: 250 },
}

function TeamChip({ team, active, onToggle }) {
  const [err, setErr] = useState(false)
  return (
    <button
      className={`team-chip${active ? ' active' : ''}`}
      title={team.name}
      style={active ? { borderColor: team.color + '40' } : {}}
      onClick={() => onToggle(team.id)}
    >
      {!err && <img src={team.logo} className="chip-logo" alt={team.short} onError={() => setErr(true)} />}
      <span className="chip-name">{team.short}</span>
    </button>
  )
}

export default function GraficasTab({ isActive }) {
  const { currentTorneo } = useApp()
  const [visible, setVisible] = useState(() => new Set(LIGA_MX_TEAMS.map(t => t.id)))

  const { labels, datasets } = useMemo(() => {
    const jornadas = [...(currentTorneo?.jornadas || [])].sort((a, b) => a.numero - b.numero)
    if (!jornadas.length) return { labels: [], datasets: [] }

    const lbls = jornadas.map(j => `J${j.numero}`)
    const history = {}
    LIGA_MX_TEAMS.forEach(t => { history[t.id] = [] })

    for (let i = 0; i < jornadas.length; i++) {
      const standings = calculateStandings(jornadas.slice(0, i + 1))
      LIGA_MX_TEAMS.forEach(t => {
        const pos = standings.findIndex(s => s.team.id === t.id)
        history[t.id].push(pos >= 0 ? pos + 1 : 18)
      })
    }

    const ds = LIGA_MX_TEAMS.map(t => ({
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
      hidden: !visible.has(t.id),
    }))

    return { labels: lbls, datasets: ds }
  }, [currentTorneo, visible])

  function toggleTeam(id) {
    setVisible(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (!isActive) return null

  return (
    <div className="tab-panel active" id="tab-graficas">
      <div className="section-header">
        <h2 className="section-title">Evolución de Posiciones</h2>
        <div className="grafica-presets">
          <button className="btn btn-sm btn-secondary" id="btn-graf-todos"
            onClick={() => setVisible(new Set(LIGA_MX_TEAMS.map(t => t.id)))}>
            Todos
          </button>
          <button className="btn btn-sm btn-secondary" id="btn-graf-top8"
            onClick={() => {
              const standings = calculateStandings(currentTorneo?.jornadas || [])
              setVisible(new Set(standings.slice(0, 8).map(s => s.team.id)))
            }}>
            Top 8
          </button>
          <button className="btn btn-sm btn-secondary" id="btn-graf-ninguno"
            onClick={() => setVisible(new Set())}>
            Ninguno
          </button>
        </div>
      </div>

      <div className="card grafica-card">
        {labels.length > 0 ? (
          <div className="grafica-chart-wrap" id="grafica-chart-wrap">
            <Line
              id="grafica-canvas"
              data={{ labels, datasets }}
              options={CHART_OPTIONS}
              updateMode="none"
            />
          </div>
        ) : (
          <div className="grafica-empty" id="grafica-empty">
            <p>No hay jornadas registradas aún.</p>
          </div>
        )}

        <div className="grafica-teams-wrap">
          <p className="grafica-teams-label">Filtrar equipos</p>
          <div className="grafica-teams" id="grafica-teams">
            {LIGA_MX_TEAMS.map(t => (
              <TeamChip key={t.id} team={t} active={visible.has(t.id)} onToggle={toggleTeam} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
