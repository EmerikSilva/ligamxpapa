import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, size = '', children }) {
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handler)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="modal-backdrop open"
      style={{ display: 'flex' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`modal ${size}`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
