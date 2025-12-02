import jwt from 'jsonwebtoken'

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token no proporcionado.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })

    req.user = decoded

    return next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado, por favor inicia sesión de nuevo' })
    }

    return res.status(401).json({ message: 'Token inválido.' })
  }
}