export interface EmailAction {
  label: string
  url: string
}

export interface EmailBody {
  subject: string
  paragraphs: readonly string[]
  action?: EmailAction
  unsubscribeUrl?: string
}

export interface RenderedEmail {
  text: string
  html: string
}

const FONT = 'Arial, Helvetica, sans-serif'
const LOGO_CID = 'rosti-logo'

export function joinAppUrl(appUrl: string, path: string): string {
  const base = appUrl.replace(/\/$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}${suffix}`
}

/**
 * Builds the plain-text and HTML versions of a Rösti email.
 * Callers pass plain sentences. This function escapes them.
 */
export function renderEmail(input: EmailBody & { appUrl: string }): RenderedEmail {
  const appUrl = input.appUrl.replace(/\/$/, '')
  const preferencesUrl = joinAppUrl(appUrl, '/notifications')
  const reason = input.unsubscribeUrl
    ? 'Tu reçois cet email parce que les notifications Rösti sont activées.'
    : 'Tu reçois cet email suite à une action sur ton compte Rösti.'

  return {
    text: renderText({ ...input, appUrl, preferencesUrl, reason }),
    html: renderHtml({ ...input, appUrl, preferencesUrl, reason }),
  }
}

function renderText(
  input: EmailBody & { appUrl: string; preferencesUrl: string; reason: string },
): string {
  const lines = [...input.paragraphs, '']
  if (input.action) {
    lines.push(`${input.action.label} : ${input.action.url}`, '')
  }
  lines.push(`Ouvrir Rösti : ${input.appUrl}`)
  if (input.unsubscribeUrl) {
    lines.push(`Se désinscrire : ${input.unsubscribeUrl}`)
  } else {
    lines.push(`Gérer les notifications : ${input.preferencesUrl}`)
  }
  lines.push('', input.reason)
  return lines.join('\n')
}

function renderHtml(
  input: EmailBody & { appUrl: string; preferencesUrl: string; reason: string },
): string {
  const preview = escapeHtml(input.paragraphs[0] ?? '')
  const paragraphs = input.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.5;color:#1c1917;">${escapeHtml(paragraph).replaceAll('\n', '<br>')}</p>`,
    )
    .join('')
  const button = input.action ? renderButton(input.action) : ''
  const unsubscribe = input.unsubscribeUrl
    ? footerLink('Se désinscrire', input.unsubscribeUrl)
    : footerLink('Gérer les notifications', input.preferencesUrl)

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rösti</title>
</head>
<body style="margin:0;padding:0;background:#f7f3ef;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preview}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ef;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;">
          <tr>
            <td align="center" style="padding:28px 32px 8px;">
              <img src="cid:${LOGO_CID}" width="48" height="48" alt="Rösti" style="display:block;border:0;outline:none;text-decoration:none;">
              <p style="margin:12px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.2;color:#C74209;">Rösti</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 8px;">
              ${paragraphs}
              ${button}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;">
              <p style="margin:0 0 8px;font-family:${FONT};font-size:13px;line-height:1.5;color:#78716c;">
                ${footerLink('Ouvrir Rösti', input.appUrl)}
                &nbsp;·&nbsp;
                ${unsubscribe}
              </p>
              <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.5;color:#a8a29e;">${escapeHtml(input.reason)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function renderButton(action: EmailAction): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;">
    <tr>
      <td bgcolor="#C74209" style="border-radius:8px;">
        <a href="${escapeHtml(action.url)}" style="display:inline-block;padding:12px 20px;font-family:${FONT};font-size:15px;line-height:1.2;color:#ffffff;text-decoration:none;">${escapeHtml(action.label)}</a>
      </td>
    </tr>
  </table>`
}

function footerLink(label: string, url: string): string {
  return `<a href="${escapeHtml(url)}" style="color:#C74209;text-decoration:underline;">${escapeHtml(label)}</a>`
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
