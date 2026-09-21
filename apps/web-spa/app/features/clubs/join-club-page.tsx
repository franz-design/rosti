import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { JoinClubForm } from './components/join/join-club-form'
import { parseInvitationId } from './utils/parse-invitation-id'

export default function JoinClubPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    const invitationId = parseInvitationId(value)
    if (!invitationId) {
      setError(t('join.invalidInvite'))
      return
    }
    setError(null)
    navigate(`/invite/${invitationId}`)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-black tracking-tight">{t('join.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('join.description')}</p>
      </div>
      <JoinClubForm
        value={value}
        error={error}
        onChange={(next) => {
          setValue(next)
          if (error) setError(null)
        }}
        onSubmit={handleSubmit}
      />
      <p className="text-center text-sm text-muted-foreground">
        {t('join.createInstead')}{' '}
        <Link to="/register?intent=create" className="font-medium text-foreground underline">
          {t('join.createClub')}
        </Link>
      </p>
      <p className="text-center text-sm">
        <Link to="/login" className="font-medium transition-colors">
          {t('join.signIn')}
        </Link>
      </p>
    </div>
  )
}
