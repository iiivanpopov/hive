export interface MailOptions {
  from: string
  to: string
  subject: string
  html: string
}

export interface Transporter {
  sendMail: (options: MailOptions) => Promise<any>
}

export class MailService {
  constructor(
    private readonly transporter: Transporter,
  ) {}

  async sendMail(options: MailOptions) {
    await this.transporter.sendMail(options)
  }
}
