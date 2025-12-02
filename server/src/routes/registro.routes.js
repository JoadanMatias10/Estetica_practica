import { Router } from 'express'
import { registrarUsuario } from '../controllers/registro.controller.js'
//nuevo
import { validarRegistroUsuario } from '../validators/registro.validator.js'

const router = Router()

router.post('/', registrarUsuario)
//nuevo
router.post('/', validarRegistroUsuario, registrarUsuario)

export default router