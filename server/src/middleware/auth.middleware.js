import jwt from 'jsonwebtoken'
//nuevo
import UserSession from '../models/UserSession.js'
//-----------------------------

//export const requireAuth = (req, res, next) => {
  export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token no proporcionado.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
    //nuevo
    const sessionId = decoded.sessionId || decoded.jti

    if (!sessionId) {
      return res.status(401).json({ message: 'Sesión inválida o cerrada. Inicia sesión nuevamente.' })
    }

    const session = await UserSession.findOne({ sessionId })

    if (!session || session.revokedAt) {
      return res.status(401).json({ message: 'Sesión inválida o cerrada. Inicia sesión nuevamente.' })
    }
    //------------------

    req.user = decoded
    //NUEVO
    req.sessionId = sessionId
    req.userSession = session
    //--------------------

    return next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado, por favor inicia sesión de nuevo' })
    }

    return res.status(401).json({ message: 'Token inválido.' })
  }
}

export const requireRole = (...allowedRoles) => (req, res, next) => {
  const userRole = req.user?.role

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ message: 'Acceso denegado. No tienes permisos para este recurso.' })
  }

  return next()
}