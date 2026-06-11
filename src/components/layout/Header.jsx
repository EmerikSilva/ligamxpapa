import { useState } from 'react'
import { useApp } from '../../context/AppContext'

function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase()
}
function avatarBg(id) {
  const colors = ['#e74c3c','#e67e22','#27ae60','#2980b9','#8e44ad','#e91e63','#00b894','#0984e3']
  let h = 0
  for (const c of (id || '')) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0
  return colors[Math.abs(h) % colors.length]
}

export function AvatarImg({ user, large = false }) {
  const size = large ? 64 : 30
  const fs   = large ? '1.3rem' : '.7rem'
  const [err, setErr] = useState(false)
  if (user.avatar && !err) {
    return (
      <img
        src={user.avatar}
        className="avatar-img"
        alt={user.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        onError={() => setErr(true)}
      />
    )
  }
  return (
    <span style={{
      background: avatarBg(user.id), width: size, height: size, minWidth: size,
      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: fs, fontWeight: 800, color: '#fff',
    }}>
      {getInitials(user.name)}
    </span>
  )
}

export default function Header({ onOpenProfile, onOpenTorneos, totalJornadas, totalJugados }) {
  const { authUser, currentTorneo, torneoData, setTorneoActual, logout } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })

  if (!authUser) return null

  function handleMenuBtn(e) {
    e.stopPropagation()
    if (menuOpen) { setMenuOpen(false); return }
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    setMenuOpen(true)
  }

  const [brandErr, setBrandErr] = useState(false)

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="brand">
              <div className="brand-icon liga-logo-wrap">
                {brandErr ? (
                  <svg style={{ display: 'block', width: 26, height: 26, color: '#fff' }} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    <path d="M2 12h20" />
                  </svg>
                ) : (
                  <img src="https://a.espncdn.com/i/leaguelogos/soccer/500/262.png"
                    className="liga-logo-img" alt="Liga MX" onError={() => setBrandErr(true)} />
                )}
              </div>
              <div className="brand-info">
                <h1 className="brand-name">Liga <span>MX</span></h1>
                <span className="season-badge">{currentTorneo?.nombre || currentTorneo?.season || '—'}</span>
              </div>
            </div>

            <div className="header-stats" id="header-stats">
              <div className="stat-chip"><span className="val">{totalJornadas}</span><span className="lbl">Jornadas</span></div>
              <div className="stat-chip"><span className="val">{totalJugados}</span><span className="lbl">Jugados</span></div>
            </div>

            <div className="header-right">
              <div className="torneo-selector" id="torneo-selector-wrap">
                <select
                  className="torneo-select"
                  value={currentTorneo?.id || ''}
                  onChange={e => setTorneoActual(e.target.value)}
                >
                  {torneoData.torneos.length
                    ? torneoData.torneos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)
                    : <option value="">Sin torneos</option>}
                </select>
                <button
                  className="btn btn-sm btn-ghost torneo-manage-btn"
                  id="btn-manage-torneos"
                  title="Gestionar torneos"
                  onClick={onOpenTorneos}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                  </svg>
                </button>
              </div>

              <div className="user-menu" id="user-menu">
                <button className="user-menu-btn" id="user-menu-btn" onClick={handleMenuBtn}>
                  <div className="user-avatar"><AvatarImg user={authUser} /></div>
                  <span className="user-greeting">¡Hola, {authUser.name.split(' ')[0]}!</span>
                  <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14, color: 'var(--text-sm)', flexShrink: 0 }}>
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setMenuOpen(false)} />
          <div
            className="user-dropdown"
            style={{ display: 'block', position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 100 }}
          >
            <button className="user-dropdown-item" onClick={() => { setMenuOpen(false); onOpenProfile() }}>
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15 }}>
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Mi perfil
            </button>
            <div className="user-dropdown-sep" />
            <button className="user-dropdown-item danger" onClick={() => { setMenuOpen(false); logout() }}>
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15 }}>
                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </>
  )
}
