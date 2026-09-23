import { escapeHtml } from './email-layout'

export type UnsubscribePage =
  | { kind: 'invalid' }
  | { kind: 'confirm'; token: string }
  | { kind: 'done'; appUrl: string }

/**
 * Small HTML page shown when someone opens the unsubscribe link.
 * The email link only shows this page. A button posts the real change,
 * so a mail scanner that only opens links does not turn emails off.
 */
export function renderUnsubscribePage(page: UnsubscribePage): string {
  if (page.kind === 'confirm') return layout(confirmBody(page.token))
  if (page.kind === 'done') return layout(doneBody(page.appUrl))
  return layout(`<p style="margin:0;">Ce lien de désinscription n'est pas valide.</p>`)
}

function confirmBody(token: string): string {
  const action = `?token=${escapeHtml(encodeURIComponent(token))}`
  return `<p style="margin:0 0 16px;">Tu ne recevras plus les emails de notification de Rösti. Les emails de connexion, comme le mot de passe ou la confirmation d'adresse, continueront d'arriver.</p>
<form method="post" action="${action}">
  <button type="submit" style="background:#C74209;color:#ffffff;border:0;border-radius:8px;padding:12px 20px;font-size:15px;cursor:pointer;">Me désinscrire</button>
</form>`
}

function doneBody(appUrl: string): string {
  const href = escapeHtml(`${appUrl.replace(/\/$/, '')}/notifications`)
  return `<p style="margin:0 0 16px;">C'est noté. Tu ne recevras plus les emails de notification.</p>
<p style="margin:0;"><a href="${href}" style="color:#C74209;">Réactiver les emails</a></p>`
}

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rösti</title>
</head>
<body style="margin:0;padding:48px 16px;background:#f7f3ef;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
  <div style="max-width:420px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
    <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#C74209;">Rösti</p>
    ${body}
  </div>
</body>
</html>`
}
