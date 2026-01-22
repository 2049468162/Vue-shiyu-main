import { Request, Response } from 'express'
import { User } from '../models/User.js'
import { UserTag } from '../models/UserTag.js'
import { Tag } from '../models/Tag.js'
import { Friend } from '../models/Friend.js'
import { FriendRequest, FriendRequestStatus } from '../models/FriendRequest.js'
import { createNotification } from './notificationController.js'
import { NotificationType } from '../models/Notification.js'
import { success, error } from '../utils/response.js'
import { Op } from 'sequelize'

// 搜索用户 - 通过账号ID或昵称
export async function searchUsers(req: Request, res: Response) {
  try {
    const { query } = req.query
    const userId = (req as any).userId // 从JWT token获取当前用户ID

    if (!query || typeof query !== 'string') {
      return error(res, '请输入搜索关键词', 400)
    }

    const searchQuery = query.trim()
    
    if (searchQuery.length === 0) {
      return error(res, '搜索关键词不能为空', 400)
    }

    // 搜索用户（排除当前登录用户）
    const users = await User.findAll({
      where: {
        id: { [Op.ne]: userId }, // 排除自己
        [Op.or]: [
          { account_id: { [Op.like]: `%${searchQuery}%` } },
          { nickname: { [Op.like]: `%${searchQuery}%` } },
        ],
      },
      attributes: ['id', 'account_id', 'nickname', 'avatar_url', 'gender', 'age'],
      limit: 50, // 限制返回50个结果
    })

    // 获取每个用户的标签
    const userIds = users.map(u => u.id)
    const userTags = await UserTag.findAll({
      where: { user_id: { [Op.in]: userIds } },
      include: [{
        model: Tag,
        as: 'tag',
        attributes: ['id', 'name', 'category'],
      }],
    })

    // 组装数据
    const results = users.map(user => {
      const tags = userTags
        .filter(ut => ut.user_id === user.id)
        .map(ut => ut.tag?.name)
        .filter(Boolean)

      return {
        id: user.id,
        accountId: user.account_id,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        gender: user.gender,
        age: user.age,
        tags,
      }
    })

    return success(res, results)
  } catch (err: any) {
    console.error('搜索用户错误:', err)
    return error(res, '服务器错误')
  }
}

// 推荐用户 - 基于标签匹配
export async function recommendUsers(req: Request, res: Response) {
  try {
    const userId = (req as any).userId // 从JWT token获取当前用户ID

    // 获取当前用户的标签
    const currentUserTags = await UserTag.findAll({
      where: { user_id: userId },
      include: [{
        model: Tag,
        as: 'tag',
        attributes: ['id', 'name', 'category'],
      }],
    })

    const currentTagIds = currentUserTags.map(ut => ut.tag_id)

    if (currentTagIds.length === 0) {
      // 如果当前用户没有标签，返回随机用户
      const randomUsers = await User.findAll({
        where: {
          id: { [Op.ne]: userId },
          is_profile_set: true,
        },
        attributes: ['id', 'account_id', 'nickname', 'avatar_url', 'gender', 'age'],
        limit: 20,
        order: [['created_at', 'DESC']],
      })

      const results = await Promise.all(
        randomUsers.map(async (user) => {
          const tags = await getUserTags(user.id)
          return {
            id: user.id,
            accountId: user.account_id,
            nickname: user.nickname,
            avatarUrl: user.avatar_url,
            gender: user.gender,
            age: user.age,
            tags,
            matchCount: 0,
          }
        })
      )

      return success(res, results)
    }

    // 查找有相同标签的用户
    const usersWithMatchingTags = await UserTag.findAll({
      where: {
        tag_id: { [Op.in]: currentTagIds },
        user_id: { [Op.ne]: userId },
      },
      attributes: ['user_id', 'tag_id'],
    })

    // 统计每个用户的匹配标签数
    const userMatchCount = new Map<number, number>()
    usersWithMatchingTags.forEach(ut => {
      const count = userMatchCount.get(ut.user_id) || 0
      userMatchCount.set(ut.user_id, count + 1)
    })

    // 按匹配度排序
    const sortedUsers = Array.from(userMatchCount.entries())
      .sort((a, b) => b[1] - a[1]) // 降序排列
      .slice(0, 20) // 取前20个

    if (sortedUsers.length === 0) {
      return success(res, [])
    }

    // 获取用户详细信息
    const userIds = sortedUsers.map(([id]) => id)
    const users = await User.findAll({
      where: {
        id: { [Op.in]: userIds },
        is_profile_set: true,
      },
      attributes: ['id', 'account_id', 'nickname', 'avatar_url', 'gender', 'age'],
    })

    // 组装结果
    const results = await Promise.all(
      users.map(async (user) => {
        const tags = await getUserTags(user.id)
        const matchCount = userMatchCount.get(user.id) || 0
        
        return {
          id: user.id,
          accountId: user.account_id,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          gender: user.gender,
          age: user.age,
          tags,
          matchCount, // 匹配的标签数量
        }
      })
    )

    // 按匹配度重新排序（因为findAll可能打乱顺序）
    results.sort((a, b) => b.matchCount - a.matchCount)

    return success(res, results)
  } catch (err: any) {
    console.error('推荐用户错误:', err)
    return error(res, '服务器错误')
  }
}

// 辅助函数：获取用户的标签
async function getUserTags(userId: number): Promise<string[]> {
  const userTags = await UserTag.findAll({
    where: { user_id: userId },
    include: [{
      model: Tag,
      as: 'tag',
      attributes: ['name'],
    }],
  })

  return userTags.map(ut => ut.tag?.name).filter(Boolean) as string[]
}

// 发送好友申请
export async function sendFriendRequest(req: Request, res: Response) {
  try {
    const fromUserId = req.userId!
    const { toAccountId, message } = req.body

    if (!toAccountId) {
      return error(res, '请提供对方账号', 400)
    }

    // 查找目标用户
    const toUser = await User.findOne({
      where: { account_id: toAccountId },
    })

    if (!toUser) {
      return error(res, '用户不存在', 404)
    }

    if (toUser.id === fromUserId) {
      return error(res, '不能添加自己为好友', 400)
    }

    // 检查是否已经是好友
    const existingFriend = await Friend.findOne({
      where: {
        user_id: fromUserId,
        friend_id: toUser.id,
      },
    })

    if (existingFriend) {
      return error(res, '已经是好友了', 400)
    }

    // 检查是否已经发送过申请
    const existingRequest = await FriendRequest.findOne({
      where: {
        from_user_id: fromUserId,
        to_user_id: toUser.id,
        status: FriendRequestStatus.PENDING,
      },
    })

    if (existingRequest) {
      return error(res, '已经发送过好友申请了', 400)
    }

    // 创建好友申请
    const friendRequest = await FriendRequest.create({
      from_user_id: fromUserId,
      to_user_id: toUser.id,
      status: FriendRequestStatus.PENDING,
      message: message || '',
    })

    // 获取发送者信息
    const fromUser = await User.findByPk(fromUserId)

    // 创建通知给对方
    await createNotification(
      toUser.id,
      NotificationType.FRIEND_REQUEST,
      '新的好友申请',
      `${fromUser?.nickname || '用户'} 向你发送了好友申请`,
      fromUserId,
      { requestId: friendRequest.id, message }
    )

    return success(res, {
      requestId: friendRequest.id,
      status: friendRequest.status,
    }, '好友申请已发送')
  } catch (err: any) {
    console.error('发送好友申请错误:', err)
    return error(res, '发送好友申请失败')
  }
}

// 处理好友申请（接受/拒绝）
export async function handleFriendRequest(req: Request, res: Response) {
  try {
    const userId = req.userId!
    const { requestId } = req.params
    const { action } = req.body // 'accept' or 'reject'

    if (!action || !['accept', 'reject'].includes(action)) {
      return error(res, '无效的操作', 400)
    }

    // 查找好友申请
    const friendRequest = await FriendRequest.findOne({
      where: {
        id: requestId,
        to_user_id: userId,
        status: FriendRequestStatus.PENDING,
      },
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'account_id', 'nickname'],
        },
      ],
    })

    if (!friendRequest) {
      return error(res, '好友申请不存在或已处理', 404)
    }

    const fromUserId = friendRequest.from_user_id

    if (action === 'accept') {
      // 接受好友申请
      friendRequest.status = FriendRequestStatus.ACCEPTED
      await friendRequest.save()

      // 双向添加好友关系
      await Friend.create({
        user_id: userId,
        friend_id: fromUserId,
      })

      await Friend.create({
        user_id: fromUserId,
        friend_id: userId,
      })

      // 获取当前用户信息
      const currentUser = await User.findByPk(userId)

      // 创建通知给申请者
      await createNotification(
        fromUserId,
        NotificationType.FRIEND_ACCEPTED,
        '好友申请已通过',
        `${currentUser?.nickname || '用户'} 接受了你的好友申请`,
        userId
      )

      return success(res, null, '已添加为好友')
    } else {
      // 拒绝好友申请
      friendRequest.status = FriendRequestStatus.REJECTED
      await friendRequest.save()

      // 获取当前用户信息
      const currentUser = await User.findByPk(userId)

      // 创建通知给申请者
      await createNotification(
        fromUserId,
        NotificationType.FRIEND_REJECTED,
        '好友申请已拒绝',
        `${currentUser?.nickname || '用户'} 拒绝了你的好友申请`,
        userId
      )

      return success(res, null, '已拒绝好友申请')
    }
  } catch (err: any) {
    console.error('处理好友申请错误:', err)
    return error(res, '处理好友申请失败')
  }
}
