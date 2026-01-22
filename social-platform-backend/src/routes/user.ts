import { Router } from 'express'
import { 
  updateProfile, 
  getTags, 
  updateUserTags, 
  uploadAvatar,
  activateCardKey,
  changePassword,
  getUserStats 
} from '../controllers/userController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// 所有用户路由都需要认证
router.use(authMiddleware)

router.put('/profile', updateProfile)
router.post('/avatar', uploadAvatar)
router.get('/tags', getTags) // 注意：getTags 不需要认证，但为了统一放在这里
router.post('/tags', updateUserTags)
router.post('/activate-member', activateCardKey)
router.put('/password', changePassword)
router.get('/stats', getUserStats) // 获取用户统计信息

export default router

