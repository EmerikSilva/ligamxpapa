export function cdmxToSonora(hora) {
  if (!hora) return hora
  const [h, m] = hora.split(':').map(Number)
  const total = ((h * 60 + m - 60) % (24 * 60) + 24 * 60) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function fmtDate(fecha, hora) {
  if (!fecha) return ''
  const d = new Date(fecha + 'T12:00:00')
  const datePart = d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
  if (!hora) return datePart
  return `${datePart} ${hora} / ${cdmxToSonora(hora)} Son`
}

export function sortKey(p) {
  if (!p.fecha) return '9999-99-99T99:99'
  return `${p.fecha}T${p.hora || '00:00'}`
}
