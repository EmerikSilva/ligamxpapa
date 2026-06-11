import { useEffect, useState, useCallback } from 'react'
import { useApp } from '../../context/AppContext'

const STEPS = [
  { title: '¡Bienvenido a Liga MX Tracker! 🏆', body: 'Esta guía te lleva por todas las secciones de la app paso a paso para que puedas configurar tu primera temporada. Usa <strong>Siguiente ›</strong> y <strong>‹ Anterior</strong> para navegar, o <strong>Saltar</strong> si prefieres explorar por tu cuenta.', target: null, position: 'center' },
  { title: '🗂️ Selector de Torneo', body: 'Un <strong>torneo</strong> es una temporada completa — por ejemplo "Clausura 2026" o "Apertura 2025". Este selector muestra el torneo activo y te permite cambiar entre varios. Cada torneo guarda sus propias jornadas, resultados y liguilla de forma independiente.', target: '#torneo-selector-wrap', position: 'bottom' },
  { title: '⚙️ Gestionar Torneos', body: 'Con este botón (ícono de controles) abres el <strong>panel de torneos</strong>: crea nuevos, renómbralos, cambia entre ellos o elimínalos. <em>El primer paso siempre es crear un torneo antes de agregar jornadas.</em>', target: '#btn-manage-torneos', position: 'bottom' },
  { title: '📊 Tabla de Posiciones', body: 'La <strong>Tabla</strong> muestra los 18 equipos ordenados por puntos — Victoria = 3 pts, Empate = 1 pt, Derrota = 0. Los <strong>8 primeros</strong> (marcados en verde) clasifican a la Liguilla. La tabla se recalcula automáticamente con cada resultado que captures.', target: 'button[data-tab="tabla"]', position: 'bottom', tab: 'tabla' },
  { title: '📈 Cómo leer la Tabla', body: '<strong>PJ</strong> Partidos Jugados &nbsp;·&nbsp; <strong>G/E/P</strong> Ganados, Empates, Perdidos &nbsp;·&nbsp; <strong>GF/GC</strong> Goles a Favor y en Contra &nbsp;·&nbsp; <strong>DG</strong> Diferencia de Goles &nbsp;·&nbsp; <strong>Pts</strong> Puntos totales &nbsp;·&nbsp; <strong>Forma</strong> últimos 5 partidos: W=Victoria, D=Empate, L=Derrota.', target: '.standings-table', position: 'bottom', tab: 'tabla' },
  { title: '📅 Jornadas', body: 'Aquí registras los partidos de cada fecha del torneo. La Liga MX tiene <strong>17 jornadas</strong> con hasta 9 partidos cada una (9 partidos × 2 equipos = los 18 equipos completos). Puedes agregar estadio, fecha y hora de cada encuentro.', target: 'button[data-tab="jornadas"]', position: 'bottom', tab: 'tabla' },
  { title: '➕ Crear una Jornada', body: 'Haz clic en <strong>"Nueva Jornada"</strong> para agregar una fecha. Elige el número de jornada (1–17) y agrega partidos seleccionando equipo local y visitante. El estadio se rellena automáticamente según el equipo local. Puedes agregar hasta 9 partidos por jornada.', target: '#btn-nueva-jornada', position: 'bottom', tab: 'jornadas' },
  { title: '⚽ Capturar Resultados', body: 'Una vez creada la jornada, <strong>haz clic en cualquier tarjeta de partido</strong> para abrir el editor de resultado. Ingresa los goles de cada equipo, activa "Partido jugado" y guarda. La tabla se actualiza al instante. La app te ofrecerá capturar el siguiente partido pendiente automáticamente.', target: '#tab-jornadas', position: 'top', tab: 'jornadas' },
  { title: '🏆 Liguilla (Playoff)', body: 'Cuando los 8 primeros de la tabla estén definidos, usa <strong>"Generar Bracket"</strong> en esta sección. El sistema arma cuartos, semis y gran final automáticamente. Cada ronda se juega con <strong>partido de ida y vuelta</strong>; el marcador global decide al clasificado. En empate global, el mejor sembrado avanza (o puedes elegir manualmente).', target: 'button[data-tab="liguilla"]', position: 'bottom', tab: 'tabla' },
  { title: '📊 Gráficas de Evolución', body: 'Las gráficas muestran cómo cambió la <strong>posición de cada equipo</strong> jornada a jornada. Usa los filtros inferiores para comparar equipos específicos, ver solo el Top 8 o deseleccionarlos todos. La zona verde indica las posiciones que clasifican a Liguilla.', target: 'button[data-tab="graficas"]', position: 'bottom', tab: 'tabla' },
  { title: '¡Todo listo! Crea tu primer torneo 🎉', body: 'Ya conoces toda la app. El <strong>primer paso es crear tu torneo</strong>: haz clic en el ícono de ajustes junto al selector, escribe el nombre (ej: "Clausura 2026") y presiona Crear. Después agrega tu primera jornada y comienza a capturar resultados. ¡Suerte!', target: '#btn-manage-torneos', position: 'bottom', tab: 'tabla' },
]

export default function Tour({ isActive, step, onNext, onPrev, onEnd, onTabChange }) {
  const { torneoData } = useApp()
  const [spotlight, setSpotlight] = useState(null)
  const [cardPos, setCardPos]     = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
  const isMobile = window.innerWidth <= 500

  const positionCard = useCallback(() => {
    const s = STEPS[step]
    if (!s.target) {
      setSpotlight(null)
      if (isMobile) {
        setCardPos({ top: '50%', left: 12, transform: 'translateY(-50%)' })
      } else {
        setCardPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
      }
      return
    }

    const el = document.querySelector(s.target)
    if (!el) {
      setSpotlight(null)
      setCardPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
      return
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => {
      const rect = el.getBoundingClientRect()
      const pad = 8
      const vw = window.innerWidth, vh = window.innerHeight
      setSpotlight({
        top:    rect.top  - pad,
        left:   rect.left - pad,
        width:  rect.width  + pad * 2,
        height: rect.height + pad * 2,
      })
      if (isMobile) {
        const cardH = 180
        const spaceBelow = vh - rect.bottom - pad - 14
        const spaceAbove = rect.top - pad - 14
        const top = spaceBelow >= cardH || spaceBelow >= spaceAbove
          ? rect.bottom + pad + 14
          : Math.max(8, rect.top - pad - 14 - cardH)
        setCardPos({ top: Math.min(top, vh - cardH - 8), left: 12, transform: '' })
      } else {
        const cardW = 400
        let top, left
        if (s.position === 'bottom') {
          top = rect.bottom + pad + 14
          if (top + 250 > vh) top = rect.top - pad - 14 - 210
        } else {
          top = rect.top - pad - 14 - 210
          if (top < 16) top = rect.bottom + pad + 14
        }
        left = rect.left + rect.width / 2 - cardW / 2
        left = Math.max(12, Math.min(left, vw - cardW - 12))
        top  = Math.max(16, Math.min(top, vh - 230))
        setCardPos({ top, left, transform: '' })
      }
    }, 320)
  }, [step, isMobile])

  useEffect(() => {
    if (!isActive) return
    const s = STEPS[step]
    if (s.tab) onTabChange(s.tab)
    setTimeout(positionCard, 50)
  }, [isActive, step, positionCard])

  if (!isActive) return null

  const s = STEPS[step]
  const isLast = step === STEPS.length - 1
  const hasTorneos = torneoData.torneos.length > 0

  function handleNext() {
    if (isLast) { onEnd(); if (!hasTorneos) setTimeout(() => document.getElementById('btn-manage-torneos')?.click(), 100); return }
    onNext()
  }

  return (
    <div id="tour-overlay">
      {spotlight ? (
        <div id="tour-spotlight" style={{ position: 'fixed', ...spotlight, zIndex: 999, borderRadius: 8, boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)', pointerEvents: 'none' }} />
      ) : (
        <div id="tour-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 999, pointerEvents: 'none' }} />
      )}

      <div id="tour-card" style={{ position: 'fixed', zIndex: 1000, width: isMobile ? 'calc(100% - 24px)' : 400, ...cardPos }}>
        <div className="tour-card-top">
          <div className="tour-dots" id="tour-dots">
            {STEPS.map((_, i) => (
              <span key={i} className={`tour-dot${i === step ? ' active' : i < step ? ' done' : ''}`} />
            ))}
          </div>
          <button className="tour-skip-btn" id="tour-skip" onClick={onEnd}>✕ Saltar</button>
        </div>
        <h3 className="tour-title" id="tour-title">{s.title}</h3>
        <p className="tour-body" id="tour-body" dangerouslySetInnerHTML={{ __html: s.body }} />
        <div className="tour-footer">
          <span className="tour-step-label">
            <span id="tour-step-num">{step + 1}</span> / <span id="tour-step-total">{STEPS.length}</span>
          </span>
          <div className="tour-nav">
            {step > 0 && (
              <button className="btn btn-ghost btn-sm" id="tour-prev" onClick={onPrev}>‹ Anterior</button>
            )}
            <button className="btn btn-primary btn-sm" id="tour-next" onClick={handleNext}>
              {isLast ? (hasTorneos ? 'Finalizar ✓' : 'Crear mi torneo →') : 'Siguiente ›'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
