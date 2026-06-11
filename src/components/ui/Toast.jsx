export default function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" id="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-dot" />
          {t.msg}
        </div>
      ))}
    </div>
  )
}
