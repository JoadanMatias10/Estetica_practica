import nodemailer from 'nodemailer'

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
} = process.env

const port = Number(SMTP_PORT || 465)
const secure = String(SMTP_SECURE).toLowerCase() === 'true'

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
  logger: true,
  debug: true,
})

export async function verifyMailer() {
  return transporter.verify()
}

verifyMailer().catch((error) => {
  console.error('No se pudo verificar el transporter SMTP al iniciar:', error)
})