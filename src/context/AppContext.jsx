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

  const persistData = useCallback((data) => {
    api.saveData(data).catch(() => {})
  }, [])

  const updateCurrentTorneo = useCallback((torneo) => {
    setTorneoData(prev => {
      const torneos = prev.torneos.map(t => t.id === torneo.id ? torneo : t)
      const next = { ...prev, torneos }
      persistData(next)
      return next
    })
  }, [persistData])

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
      persistData(next)
      return next
    })
    return torneo
  }, [persistData])

  const deleteTorneo = useCallback((tid) => {
    setTorneoData(prev => {
      const torneos = prev.torneos.filter(t => t.id !== tid)
      const torneoActualId = prev.torneoActualId === tid ? (torneos[0]?.id || null) : prev.torneoActualId
      const next = { torneoActualId, torneos }
      persistData(next)
      return next
    })
  }, [persistData])

  const renameTorneo = useCallback((tid, nombre) => {
    setTorneoData(prev => {
      const torneos = prev.torneos.map(t => t.id === tid ? { ...t, nombre, season: nombre } : t)
      const next = { ...prev, torneos }
      persistData(next)
      return next
    })
  }, [persistData])

  const setTorneoActual = useCallback((tid) => {
    setTorneoData(prev => {
      const next = { ...prev, torneoActualId: tid }
      persistData(next)
      return next
    })
  }, [persistData])

  const login = useCallback(async (user) => {
    setAuthUser(user)
    const data = await api.loadData()
    const patched = patchTorneoData(data)
    setTorneoData(patched)
    return patched
  }, [])

  const logout = useCallback(() => {
    api.clearToken()
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
