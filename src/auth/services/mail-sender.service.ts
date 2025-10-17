import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'
import { join } from 'path'
dotenv.config()

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.AWS_SES_HOST,
    auth: {
      user: process.env.AWS_SES_SMTP_USER,
      pass: process.env.AWS_SES_SMTP_PASS,
    },
  })

  /**
   * Send email with optional bcc.
   * @param to - Recipient email address(es)
   * @param subject - Email subject
   * @param html - Email HTML content
   * @param options - Optional options object: { sendBcc?: boolean, bcc?: string }
   *   - If sendBcc is true, bcc will be set (to options.bcc or process.env.EMAIL_ADMIN)
   *   - If sendBcc is false or omitted, bcc will not be included
   */
  async sendEmail({
    to,
    subject,
    html,
    options,
  }: {
    to: string | string[]
    subject: string
    html: string
    options?: { sendBcc?: boolean; bcc?: string }
  }) {
    const mailOptions: any = {
      from: `${process.env.BRAND_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    }

    if (options?.sendBcc) {
      mailOptions.bcc = options.bcc || process.env.EMAIL_ADMIN
    }

    await this.transporter.sendMail(mailOptions)
  }
}
