import React, { useState } from 'react'
import Landing from './pages/Landing'
import Session from './pages/Session'

export default function App() {
  const [route, setRoute] = useState(() => window.location.hash || '#/')
  React.useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (route.startsWith('#/session/')) {
    const id = route.replace('#/session/', '')
    return <Session sessionId={id} />
  }
  return <Landing />
}
