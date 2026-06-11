import Modal from '../ui/Modal'
import { useApp } from '../../context/AppContext'

export default function WelcomeModal({ isOpen, onClose, onTour }) {
  const { authUser } = useApp()
  const firstName = authUser?.name?.split(' ')[0] || ''

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="modal-sm">
      <div className="modal-header">
        <h3>¡Bienvenido, {firstName}! 🏆</h3>
      </div>
      <div className="modal-body">
        <div style={{ textAlign: 'center', fontSize: '3.5rem', marginBottom: 16, lineHeight: 1 }}>⚽</div>
        <p style={{ color: 'var(--text-md)', fontSize: '.88rem', lineHeight: 1.65, marginBottom: 10 }}>
          Para aprovechar la app, te recomendamos empezar por{' '}
          <strong style={{ color: 'var(--text)' }}>crear tu primer torneo</strong>{' '}
          (ej: "Clausura 2026") desde el panel de gestión.
        </p>
        <p style={{ color: 'var(--text-md)', fontSize: '.88rem', lineHeight: 1.65 }}>
          ¿Te gustaría que la app te haga un{' '}
          <strong style={{ color: 'var(--text)' }}>recorrido guiado</strong>{' '}
          por todas las secciones antes de empezar?
        </p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Explorar solo</button>
        <button className="btn btn-primary" onClick={onTour}>Iniciar guía ✨</button>
      </div>
    </Modal>
  )
}
