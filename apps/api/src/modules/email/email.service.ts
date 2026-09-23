import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Traceable } from '@amplication/opentelemetry-nestjs'
import { Injectable, Logger } from '@nestjs/common'
import { createTransport, Transporter } from 'nodemailer'
import { config } from '../../config/env.config'
import { EmailBody, renderEmail } from './email-layout'

const LOGO_CID = 'rosti-logo'

interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  auth?: {
    user: string
    pass: string
  }
}

export interface EmailMessage extends EmailBody {
  to: string
}

@Traceable()
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter: Transporter
  private logo: Buffer | undefined

  constructor() {
    const transportConfig: SmtpConfig = {
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
    }

    if (config.email.user && config.email.password) {
      transportConfig.auth = {
        user: config.email.user,
        pass: config.email.password,
      }
    }

    this.transporter = createTransport(transportConfig)
  }

  /**
   * Sends one Rösti email. The body is plain text; the layout adds the logo,
   * the HTML version, the app link, and the unsubscribe link when provided.
   */
  async sendEmail(message: EmailMessage): Promise<void> {
    const appUrl = config.clients.webApp.url.replace(/\/$/, '')
    const rendered = renderEmail({ ...message, appUrl })
    const subject = message.subject.replace(/[\r\n]/g, ' ').trim()

    try {
      const info = await this.transporter.sendMail({
        from: { name: 'Rösti', address: config.email.from },
        to: message.to,
        subject,
        text: rendered.text,
        html: rendered.html,
        attachments: [
          {
            filename: 'rosti-logo.png',
            content: this.readLogo(),
            cid: LOGO_CID,
            contentDisposition: 'inline',
          },
        ],
        headers: message.unsubscribeUrl
          ? {
              'List-Unsubscribe': `<${message.unsubscribeUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            }
          : undefined,
      })

      this.logger.log(`Email sent successfully to ${message.to}: ${info.messageId}`)
    } catch (error) {
      this.logger.error(`Failed to send email to ${message.to}:`, error)
      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      this.logger.log('Email service connection verified successfully')
      return true
    } catch (error) {
      this.logger.error('Email service connection verification failed:', error)
      return false
    }
  }

  private readLogo(): Buffer {
    if (this.logo) return this.logo

    const nextToSource = join(dirname(fileURLToPath(import.meta.url)), 'assets', 'rosti-logo.png')
    const candidates = [
      nextToSource,
      join(process.cwd(), 'src/modules/email/assets/rosti-logo.png'),
      join(process.cwd(), 'dist/modules/email/assets/rosti-logo.png'),
      join(process.cwd(), 'apps/api/src/modules/email/assets/rosti-logo.png'),
    ]
    const path = candidates.find((candidate) => existsSync(candidate))
    if (!path) throw new Error('Rösti logo file is missing')

    this.logo = readFileSync(path)
    return this.logo
  }
}
