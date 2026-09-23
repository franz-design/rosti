import { Test, TestingModule } from '@nestjs/testing'
import { Transporter } from 'nodemailer'
import { EmailService } from './email.service'

describe('emailService', () => {
  let service: EmailService
  let mockTransporter: Partial<Transporter>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile()

    service = module.get<EmailService>(EmailService)

    mockTransporter = {
      sendMail: vi.fn(),
      verify: vi.fn(),
    }
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendEmail', () => {
    it('wraps the text in the Rösti layout', async () => {
      const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-message-id' })
      mockTransporter.sendMail = mockSendMail
      Object.defineProperty(service, 'transporter', {
        value: mockTransporter,
        writable: true,
      })

      await service.sendEmail({
        to: 'test@example.com',
        subject: 'Nouveau match',
        paragraphs: ['Un nouveau match est prévu lundi.'],
        action: { label: 'Voir le match', url: 'https://app.lesk.fr/matches/1' },
      })

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: { name: 'Rösti', address: expect.any(String) },
          to: 'test@example.com',
          subject: 'Nouveau match',
          text: expect.stringContaining('Un nouveau match est prévu lundi.'),
          html: expect.stringContaining('src="cid:rosti-logo"'),
          attachments: [
            expect.objectContaining({
              filename: 'rosti-logo.png',
              cid: 'rosti-logo',
              contentDisposition: 'inline',
            }),
          ],
        }),
      )
      const html = mockSendMail.mock.calls[0][0].html as string
      const text = mockSendMail.mock.calls[0][0].text as string
      expect(html).toContain('Un nouveau match est prévu lundi.')
      expect(text).not.toContain('<p')
      expect(mockSendMail.mock.calls[0][0].headers).toBeUndefined()
    })

    it('adds the one-click unsubscribe header', async () => {
      const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-message-id' })
      mockTransporter.sendMail = mockSendMail
      Object.defineProperty(service, 'transporter', {
        value: mockTransporter,
        writable: true,
      })

      await service.sendEmail({
        to: 'test@example.com',
        subject: 'Nouveau match',
        paragraphs: ['Bonjour'],
        unsubscribeUrl: 'https://api.lesk.fr/api/notifications/unsubscribe?token=abc',
      })

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'List-Unsubscribe':
              '<https://api.lesk.fr/api/notifications/unsubscribe?token=abc>',
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
      )
    })
  })

  describe('verifyConnection', () => {
    it('should return true when connection is verified', async () => {
      const mockVerify = vi.fn().mockResolvedValue(true)
      mockTransporter.verify = mockVerify

      Object.defineProperty(service, 'transporter', {
        value: mockTransporter,
        writable: true,
      })

      const result = await service.verifyConnection()

      expect(result).toBe(true)
      expect(mockVerify).toHaveBeenCalled()
    })

    it('should return false when connection verification fails', async () => {
      const mockVerify = vi.fn().mockRejectedValue(new Error('Connection failed'))
      mockTransporter.verify = mockVerify

      Object.defineProperty(service, 'transporter', {
        value: mockTransporter,
        writable: true,
      })

      const result = await service.verifyConnection()

      expect(result).toBe(false)
      expect(mockVerify).toHaveBeenCalled()
    })
  })
})
