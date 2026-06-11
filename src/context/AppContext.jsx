import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import * as api from '../api/client'
import { initialLiguilla, ensureLiguillaFields } from '../utils/liguilla'

const AppContext = createContext(null)

function patchTorneoData(data) {
  if (!data) return { torneoActualId: null, torneos: [] }
  return {
    ...data,
    torneos: (data.torneos || []).map(ensureLiguillaFields),
  }
}

export function AppProvider({ children }) {
  const [authUser, setAuthUser] = useState(null)
  const [torneoData, setTorneoData] = useState({ torneoActualId: null, torneos: [] })
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)

  const currentTorneo = useMemo(
    () => torneoData.torneos.find(t => t.id === torneoData.torneoActualId) || torneoData.torneos[0] || null,
    [torneoData]
  )

  const persistData = useCallback((data, userId) => {
    localStorage.setItem(`liga-mx-data-${userId}`, JSON.stringify(data))
    api.saveData(data).catch(() => {})
  }, [])

  const updateCurrentTorneo = useCallback((torneo) => {
    setTorneoData(prev => {
      const torneos = prev.torneos.map(t => t.id === torneo.id ? torneo : t)
      const next = { ...prev, torneos }
      if (authUser) persistData(next, authUser.id)
      return next
    })
  }, [authUser, persistData])

  const createTorneo = useCallback((nombre) => {
    const torneo = {
      id: `t${Date.now()}`,
      nombre: nombre.trim(),
      season: nombre.trim(),
      jornadas: [],
      liguilla: initialLiguilla(),
      _nj: 1, _np: 1,
    }
    setTorneoData(prev => {
      const torneos = [...prev.torneos, torneo]
      const torneoActualId = prev.torneoActualId || torneo.id
      const next = { torneoActualId, torneos }
      if (authUser) persistData(next, authUser.id)
      return next
    })
    return torneo
  }, [authUser, persistData])

  const deleteTorneo = useCallback((tid) => {
    setTorneoData(prev => {
      const torneos = prev.torneos.filter(t => t.id !== tid)
      const torneoActualId = prev.torneoActualId === tid ? (torneos[0]?.id || null) : prev.torneoActualId
      const next = { torneoActualId, torneos }
      if (authUser) persistData(next, authUser.id)
      return next
    })
  }, [authUser, persistData])

  const renameTorneo = useCallback((tid, nombre) => {
    setTorneoData(prev => {
      const torneos = prev.torneos.map(t => t.id === tid ? { ...t, nombre, season: nombre } : t)
      const next = { ...prev, torneos }
      if (authUser) persistData(next, authUser.id)
      return next
    })
  }, [authUser, persistData])

  const setTorneoActual = useCallback((tid) => {
    setTorneoData(prev => {
      const next = { ...prev, torneoActualId: tid }
      if (authUser) persistData(next, authUser.id)
      return next
    })
  }, [authUser, persistData])

  const login = useCallback(async (user) => {
    setAuthUser(user)

    // Load from server first
    const serverData = await api.loadData()

    // Fallback to localStorage cache
    let localData = null
    try {
      const raw = localStorage.getItem(`liga-mx-data-${user.id}`)
      if (raw) localData = JSON.parse(raw)
    } catch {}

    let data
    if (serverData?.torneos !== undefined) {
      if (serverData.torneos.length || !localData?.torneos?.length) {
        data = serverData
      } else {
        data = localData
        api.saveData(localData).catch(() => {})
      }
    } else {
      data = localData
    }

    // Migration from old v1 format
    if (!data?.torneos?.length) {
      try {
        const v1 = localStorage.getItem('liga-mx-v1')
        if (v1) {
          const old = JSON.parse(v1)
          if (old.jornadas?.length) {
            const torneo = {
              id: `t${Date.now()}`,
              nombre: old.season || 'Clausura 2026',
              season: old.season || 'Clausura 2026',
              jornadas: old.jornadas,
              liguilla: old.liguilla || initialLiguilla(),
              _nj: old._nj || 1, _np: old._np || 1,
            }
            data = { torneoActualId: torneo.id, torneos: [torneo] }
            localStorage.removeItem('liga-mx-v1')
          }
        }
      } catch {}
    }

    const patched = patchTorneoData(data)
    if (authUser) localStorage.setItem(`liga-mx-data-${user.id}`, JSON.stringify(patched))
    setTorneoData(patched)
    return patched
  }, [authUser])

  const logout = useCallback(() => {
    api.clearToken()
    localStorage.removeItem('liga-mx-session')
    setAuthUser(null)
    setTorneoData({ torneoActualId: null, torneos: [] })
  }, [])

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const confirm = useCallback((msg, title = 'Confirmar acción', okLabel = 'Eliminar', okClass = 'btn-danger') => {
    return new Promise(resolve => {
      setConfirmState({ msg, title, okLabel, okClass, resolve })
    })
  }, [])

  const resolveConfirm = useCallback((result) => {
    setConfirmState(prev => {
      prev?.resolve(result)
      return null
    })
  }, [])

  return (
    <AppContext.Provider value={{
      authUser, setAuthUser,
      torneoData, currentTorneo,
      updateCurrentTorneo, createTorneo, deleteTorneo, renameTorneo, setTorneoActual,
      login, logout,
      addToast,
      confirm,
      toasts,
      confirmState, resolveConfirm,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
