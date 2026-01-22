import { Request, Response } from 'express'
import { Conversation, ConversationMember, Message, User } from '../models/index.js'
import { success, error } from '../utils/response.js'
import { Op } from 'sequelize'

/**
 * 获取或创建私聊会话
 * 两个用户之间只能有一个私聊会话
 */
export async function getOrCreatePrivateConversation(req: Request, res: Response) {
  try {
    const userId = (req as any).userId // 当前登录用户ID
    const { friendAccountId } = req.body

    if (!friendAccountId) {
      return error(res, '好友账号ID不能为空', 400)
    }

    // 查找好友用户
    const friend = await User.findOne({
      where: { account_id: friendAccountId }
    })

    if (!friend) {
      return error(res, '用户不存在', 404)
    }

    const friendId = friend.id

    // 查找是否已存在私聊会话（两个用户之间的会话）
    const existingConversation = await Conversation.findOne({
      include: [{
        model: ConversationMember,
        as: 'members',
        where: {
          user_id: { [Op.in]: [userId, friendId] }
        },
        required: true
      }],
      where: {
        type: 'private'
      }
    })

    // 如果找到了会话，还需要确认这个会话正好包含这两个用户
    if (existingConversation) {
      const members = await ConversationMember.findAll({
        where: { conversation_id: existingConversation.id }
      })
      
      if (members.length === 2 && 
          members.some(m => m.user_id === userId) && 
          members.some(m => m.user_id === friendId)) {
        return success(res, {
          conversationId: existingConversation.id,
          type: existingConversation.type
        }, '获取会话成功')
      }
    }

    // 创建新的私聊会话
    const conversation = await Conversation.create({
      type: 'private'
    })

    // 添加两个用户到会话成员
    await ConversationMember.bulkCreate([
      { conversation_id: conversation.id, user_id: userId },
      { conversation_id: conversation.id, user_id: friendId }
    ])

    return success(res, {
      conversationId: conversation.id,
      type: conversation.type
    }, '创建会话成功')
  } catch (err: any) {
    console.error('获取或创建会话失败:', err)
    return error(res, '获取或创建会话失败', 500)
  }
}

/**
 * 发送消息
 */
export async function sendMessage(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { conversationId, content } = req.body

    if (!conversationId || !content) {
      return error(res, '会话ID和消息内容不能为空', 400)
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return error(res, '消息内容不能为空', 400)
    }

    // 验证会话是否存在
    const conversation = await Conversation.findByPk(conversationId)
    if (!conversation) {
      return error(res, '会话不存在', 404)
    }

    // 验证用户是否是该会话的成员
    const member = await ConversationMember.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId
      }
    })

    if (!member) {
      return error(res, '您不是该会话的成员', 403)
    }

    // 创建消息
    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim()
    })

    // 获取发送者信息
    const sender = await User.findByPk(userId, {
      attributes: ['id', 'account_id', 'nickname', 'avatar_url']
    })

    return success(res, {
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      content: message.content,
      createdAt: message.created_at,
      sender: sender ? {
        id: sender.id,
        accountId: sender.account_id,
        nickname: sender.nickname,
        avatarUrl: sender.avatar_url
      } : null
    }, '消息发送成功')
  } catch (err: any) {
    console.error('发送消息失败:', err)
    return error(res, '发送消息失败', 500)
  }
}

/**
 * 获取会话消息列表
 */
export async function getMessages(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { conversationId } = req.params
    const { limit = 50, offset = 0 } = req.query

    if (!conversationId) {
      return error(res, '会话ID不能为空', 400)
    }

    // 验证用户是否是该会话的成员
    const member = await ConversationMember.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId
      }
    })

    if (!member) {
      return error(res, '您不是该会话的成员', 403)
    }

    // 获取消息列表
    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'account_id', 'nickname', 'avatar_url']
      }],
      order: [['created_at', 'ASC']],
      limit: Number(limit),
      offset: Number(offset)
    })

    // 格式化返回数据
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      content: msg.content,
      createdAt: msg.created_at,
      sender: (msg as any).sender ? {
        id: (msg as any).sender.id,
        accountId: (msg as any).sender.account_id,
        nickname: (msg as any).sender.nickname,
        avatarUrl: (msg as any).sender.avatar_url
      } : null
    }))

    return success(res, {
      messages: formattedMessages,
      total: messages.length
    }, '获取消息成功')
  } catch (err: any) {
    console.error('获取消息失败:', err)
    return error(res, '获取消息失败', 500)
  }
}

/**
 * 获取用户的所有会话列表
 */
export async function getUserConversations(req: Request, res: Response) {
  try {
    const userId = (req as any).userId

    // 获取用户参与的所有会话
    const conversationMembers = await ConversationMember.findAll({
      where: { user_id: userId },
      include: [{
        model: Conversation,
        as: 'conversation',
        include: [{
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'account_id', 'nickname', 'avatar_url']
          }]
        }, {
          model: ConversationMember,
          as: 'members',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'account_id', 'nickname', 'avatar_url']
          }]
        }]
      }]
    })

    // 格式化返回数据
    const conversations = conversationMembers.map(cm => {
      const conv = (cm as any).conversation
      const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null
      
      // 对于私聊，找到对方用户信息
      let otherUser = null
      if (conv.type === 'private' && conv.members) {
        const otherMember = conv.members.find((m: any) => m.user_id !== userId)
        otherUser = otherMember ? (otherMember as any).user : null
      }

      return {
        id: conv.id,
        type: conv.type,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          createdAt: lastMessage.created_at,
          sender: lastMessage.sender ? {
            id: lastMessage.sender.id,
            accountId: lastMessage.sender.account_id,
            nickname: lastMessage.sender.nickname,
            avatarUrl: lastMessage.sender.avatar_url
          } : null
        } : null,
        otherUser: otherUser ? {
          id: otherUser.id,
          accountId: otherUser.account_id,
          nickname: otherUser.nickname,
          avatarUrl: otherUser.avatar_url
        } : null,
        createdAt: conv.created_at
      }
    })

    return success(res, {
      conversations
    }, '获取会话列表成功')
  } catch (err: any) {
    console.error('获取会话列表失败:', err)
    return error(res, '获取会话列表失败', 500)
  }
}
