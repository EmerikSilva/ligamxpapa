import { useState, useEffect, useRef } from 'react'
import Modal from '../ui/Modal'
import PwdInput from '../ui/PwdInput'
import { AvatarImg } from '../layout/Header'
import { authUpdate } from '../../api/client'
import { useApp } from '../../context/AppContext'

export default function ProfileModal({ isOpen, onClose }) {
  const { authUser, setAuthUser, addToast } = useApp()
  const [name,    setName]    = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending]  = useState(undefined) // undefined | null | base64
  const [busy, setBusy]        = useState(false)
  const [error, setError]      = useState('')
  const [success, setSuccess]  = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!isOpen || !authUser) return
    setName(authUser.name)
    setUsername(authUser.username)
    setPassword('')
    setPending(undefined)
    setError('')
    setSuccess(false)
  }, [isOpen])

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPending(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleSave() {
    const updates = { name, username }
    if (password) updates.password = password
    if (pending !== undefined) updates.avatar = pending
    setBusy(true); setError('')
    const r = await authUpdate(updates)
    setBusy(false)
    if (r.error) { setError(r.error); return }
    setAuthUser(r.user)
    setPending(undefined)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (!authUser) return null

  const previewUser = pending !== undefined
    ? { ...authUser, avatar: pending }
    : authUser

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="modal-sm">
      <div className="modal-header">
        <h3>Mi Perfil</h3>
        <button className="modal-close" onClick={onClose}><CloseIcon /></button>
      </div>
      <div className="modal-body">
        <div className="profile-avatar-section">
          <div className="profile-avatar-preview">
            <AvatarImg user={previewUser} large />
          </div>
          <div className="profile-avatar-actions">
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => fileRef.current?.click()}>
              Cambiar foto
            </button>
            {(previewUser.avatar || pending !== undefined) && (
              <button type="button" className="btn btn-sm btn-danger-ghost" onClick={() => setPending(null)}>
                Quitar foto
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Nombre completo</label>
          <input type="text" className="form-input" autoComplete="name"
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Nombre de usuario</label>
          <input type="text" className="form-input" autoComplete="username"
            value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">
            Nueva contraseña <span className="form-hint">(dejar vacío para no cambiar)</span>
          </label>
          <PwdInput autoComplete="new-password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {error   && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">Perfil actualizado correctamente.</div>}
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" disabled={busy} onClick={handleSave}>
          {busy ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </Modal>
  )
}

function CloseIcon() {
  return <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
}
