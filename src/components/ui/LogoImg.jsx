import { useState } from 'react'

const SIZE_CLS = {
  lg:    'team-logo-lg',
  md:    'team-logo-md',
  table: 'team-logo',
  sm:    'team-logo-sm',
}

export default function LogoImg({ team, size = 'sm' }) {
  const [err, setErr] = useState(false)
  if (!team) return null
  const cls = SIZE_CLS[size] || 'team-logo-sm'
  if (err) {
    return (
      <span className="team-badge" style={{ background: team.color, color: team.text }}>
        {team.short}
      </span>
    )
  }
  return (
    <img
      src={team.logo}
      alt={team.name}
      className={cls}
      loading="lazy"
      onError={() => setErr(true)}
    />
  )
}
