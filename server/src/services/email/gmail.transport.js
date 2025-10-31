import nodemailer from 'nodemailer'

let cachedTransporter = undefined
let warnedNoCredentials = false

const normalize = (value) => (typeof value === 'string' ? value.trim() : '')

const resolveTransporter = () => {
  if (cachedTransporter !== undefined) {
    return cachedTransporter
  }

  const user = normalize(process.env.GMAIL_USER)
  const appPassword = normalize(process.env.GMAIL_APP_PASSWORD)

  if (!user || !appPassword) {
    cachedTransporter = null

    if (!warnedNoCredentials) {
      console.warn(
        'Las credenciales de Gmail no están configuradas. Define GMAIL_USER y GMAIL_APP_PASSWORD para habilitar el envío directo.'
      )
      warnedNoCredentials = true
    }

    return cachedTransporter
  }

  try {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass: appPassword
      }
    })

    warnedNoCredentials = false
    return cachedTransporter
  } catch (error) {
    console.error('No fue posible inicializar el transporte de Gmail:', error)
    cachedTransporter = null
    return cachedTransporter
  }
}

export const isGmailConfigured = () => Boolean(resolveTransporter())

export const sendWithGmail = async ({ to, subject, text, html, from }) => {
  const transporter = resolveTransporter()

  if (!transporter) {
    return false
  }

  const sender = normalize(from) || normalize(process.env.GMAIL_DEFAULT_FROM) || normalize(process.env.GMAIL_USER)

  const mailOptions = {
    to,
    subject,
    from: sender || undefined
  }

  if (text) {
    mailOptions.text = text
  }

  if (html) {
    mailOptions.html = html
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('No fue posible enviar el correo utilizando Gmail:', error)
    return false
  }
}