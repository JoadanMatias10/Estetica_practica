export const getProfile = (req, res) => {
  const userData = req.user || {}

  return res.status(200).json({
    message: 'Perfil obtenido correctamente.',
    user: {
      id: userData.sub,
      email: userData.email,
      rol: userData.role
    }
  })
}