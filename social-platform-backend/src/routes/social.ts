import { Router } from 'express'
import { 
  searchUsers, 
  recommendUsers,
  sendFriendRequest,
  handleFriendRequest
} from '../controllers/socialController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// 所有社交相关接口都需要认证
router.use(authMiddleware)

// 搜索用户
router.get('/search', searchUsers)

// 推荐用户（基于标签匹配）
router.get('/recommend', recommendUsers)

// 发送好友申请
router.post('/friend-request', sendFriendRequest)

// 处理好友申请（接受/拒绝）
router.post('/friend-request/:requestId/handle', handleFriendRequest)

export default router
