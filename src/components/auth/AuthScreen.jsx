import { useState } from 'react'
import PwdInput from '../ui/PwdInput'
import { authLogin, authRegister } from '../../api/client'
import { useApp } from '../../context/AppContext'

export default function AuthScreen() {
  const { login, addToast } = useApp()
  const [tab, setTab] = useState('login')

  const [loginUser, setLoginUser] = useState('')
  const [loginPwd, setLoginPwd]   = useState('')
  const [loginErr, setLoginErr]   = useState('')
  const [loginBusy, setLoginBusy] = useState(false)

  const [regName, setRegName]   = useState('')
  const [regUser, setRegUser]   = useState('')
  const [regPwd, setRegPwd]     = useState('')
  const [regErr, setRegErr]     = useState('')
  const [regBusy, setRegBusy]   = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoginBusy(true); setLoginErr('')
    const r = await authLogin(loginUser, loginPwd)
    if (r.error) { setLoginErr(r.error); setLoginBusy(false); return }
    await login(r.user)
    setLoginBusy(false)
  }

  async function handleRegister(e) {
    e.preventDefault()
    setRegBusy(true); setRegErr('')
    const r = await authRegister(regUser, regName, regPwd)
    if (r.error) { setRegErr(r.error); setRegBusy(false); return }
    await login(r.user)
    setRegBusy(false)
  }

  return (
    <div className="auth-screen" style={{ display: 'flex' }}>
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo-wrap">
            <BrandLogo />
          </div>
          <h1 className="auth-title">Liga <span>MX</span></h1>
          <p className="auth-subtitle">Tracker de temporada</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>
            Iniciar sesión
          </button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => setTab('register')}>
            Crear cuenta
          </button>
        </div>

        {tab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input type="text" className="form-input" placeholder="tu_usuario" autoComplete="username"
                value={loginUser} onChange={e => setLoginUser(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <PwdInput placeholder="••••••••" autoComplete="current-password"
                value={loginPwd} onChange={e => setLoginPwd(e.target.value)} />
            </div>
            {loginErr && <div className="auth-error">{loginErr}</div>}
            <button type="submit" className="btn btn-primary auth-submit" disabled={loginBusy}>
              {loginBusy ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input type="text" className="form-input" placeholder="Juan Pérez" autoComplete="name"
                value={regName} onChange={e => setRegName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre de usuario</label>
              <input type="text" className="form-input" placeholder="juan123" autoComplete="username"
                value={regUser} onChange={e => setRegUser(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">
                Contraseña <span className="form-hint">(mínimo 4 caracteres)</span>
              </label>
              <PwdInput placeholder="••••••••" autoComplete="new-password"
                value={regPwd} onChange={e => setRegPwd(e.target.value)} />
            </div>
            {regErr && <div className="auth-error">{regErr}</div>}
            <button type="submit" className="btn btn-primary auth-submit" disabled={regBusy}>
              {regBusy ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function BrandLogo() {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div className="auth-logo-fallback" style={{ display: 'flex' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
      </div>
    )
  }
  return (
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/f/f8/MX_logo.png"
      className="auth-logo-img"
      alt="Liga MX"
      onError={() => setErr(true)}
    />
  )
}
