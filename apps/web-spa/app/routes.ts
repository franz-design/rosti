import type { RouteConfig } from '@react-router/dev/routes'
import { index, layout, route } from '@react-router/dev/routes'

export default [
  index('features/home/home-redirect.tsx'),
  layout('features/dashboard/dashboard-page.tsx', [
    route('dashboard', 'features/clubs/clubs-page.tsx'),
    route('club-settings', 'features/clubs/club-settings-page.tsx'),
    route('matches', 'features/matches/matches-page.tsx'),
    route('matches/new', 'features/matches/create-match-page.tsx'),
    route('matches/:matchId', 'features/matches/match-detail-page.tsx'),
    route('seasons', 'features/seasons/seasons-page.tsx'),
    route('seasons/:seasonId/stats', 'features/stats/season-stats-page.tsx'),
    route('dashboard/profile', 'features/profile/profile-page.tsx'),
  ]),
  layout('features/auth/auth-layout.tsx', [
    route('login', 'features/auth/auth-login-page.tsx'),
    route('register', 'features/auth/auth-register-page.tsx'),
    route('verify-email', 'features/auth/auth-verify-email-page.tsx'),
    route('forgot-password', 'features/auth/auth-forgot-password-page.tsx'),
    route('reset-password', 'features/auth/auth-reset-password-page.tsx'),
    route('rejoindre', 'features/clubs/join-club-page.tsx'),
    route('onboarding', 'features/onboarding/onboarding-page.tsx'),
  ]),
  route('invite/:invitationId', 'features/clubs/invite-page.tsx'),
] satisfies RouteConfig
