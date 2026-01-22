import { Router } from 'express'
import { register, login, getUserInfo, logout } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// 公开路由
router.post('/register', register)
router.post('/login', login)

// 需要认证的路由
router.get('/user', authMiddleware, getUserInfo)
router.post('/logout', authMiddleware, logout)

export default router

