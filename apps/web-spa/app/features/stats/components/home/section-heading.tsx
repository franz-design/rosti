import { Link } from 'react-router'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  subtitleTo?: string
}

export function SectionHeading({ title, subtitle, subtitleTo }: SectionHeadingProps) {
  return (
    <div>
      <h2 className="text-lg font-medium">{title}</h2>
      {subtitle ? (
        subtitleTo ? (
          <Link
            to={subtitleTo}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {subtitle}
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )
      ) : null}
    </div>
  )
}
