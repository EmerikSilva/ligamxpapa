import { useState, useRef } from 'react'
import Modal from '../ui/Modal'
import { useApp } from '../../context/AppContext'

const ICO_TRASH = <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 7a1 1 0 012 0v4a1 1 0 11-2 0V9zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" /></svg>
const ICO_EDIT  = <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>

export default function TorneosModal({ isOpen, onClose }) {
  const { torneoData, currentTorneo, setTorneoActual, createTorneo, deleteTorneo, renameTorneo, addToast, confirm } = useApp()
  const [newNombre, setNewNombre] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const editRef = useRef(null)

  function handleCreate() {
    const nombre = newNombre.trim()
    if (!nombre) { addToast('Ingresa un nombre para el torneo.', 'error'); return }
    createTorneo(nombre)
    setNewNombre('')
    addToast(`Torneo "${nombre}" creado.`)
  }

  async function handleDelete(t) {
    if (!await confirm(`¿Eliminar "${t.nombre}"? Se perderán todos sus datos.`, 'Eliminar torneo')) return
    deleteTorneo(t.id)
    addToast('Torneo eliminado.', 'info')
  }

  function startEdit(t) {
    setEditingId(t.id)
    setEditingName(t.nombre)
    setTimeout(() => editRef.current?.focus(), 50)
  }

  function commitEdit() {
    const n = editingName.trim()
    if (n && editingId) renameTorneo(editingId, n)
    setEditingId(null)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="modal-sm">
      <div className="modal-header">
        <h3>Torneos</h3>
        <button className="modal-close" onClick={onClose}><CloseIcon /></button>
      </div>
      <div className="modal-body">
        <div id="torneos-list" style={{ marginBottom: 20 }}>
          {!torneoData.torneos.length && (
            <p className="empty-msg">Aún no hay torneos. Crea el primero abajo.</p>
          )}
          {torneoData.torneos.map(t => {
            const isActive = t.id === currentTorneo?.id
            return (
              <div key={t.id} className={`torneo-item ${isActive ? 'active' : ''}`}>
                <div className="torneo-item-info">
                  {editingId === t.id ? (
                    <input
                      ref={editRef}
                      className="form-input form-input-sm"
                      style={{ flex: 1 }}
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={e => { if (e.key === 'Enter') commitEdit() }}
                    />
                  ) : (
                    <span className="torneo-item-name">{t.nombre}</span>
                  )}
                  {isActive && <span className="torneo-active-badge">Activo</span>}
                </div>
                <div className="torneo-item-actions">
                  {!isActive && (
                    <button className="btn btn-sm btn-ghost"
                      onClick={() => { setTorneoActual(t.id); addToast(`Torneo: ${t.nombre}`) }}>
                      Usar
                    </button>
                  )}
                  <button className="btn btn-sm btn-ghost" title="Renombrar" onClick={() => startEdit(t)}>
                    {ICO_EDIT}
                  </button>
                  <button className="btn btn-sm btn-danger-ghost" title="Eliminar" onClick={() => handleDelete(t)}>
                    {ICO_TRASH}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="form-group">
          <label className="form-label">Nuevo torneo</label>
          <div className="input-row">
            <input type="text" className="form-input" id="new-torneo-name" placeholder="Ej: Apertura 2026"
              maxLength={40} value={newNombre} onChange={e => setNewNombre(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate() }} />
            <button className="btn btn-primary" id="btn-crear-torneo" onClick={handleCreate}>Crear</button>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  )
}

function CloseIcon() {
  return <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
}
