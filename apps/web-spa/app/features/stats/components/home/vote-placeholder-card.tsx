import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

interface VotePlaceholderCardProps {
  matchId: string
}

export function VotePlaceholderCard({ matchId }: VotePlaceholderCardProps) {
  const { t } = useTranslation()

  return (
    <Link
      to={`/matches/${matchId}`}
      className="flex aspect-[668/1024] w-full flex-col items-center justify-center gap-4 rounded-[1.75rem] border-2 border-dashed border-muted-foreground/40 bg-card px-6 text-center transition-colors hover:border-primary hover:bg-accent/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <p className="font-display text-lg leading-snug font-semibold">
        {t('home.stats.card.votePrompt')}
      </p>
      <span className="text-sm font-medium text-primary underline-offset-4">
        {t('home.viewMatch')}
      </span>
    </Link>
  )
}
