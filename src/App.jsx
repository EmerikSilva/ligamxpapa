import { useState, useEffect, useMemo } from 'react'
import { useApp } from './context/AppContext'

import AuthScreen      from './components/auth/AuthScreen'
import Header          from './components/layout/Header'
import Nav             from './components/layout/Nav'
import ToastContainer  from './components/ui/Toast'
import ConfirmDialog   from './components/ui/ConfirmDialog'

import TablaTab        from './components/tabs/TablaTab'
import JornadasTab     from './components/tabs/JornadasTab'
import LiguillaTab     from './components/tabs/LiguillaTab'
import GraficasTab     from './components/tabs/GraficasTab'

import TorneosModal    from './components/modals/TorneosModal'
import ProfileModal    from './components/modals/ProfileModal'
import WelcomeModal    from './components/modals/WelcomeModal'
import Tour            from './components/tour/Tour'

export default function App() {
  const { authUser, currentTorneo, toasts, confirmState, resolveConfirm } = useApp()

  const [tab,         setTab]         = useState('tabla')
  const [torneosOpen, setTorneosOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const [tourActive,  setTourActive]  = useState(false)
  const [tourStep,    setTourStep]    = useState(0)

  // Show welcome modal on first login when no torneos exist
  useEffect(() => {
    if (authUser && currentTorneo === null) {
      setWelcomeOpen(true)
    }
  }, [authUser])

  const { totalJornadas, totalJugados } = useMemo(() => {
    const jornadas = currentTorneo?.jornadas || []
    const jugados  = jornadas.reduce((n, j) => n + (j.partidos || []).filter(p => p.jugado).length, 0)
    return { totalJornadas: jornadas.length, totalJugados: jugados }
  }, [currentTorneo])

  if (!authUser) return <AuthScreen />

  function startTour() {
    setWelcomeOpen(false)
    setTourStep(0)
    setTourActive(true)
  }

  function endTour() {
    setTourActive(false)
  }

  return (
    <>
      <Header
        onOpenTorneos={() => setTorneosOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        totalJornadas={totalJornadas}
        totalJugados={totalJugados}
      />

      <Nav activeTab={tab} onTabChange={setTab} />

      <main className="main">
        <div className="container">
          <TablaTab    isActive={tab === 'tabla'} />
          <JornadasTab isActive={tab === 'jornadas'} />
          <LiguillaTab isActive={tab === 'liguilla'} />
          <GraficasTab isActive={tab === 'graficas'} />
        </div>
      </main>

      <TorneosModal isOpen={torneosOpen} onClose={() => setTorneosOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      <WelcomeModal
        isOpen={welcomeOpen}
        onClose={() => setWelcomeOpen(false)}
        onTour={startTour}
      />

      <Tour
        isActive={tourActive}
        step={tourStep}
        onNext={() => setTourStep(s => s + 1)}
        onPrev={() => setTourStep(s => s - 1)}
        onEnd={endTour}
        onTabChange={setTab}
      />

      <ToastContainer toasts={toasts} />

      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          msg={confirmState.msg}
          okLabel={confirmState.okLabel}
          okClass={confirmState.okClass}
          onConfirm={() => resolveConfirm(true)}
          onCancel={() => resolveConfirm(false)}
        />
      )}
    </>
  )
}
