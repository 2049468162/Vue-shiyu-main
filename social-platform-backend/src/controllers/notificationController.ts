import { Request, Response } from 'express'
import { Notification, NotificationType } from '../models/Notification.js'
import { User } from '../models/User.js'
import { success, error } from '../utils/response.js'
import { Op } from 'sequelize'

/**
 * 创建通知
 */
export async function createNotification(
  userId: number,
  type: NotificationType,
  title: string,
  content: string,
  relatedUserId?: number,
  relatedData?: any
) {
  try {
    const notification = await Notification.create({
      user_id: userId,
      type,
      title,
      content,
      related_user_id: relatedUserId,
      related_data: relatedData ? JSON.stringify(relatedData) : undefined,
      is_read: false,
    })
    return notification
  } catch (err: any) {
    console.error('创建通知失败:', err)
    throw err
  }
}

/**
 * 获取用户的所有通知
 */
export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.userId!
    const { limit = 50, offset = 0 } = req.query

    const notifications = await Notification.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'relatedUser',
          attributes: ['id', 'account_id', 'nickname', 'avatar_url'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset: Number(offset),
    })

    const unreadCount = await Notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    })

    return success(res, {
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        content: n.content,
        isRead: n.is_read,
        createdAt: n.created_at,
        relatedUser: n.relatedUser
          ? {
              id: n.relatedUser.id,
              accountId: n.relatedUser.account_id,
              nickname: n.relatedUser.nickname,
              avatarUrl: n.relatedUser.avatar_url,
            }
          : null,
        relatedData: n.related_data ? JSON.parse(n.related_data) : null,
      })),
      unreadCount,
    }, '获取通知成功')
  } catch (err: any) {
    console.error('获取通知失败:', err)
    return error(res, '获取通知失败')
  }
}

/**
 * 获取未读通知数量
 */
export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = req.userId!

    const count = await Notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    })

    return success(res, { count }, '获取未读数量成功')
  } catch (err: any) {
    console.error('获取未读数量失败:', err)
    return error(res, '获取未读数量失败')
  }
}

/**
 * 标记通知为已读
 */
export async function markAsRead(req: Request, res: Response) {
  try {
    const userId = req.userId!
    const { notificationId } = req.params

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        user_id: userId,
      },
    })

    if (!notification) {
      return error(res, '通知不存在', 404)
    }

    notification.is_read = true
    await notification.save()

    return success(res, null, '标记成功')
  } catch (err: any) {
    console.error('标记已读失败:', err)
    return error(res, '标记已读失败')
  }
}

/**
 * 标记所有通知为已读
 */
export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = req.userId!

    await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          is_read: false,
        },
      }
    )

    return success(res, null, '全部标记成功')
  } catch (err: any) {
    console.error('标记全部已读失败:', err)
    return error(res, '标记全部已读失败')
  }
}

/**
 * 删除通知
 */
export async function deleteNotification(req: Request, res: Response) {
  try {
    const userId = req.userId!
    const { notificationId } = req.params

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        user_id: userId,
      },
    })

    if (!notification) {
      return error(res, '通知不存在', 404)
    }

    await notification.destroy()

    return success(res, null, '删除成功')
  } catch (err: any) {
    console.error('删除通知失败:', err)
    return error(res, '删除通知失败')
  }
}
