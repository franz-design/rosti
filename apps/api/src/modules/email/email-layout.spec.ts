import { renderEmail } from './email-layout'

describe('renderEmail', () => {
  it('escapes the body and keeps a real plain-text version', () => {
    const actual = renderEmail({
      subject: 'Essai',
      paragraphs: ['Bonjour <ami>'],
      appUrl: 'https://app.lesk.fr',
      action: { label: 'Voir le match', url: 'https://app.lesk.fr/matches/1' },
      unsubscribeUrl: 'https://api.lesk.fr/api/notifications/unsubscribe?token=abc',
    })

    expect(actual.html).toContain('Bonjour &lt;ami&gt;')
    expect(actual.html).toContain('src="cid:rosti-logo"')
    expect(actual.html).toContain('https://app.lesk.fr/matches/1')
    expect(actual.html).toContain('Se désinscrire')
    expect(actual.text).toContain('Bonjour <ami>')
    expect(actual.text).not.toContain('<br')
    expect(actual.text).toContain('Voir le match : https://app.lesk.fr/matches/1')
    expect(actual.text).toContain(
      'Se désinscrire : https://api.lesk.fr/api/notifications/unsubscribe?token=abc',
    )
  })

  it('links to notification settings when the email is not a notification', () => {
    const actual = renderEmail({
      subject: 'Mot de passe',
      paragraphs: ['Bonjour'],
      appUrl: 'https://app.lesk.fr/',
    })

    expect(actual.html).toContain('https://app.lesk.fr/notifications')
    expect(actual.html).toContain('Gérer les notifications')
    expect(actual.html).not.toContain('Se désinscrire')
  })
})
