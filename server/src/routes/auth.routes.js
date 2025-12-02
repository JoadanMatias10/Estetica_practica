import { Router } from 'express'
import {
  login,
  verifyTwoFactor,
  recoverPassword,
  resetPassword,
  loginWithGoogle,
} from '../controllers/auth.controller.js'


const router = Router()

router.post('/login', login)
router.post('/verify', verifyTwoFactor)
router.post('/recover', recoverPassword)
router.post('/reset', resetPassword)
router.post('/google', loginWithGoogle)

export default router