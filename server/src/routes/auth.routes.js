import { Router } from 'express'
import { login, verifyTwoFactor, recoverPassword } from '../controllers/auth.controller.js'


const router = Router()

router.post('/login', login)
router.post('/verify', verifyTwoFactor)
router.post('/recover', recoverPassword)

export default router