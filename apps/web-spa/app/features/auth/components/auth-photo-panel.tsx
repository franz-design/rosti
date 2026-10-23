import authPicture from '@/assets/images/auth/auth-picture.png'
import { useTranslation } from 'react-i18next'
import { AuthSportList } from './auth-sport-list'

const FEATURE_LINE_KEYS = [
  'auth.photo.lineAttendance',
  'auth.photo.lineLineup',
  'auth.photo.lineFees',
] as const

interface AuthPhotoPanelProps {
  headline: string
  sentence: string
  showSports?: boolean
}

export function AuthPhotoPanel({ headline, sentence, showSports = false }: AuthPhotoPanelProps) {
  const { t } = useTranslation()

  return (
    <section
      aria-label={t('auth.photo.regionLabel')}
      className="relative h-[38vh] min-h-64 shrink-0 overflow-hidden bg-[#0e1513] min-[1100px]:m-4 min-[1100px]:h-auto min-[1100px]:min-h-0 min-[1100px]:flex-1 min-[1100px]:rounded-xl"
    >
      <img
        src={authPicture}
        alt={t('auth.photo.alt')}
        className="absolute inset-0 size-full object-cover object-[50%_62%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-black/0 min-[1100px]:bg-linear-to-r min-[1100px]:from-black/50 min-[1100px]:via-black/20 min-[1100px]:to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 hidden h-2/3 bg-linear-to-t from-black/60 to-transparent min-[1100px]:block"
      />

      <div className="absolute inset-x-0 bottom-0 p-6 min-[1100px]:max-w-xl min-[1100px]:p-12">
        <h2
          key={headline}
          className="font-logo text-3xl leading-[1.05] font-medium tracking-tight text-balance text-white motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-500 min-[1100px]:text-[3.25rem]"
        >
          {headline}
        </h2>
        <p
          key={sentence}
          className="mt-3 max-w-md text-sm leading-relaxed text-pretty text-white/85 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-700 min-[1100px]:mt-4 min-[1100px]:text-base"
        >
          {sentence}
        </p>
        {showSports ? (
          <AuthSportList tone="onDark" className="mt-4 hidden max-w-md min-[1100px]:flex" />
        ) : null}
        <ul className="mt-8 hidden max-w-xs min-[1100px]:block">
          {FEATURE_LINE_KEYS.map((key) => (
            <li key={key} className="border-t border-white/20 py-2.5 text-sm text-white/85">
              {t(key)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
