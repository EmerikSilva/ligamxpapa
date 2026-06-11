import { useState } from 'react'

export default function PwdInput({ id, placeholder, autoComplete, value, onChange, className = 'form-input' }) {
  const [show, setShow] = useState(false)
  return (
    <div className="pwd-wrap">
      <input
        type={show ? 'text' : 'password'}
        id={id}
        className={className}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        className="pwd-toggle"
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        tabIndex={-1}
        onClick={() => setShow(s => !s)}
      >
        <svg className="eye-open" viewBox="0 0 20 20" fill="currentColor" style={show ? { display: 'none' } : {}}>
          <path d="M10 3C5 3 1.73 7.11 1.05 9.71a1 1 0 000 .58C1.73 12.89 5 17 10 17s8.27-4.11 8.95-6.71a1 1 0 000-.58C18.27 7.11 15 3 10 3zm0 11a4 4 0 110-8 4 4 0 010 8z" />
          <circle cx="10" cy="10" r="2" />
        </svg>
        <svg className="eye-closed" viewBox="0 0 20 20" fill="currentColor" style={!show ? { display: 'none' } : {}}>
          <path d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.74-1.74A9.6 9.6 0 0018.95 10.3a1 1 0 000-.58C18.27 7.11 15 3 10 3a9.4 9.4 0 00-4.6 1.22L3.28 2.22zM10 5a5 5 0 014.47 7.28l-1.47-1.47a3 3 0 00-3.81-3.81L7.72 5.53A4.96 4.96 0 0110 5zm-4.47 2.72l1.47 1.47a3 3 0 003.81 3.81l1.47 1.47A5 5 0 015.53 7.72zM1.05 10.29C1.73 12.89 5 17 10 17a9.4 9.4 0 003.07-.52l-1.57-1.57A5 5 0 017.5 7.91L5.22 5.63A9.4 9.4 0 001.05 9.71a1 1 0 000 .58z" />
        </svg>
      </button>
    </div>
  )
}
