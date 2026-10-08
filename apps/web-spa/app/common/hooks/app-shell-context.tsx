import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

interface AppShellContextValue {
  /** Content owns the full main area: no padding, no scrolling above it. */
  isFullBleed: boolean
  setFullBleed: (value: boolean) => void
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [isFullBleed, setFullBleed] = useState(false)

  const value = useMemo(() => ({ isFullBleed, setFullBleed }), [isFullBleed])

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
}

export function useAppShell() {
  const ctx = useContext(AppShellContext)
  if (!ctx) throw new Error('useAppShell must be used within AppShellProvider')
  return ctx
}

/**
 * Lets a page take over the whole main area, and hands it back on unmount.
 */
export function useFullBleedShell(enabled: boolean) {
  const { setFullBleed } = useAppShell()

  useEffect(() => {
    setFullBleed(enabled)
    return () => setFullBleed(false)
  }, [enabled, setFullBleed])
}
