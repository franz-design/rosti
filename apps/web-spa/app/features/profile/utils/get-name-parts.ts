interface ProfileUser {
  id?: string
  name?: string | null
  email?: string | null
  firstName?: string | null
  lastName?: string | null
}

export interface ProfileNameParts {
  firstName: string
  lastName: string
}

export function getNameParts(user: ProfileUser | undefined): ProfileNameParts {
  if (user?.firstName || user?.lastName) {
    return {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    }
  }

  const parts = (user?.name ?? '').trim().split(/\s+/).filter(Boolean)

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  }
}

export function getProfileDisplayName(
  user: ProfileUser | undefined,
  fallback: string,
): string {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.name ||
    user?.email ||
    fallback
  )
}

export function getProfileInitials(displayName: string): string {
  return displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export type { ProfileUser }
