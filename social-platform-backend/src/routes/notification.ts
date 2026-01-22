import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js'

const router = express.Router()

// 所有通知路由都需要认证
router.use(authMiddleware)

// 获取通知列表
router.get('/', getNotifications)

// 获取未读通知数量
router.get('/unread-count', getUnreadCount)

// 标记通知为已读
router.put('/:notificationId/read', markAsRead)

// 标记所有通知为已读
router.put('/read-all', markAllAsRead)

// 删除通知
router.delete('/:notificationId', deleteNotification)

export default router
