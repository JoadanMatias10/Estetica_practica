import nodemailer from 'nodemailer'

const REQUIRED_ENV_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM']

const validateConfig = () => {
  const missing = REQUIRED_ENV_VARS.filter((envVar) => !process.env[envVar])

  if (missing.length) {
    throw new Error(`Faltan variables de entorno para configurar el correo: ${missing.join(', ')}`)
  }
}

const createTransporter = () => {
  validateConfig()

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  })
}

let transporter

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter()
  }

  return transporter
}

export const sendTwoFactorCodeEmail = async ({ to, code, nombre }) => {
  if (!to || !code) {
    throw new Error('El destinatario y el código son obligatorios para enviar el correo 2FA.')
  }

  const greetingName = nombre ? `Hola ${nombre},` : 'Hola,'

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Tu código de verificación',
    text: `${greetingName}\n\nTu código de verificación es: ${code}\nEste código expirará en 10 minutos.`,
    html: `
      <p>${greetingName}</p>
      <p>Tu código de verificación es:</p>
      <h2 style="font-size: 28px; letter-spacing: 6px;">${code}</h2>
      <p>Este código expirará en 10 minutos.</p>
    `
  }

  await getTransporter().sendMail(mailOptions)
}