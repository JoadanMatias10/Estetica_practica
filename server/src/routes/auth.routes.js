import { Router } from 'express'
import {
  login,
  verifyTwoFactor,
  recoverPassword,
  resetPassword,
  loginWithGoogle,
   refreshSession,
  logout
} from '../controllers/auth.controller.js'


const router = Router()

router.post('/login', login)
router.post('/verify', verifyTwoFactor)
router.post('/recover', recoverPassword)
router.post('/reset', resetPassword)
router.post('/google', loginWithGoogle)
router.post('/refresh', refreshSession)
router.post('/logout', logout)

export default router