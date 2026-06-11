export const LIGA_MX_TEAMS = [
  { id: 'america',    name: 'América',           short: 'AME', color: '#FFD100', text: '#002f6c', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/227.png',   stadium: 'Estadio Azteca',               extraStadiums: ['Estadio Azteca', 'Estadio Ciudad de los Deportes'] },
  { id: 'guadalajara',name: 'Guadalajara',        short: 'CHI', color: '#CC0000', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/219.png',   stadium: 'Estadio Akron' },
  { id: 'cruzazul',  name: 'Cruz Azul',          short: 'CAZ', color: '#1B3FA0', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/218.png',   stadium: 'Estadio Ciudad de los Deportes', extraStadiums: ['Estadio Ciudad de los Deportes', 'Estadio Azteca', 'Estadio Olímpico Universitario', 'Estadio Cuauhtémoc'] },
  { id: 'pumas',     name: 'Pumas UNAM',         short: 'PUM', color: '#F7AC1C', text: '#002668', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/233.png',   stadium: 'Estadio Olímpico Universitario' },
  { id: 'tigres',    name: 'Tigres UANL',        short: 'TIG', color: '#FFB300', text: '#003470', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/232.png',   stadium: 'Estadio Universitario' },
  { id: 'monterrey', name: 'Monterrey',          short: 'MTY', color: '#0562BB', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/220.png',   stadium: 'Estadio BBVA' },
  { id: 'santos',    name: 'Santos Laguna',      short: 'SAN', color: '#00A94F', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/225.png',   stadium: 'Estadio Corona' },
  { id: 'toluca',    name: 'Toluca',             short: 'TOL', color: '#CC0000', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/223.png',   stadium: 'Estadio Nemesio Díez' },
  { id: 'atlas',     name: 'Atlas FC',           short: 'ATL', color: '#7B0000', text: '#F5A623', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/216.png',   stadium: 'Estadio Jalisco' },
  { id: 'necaxa',    name: 'Necaxa',             short: 'NEC', color: '#CC0000', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/229.png',   stadium: 'Estadio Victoria' },
  { id: 'mazatlan',  name: 'Atlante',            short: 'ATE', color: '#003087', text: '#800020', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/226.png',   stadium: 'Estadio Azteca/Banorte',        extraStadiums: ['Estadio Azteca/Banorte', 'Estadio Azteca'] },
  { id: 'juarez',    name: 'FC Juárez',          short: 'JUA', color: '#BE1522', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/17851.png', stadium: 'Estadio Olímpico Benito Juárez' },
  { id: 'queretaro', name: 'Querétaro',          short: 'QRO', color: '#0C3F87', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/222.png',   stadium: 'Estadio La Corregidora' },
  { id: 'tijuana',   name: 'Club Tijuana',       short: 'TIJ', color: '#1A1A1A', text: '#CC0000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/10125.png', stadium: 'Estadio Caliente' },
  { id: 'sanluis',   name: 'Atlético San Luis',  short: 'ASL', color: '#C8102E', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/15720.png', stadium: 'Estadio Alfonso Lastras' },
  { id: 'leon',      name: 'León',               short: 'LEO', color: '#006847', text: '#F7D321', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/228.png',   stadium: 'Estadio Nou Camp León' },
  { id: 'pachuca',   name: 'Pachuca',            short: 'PAC', color: '#1B3FA0', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/234.png',   stadium: 'Estadio Hidalgo' },
  { id: 'puebla',    name: 'Puebla',             short: 'PUE', color: '#0B2E6F', text: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/231.png',   stadium: 'Estadio Cuauhtémoc' },
]

export const LIGA_MX_TEAMS_ALPHA = [...LIGA_MX_TEAMS].sort((a, b) => a.name.localeCompare(b.name, 'es'))

export function getTeamById(id) {
  return LIGA_MX_TEAMS.find(t => t.id === id) || null
}
