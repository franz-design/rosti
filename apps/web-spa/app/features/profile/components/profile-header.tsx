import { useTranslation } from 'react-i18next'

export function ProfileHeader() {
  const { t } = useTranslation()

  return (
    <div className="border-b border-border pb-6">
      <p className="mb-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
        {t('profile.eyebrow')}
      </p>
      <h1 className="text-3xl font-black tracking-tight text-foreground">
        {t('profile.title')}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t('profile.description')}</p>
    </div>
  )
}
