import { Button } from '@rosti/ui/components/primitives/button'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useClub } from '@/features/clubs/hooks/club-context'
import { fetchPlayerDetailQueryOptions } from '@/features/players/utils/players-queries'
import { authClient } from '@/lib/auth-client'

export function HomeSkillsPrompt() {
  const { t } = useTranslation()
  const { activeClub } = useClub()
  const { data: session } = authClient.useSession()
  const organizationId = activeClub?.id
  const userId = session?.user?.id

  const {
    data: player,
    isLoading,
    isError,
  } = useQuery({
    ...fetchPlayerDetailQueryOptions(organizationId ?? '', userId ?? ''),
    enabled: !!organizationId && !!userId,
  })

  const ratings = player?.skillRatings
  const hasFilledSkill = ratings?.skills.some((skill) => skill.value > 0) ?? false
  if (!organizationId || !userId || isLoading || isError || !ratings || hasFilledSkill) return null

  return <Button render={<Link to="/profile?tab=skills" />}>{t('home.skillsPrompt')}</Button>
}
