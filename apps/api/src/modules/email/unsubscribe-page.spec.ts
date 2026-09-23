import { renderUnsubscribePage } from './unsubscribe-page'
import { signUnsubscribeToken } from './unsubscribe-token'

describe('renderUnsubscribePage', () => {
  it('asks for a click before turning emails off', () => {
    const token = signUnsubscribeToken('4f3b1c2a-8d7e-4a6b-9c0d-1e2f3a4b5c6d', 'secret')
    const actual = renderUnsubscribePage({ kind: 'confirm', token })

    expect(actual).toContain('<form method="post"')
    expect(actual).toContain('Me désinscrire')
    expect(actual).not.toContain('C\'est noté')
  })

  it('does not offer a button for a broken link', () => {
    const actual = renderUnsubscribePage({ kind: 'invalid' })

    expect(actual).toContain("n'est pas valide")
    expect(actual).not.toContain('<form')
  })
})
