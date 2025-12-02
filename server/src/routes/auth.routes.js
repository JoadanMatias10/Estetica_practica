import { Router } from 'express'
import {
  login,
  //NUEVO
  logout,
  //---------------------
  verifyTwoFactor,
  recoverPassword,
  resetPassword,
  verifySecretQuestion,
  loginWithGoogle,
} from '../controllers/auth.controller.js'
//NUEVO
import { requireAuth } from '../middleware/auth.middleware.js'
//-----------------


const router = Router()

router.post('/login', login)
//NUEVO
router.post('/logout', requireAuth, logout)
//----------------
router.post('/verify', verifyTwoFactor)
router.post('/recover', recoverPassword)
//NUEVO
router.post('/verify-secret-question', verifySecretQuestion)
//----------------------
router.post('/reset', resetPassword)
router.post('/google', loginWithGoogle)

export default router