import nodemailer from 'nodemailer'

export const smtp = nodemailer.createTransport({
  host: Bun.env.SMTP_HOST,
  port: Number(Bun.env.SMTP_PORT),
  secure: false,
  auth: {
    user: Bun.env.SMTP_USER,
    pass: Bun.env.SMTP_PASSWORD,
  },
})
