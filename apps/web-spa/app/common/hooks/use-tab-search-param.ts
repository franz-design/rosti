import { useSearchParams } from 'react-router'

export function useTabSearchParam<T extends string>(
  validTabs: readonly T[],
  defaultTab: T,
): [T, (value: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab')
  const activeTab = (validTabs.includes(rawTab as T) ? rawTab : defaultTab) as T

  const setTab = (value: string) => {
    if (!validTabs.includes(value as T)) return

    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.set('tab', value)
        return next
      },
      { replace: true },
    )
  }

  return [activeTab, setTab]
}
