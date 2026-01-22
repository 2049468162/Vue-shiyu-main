import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import {
  getOrCreatePrivateConversation,
  sendMessage,
  getMessages,
  getUserConversations
} from '../controllers/messageController.js'

const router = express.Router()

// 所有消息路由都需要认证
router.use(authMiddleware)

// 获取或创建私聊会话
router.post('/conversations/private', getOrCreatePrivateConversation)

// 发送消息
router.post('/send', sendMessage)

// 获取会话消息列表
router.get('/conversations/:conversationId/messages', getMessages)

// 获取用户的所有会话列表
router.get('/conversations', getUserConversations)

export default router
