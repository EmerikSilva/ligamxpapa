import Modal from './Modal'

export default function ConfirmDialog({ title, msg, okLabel, okClass, onConfirm, onCancel }) {
  return (
    <Modal isOpen onClose={onCancel} size="modal-xs">
      <div className="modal-header">
        <h3>{title}</h3>
      </div>
      <div className="modal-body">
        <p className="confirm-text">{msg}</p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onCancel}>No</button>
        <button className={`btn ${okClass}`} onClick={onConfirm}>{okLabel}</button>
      </div>
    </Modal>
  )
}
