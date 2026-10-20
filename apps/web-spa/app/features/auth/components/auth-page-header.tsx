import * as React from 'react'

interface AuthPageHeaderProps {
  title: string
  description: string
}

export const AuthPageHeader: React.FC<AuthPageHeaderProps> = ({ title, description }) => (
  <div className="space-y-2">
    <h1 className="font-logo text-[1.75rem] leading-tight font-medium tracking-tight text-foreground">
      {title}
    </h1>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
)
