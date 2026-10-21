import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'app-theme'
const DEFAULT_THEME: Theme = 'light'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

function getThemeFromLocalStorage(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

/** Runs before paint. Reads only the stored choice, never the system preference. */
export const themeInitScript = `try{if(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})==="dark"){document.documentElement.classList.add("dark")}}catch(e){}`

export function applyStoredTheme() {
  document.documentElement.classList.toggle('dark', getThemeFromLocalStorage() === 'dark')
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener('storage', callback)
  }
}

function useTheme(): [Theme, (newTheme: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, getThemeFromLocalStorage, () => DEFAULT_THEME)

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    window.dispatchEvent(new Event('storage'))
  }

  return [theme, setTheme]
}

export default useTheme
