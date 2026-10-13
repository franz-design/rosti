import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { PUSH_OPEN_MESSAGE, readAppPath } from '../../worker/read-app-notification'

export function PushOpenListener() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handleMessage = (event: MessageEvent) => {
      const data: unknown = event.data
      if (!data || typeof data !== 'object' || !('type' in data)) return
      if (data.type !== PUSH_OPEN_MESSAGE || !('url' in data)) return
      const path = readAppPath(data.url)
      if (!path) return
      navigate(path)
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage)
  }, [navigate])

  return null
}
