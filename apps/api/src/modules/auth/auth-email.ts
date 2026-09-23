import { joinAppUrl } from '../email/email-layout'

export function resetPasswordEmail(input: { name: string; appUrl: string; token: string }) {
  return {
    subject: 'Choisis un nouveau mot de passe',
    paragraphs: [
      `Bonjour ${input.name},`,
      'Tu as demandé à changer ton mot de passe. Le bouton ci-dessous te mène à la page pour en choisir un nouveau.',
    ],
    action: {
      label: 'Choisir un mot de passe',
      url: joinAppUrl(input.appUrl, `/reset-password?token=${encodeURIComponent(input.token)}`),
    },
  }
}

export function verificationEmail(input: { name: string; appUrl: string; token: string }) {
  return {
    subject: 'Confirme ton adresse email',
    paragraphs: [
      `Bonjour ${input.name},`,
      'Confirme ton adresse email pour utiliser Rösti.',
    ],
    action: {
      label: 'Confirmer mon adresse',
      url: joinAppUrl(input.appUrl, `/verify-email?token=${encodeURIComponent(input.token)}`),
    },
  }
}

export function invitationEmail(input: {
  appUrl: string
  invitationId: string
  email: string
  clubName: string
  inviterName: string
}) {
  const url = joinAppUrl(
    input.appUrl,
    `/invite/${input.invitationId}?email=${encodeURIComponent(input.email)}&club=${encodeURIComponent(input.clubName)}`,
  )
  return {
    subject: `${input.inviterName} t'invite dans ${input.clubName}`,
    paragraphs: [
      'Bonjour,',
      `${input.inviterName} t'invite à rejoindre ${input.clubName} sur Rösti.`,
    ],
    action: {
      label: 'Rejoindre le club',
      url,
    },
  }
}
