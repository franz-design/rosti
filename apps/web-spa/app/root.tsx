import type { Route } from './+types/root'
import { getHtmlLang, normalizeLocale } from '@rosti/i18n/config'
import { client } from '@rosti/openapi-generator'
import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { captureBrowserInstallPrompt } from '@/lib/browser-install-prompt'
import { useI18nStore } from '@/lib/i18n/i18n-client'
import { iosViewportResetScript } from '@/lib/ios-viewport-reset'
import { PushOpenListener } from '@/lib/push-open-listener'
import { queryClient } from '@/lib/query-client'
import { registerProductionServiceWorker } from '@/lib/register-service-worker'
import useTheme, { applyStoredTheme, themeInitScript } from './hooks/useTheme'
import '@/lib/i18n/i18n-client'
import '@fontsource/source-sans-pro'
import '@rosti/ui/globals.css'

captureBrowserInstallPrompt()

client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
})

const SHARE_TITLE = 'Rösti'
const SHARE_DESCRIPTION =
  'Rösti aide les clubs à planifier les matchs, collecter les RSVP et suivre la saison.'
// Slack and other link previews ignore a relative image URL. This is the public site.
const SHARE_IMAGE_URL = 'https://rosti.lesk.fr/og.png'

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
  { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon-v3.png' },
  { rel: 'manifest', href: '/manifest.webmanifest' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const [theme] = useTheme()
  const language = useI18nStore((state) => state.language)
  const { i18n } = useTranslation()
  const activeLocale = normalizeLocale(i18n.language || language)
  const htmlLang = getHtmlLang(activeLocale)

  useLayoutEffect(() => {
    applyStoredTheme()
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = htmlLang
  }, [htmlLang])

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <title>{SHARE_TITLE}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script dangerouslySetInnerHTML={{ __html: iosViewportResetScript }} />
        <meta name="theme-color" content="#c74209" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content={SHARE_TITLE} />
        <meta name="author" content={SHARE_TITLE} />
        <meta name="keywords" content="Rösti, club, match, RSVP, sport" />
        <meta name="description" content={SHARE_DESCRIPTION} />
        <meta property="og:title" content={SHARE_TITLE} />
        <meta property="og:description" content={SHARE_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rosti.lesk.fr" />
        <meta property="og:image" content={SHARE_IMAGE_URL} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={SHARE_TITLE} />
        <meta property="og:locale" content="fr_FR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SHARE_TITLE} />
        <meta name="twitter:description" content={SHARE_DESCRIPTION} />
        <meta name="twitter:image" content={SHARE_IMAGE_URL} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  useEffect(() => {
    void import('@/lib/capacitor').then((m) => m.initCapacitorNative())
    registerProductionServiceWorker()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <PushOpenListener />
      <Outlet />
    </QueryClientProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { t } = useTranslation()
  let message: string = t('error.oops')
  let details: string = t('error.default')
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : t('common.error')
    details =
      error.status === 404 ? t('error.pageNotFoundDescription') : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
