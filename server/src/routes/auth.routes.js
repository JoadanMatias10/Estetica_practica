import { Router } from 'express'
import { login, verifyTwoFactor } from '../controllers/auth.controller.js'

const router = Router()

router.post('/login', login)
router.post('/verify', verifyTwoFactor)

export default router