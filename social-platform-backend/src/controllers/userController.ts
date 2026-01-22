import { Request, Response } from 'express'
import { User } from '../models/User.js'
import { Tag } from '../models/Tag.js'
import { UserTag } from '../models/UserTag.js'
import { CardKey } from '../models/CardKey.js'
import { Friend, Message } from '../models/index.js'
import { success, error } from '../utils/response.js'
import bcrypt from 'bcryptjs'
import sequelize from '../config/database.js'

// 更新个人信息
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.userId
    const { nickname, gender, age, avatarUrl, isProfileSet } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return error(res, '用户不存在', 404)
    }

    // 更新用户信息
    if (nickname) user.nickname = nickname
    if (gender) user.gender = gender
    if (age) user.age = age
    if (avatarUrl) user.avatar_url = avatarUrl
    if (isProfileSet !== undefined) user.is_profile_set = isProfileSet

    await user.save()

    return success(res, {
      id: user.id,
      accountId: user.account_id,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatar_url,
      gender: user.gender,
      age: user.age,
      isProfileSet: user.is_profile_set,
    }, '个人信息更新成功')
  } catch (err: any) {
    console.error('更新个人信息错误:', err)
    return error(res, '服务器错误')
  }
}

// 获取所有标签
export async function getTags(req: Request, res: Response) {
  try {
    const tags = await Tag.findAll({
      order: [['category', 'ASC'], ['display_order', 'ASC']],
    })

    return success(res, tags)
  } catch (err: any) {
    console.error('获取标签错误:', err)
    return error(res, '服务器错误')
  }
}

// 更新用户标签
export async function updateUserTags(req: Request, res: Response) {
  try {
    const userId = req.userId
    const { tagIds } = req.body

    if (!tagIds || !Array.isArray(tagIds)) {
      return error(res, '标签ID列表不能为空', 400)
    }

    // 删除原有标签
    await UserTag.destroy({ where: { user_id: userId } })

    // 添加新标签
    const userTags = tagIds.map(tagId => ({
      user_id: userId!,
      tag_id: tagId,
    }))

    await UserTag.bulkCreate(userTags)

    return success(res, null, '标签更新成功')
  } catch (err: any) {
    console.error('更新用户标签错误:', err)
    return error(res, '服务器错误')
  }
}

// 上传头像（占位，实际需要配置文件上传中间件）
export async function uploadAvatar(req: Request, res: Response) {
  try {
    // TODO: 实现文件上传逻辑
    // 这里先返回一个模拟的URL
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
    
    return success(res, { url: avatarUrl }, '头像上传成功')
  } catch (err: any) {
    console.error('上传头像错误:', err)
    return error(res, '服务器错误')
  }
}

// 激活卡密
export async function activateCardKey(req: Request, res: Response) {
  const transaction = await sequelize.transaction()
  
  try {
    const userId = req.userId!
    const { cardKey } = req.body
    
    if (!cardKey) {
      return error(res, '请输入卡密', 400)
    }
    
    console.log(`[激活卡密] 用户ID: ${userId}, 卡密: ${cardKey}`)
    
    // 格式化卡密
    const cleanKey = cardKey.replace(/-/g, '').toUpperCase()
    const formattedKey = cleanKey.match(/.{1,4}/g)?.join('-') || cleanKey
    
    // 查询卡密（加锁）
    const cardKeyRecord = await CardKey.findOne({
      where: { card_key: formattedKey },
      lock: transaction.LOCK.UPDATE,
      transaction
    })
    
    if (!cardKeyRecord) {
      await transaction.rollback()
      console.log('❌ 卡密不存在')
      return error(res, '卡密不存在', 400)
    }
    
    if (cardKeyRecord.status === 'used') {
      await transaction.rollback()
      console.log('❌ 卡密已被使用')
      return error(res, '卡密已被使用', 400)
    }
    
    // 查询用户
    const user = await User.findByPk(userId, { transaction })
    if (!user) {
      await transaction.rollback()
      return error(res, '用户不存在', 404)
    }
    
    // 计算新的到期时间
    const now = new Date()
    let newExpireDate: Date
    
    if (user.is_member && user.member_expire_date && new Date(user.member_expire_date) > now) {
      // 会员续期
      newExpireDate = new Date(user.member_expire_date)
      newExpireDate.setDate(newExpireDate.getDate() + cardKeyRecord.duration_days)
      console.log(`📅 会员续期: +${cardKeyRecord.duration_days}天`)
    } else {
      // 新开通
      newExpireDate = new Date()
      newExpireDate.setDate(newExpireDate.getDate() + cardKeyRecord.duration_days)
      console.log(`🆕 新开通会员: ${cardKeyRecord.duration_days}天`)
    }
    
    // 更新用户
    user.is_member = true
    user.member_expire_date = newExpireDate
    await user.save({ transaction })
    
    // 更新卡密
    cardKeyRecord.status = 'used'
    cardKeyRecord.used_at = now
    cardKeyRecord.used_by = userId
    await cardKeyRecord.save({ transaction })
    
    await transaction.commit()
    
    console.log(`✅ 激活成功! 到期时间: ${newExpireDate.toISOString()}`)
    
    return success(res, {
      isMember: true,
      memberExpireDate: newExpireDate.toISOString(),
      durationDays: cardKeyRecord.duration_days
    }, '会员激活成功')
    
  } catch (err: any) {
    await transaction.rollback()
    console.error('❌ 激活卡密错误:', err)
    return error(res, '激活失败，请稍后重试')
  }
}

// 修改密码
export async function changePassword(req: Request, res: Response) {
  try {
    const userId = req.userId!
    const { oldPassword, newPassword } = req.body
    
    if (!oldPassword || !newPassword) {
      return error(res, '请输入完整信息', 400)
    }
    
    if (newPassword.length < 6) {
      return error(res, '新密码至少6位', 400)
    }
    
    console.log(`[修改密码] 用户ID: ${userId}`)
    
    const user = await User.findByPk(userId)
    if (!user) {
      return error(res, '用户不存在', 404)
    }
    
    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash)
    if (!isPasswordValid) {
      console.log('❌ 当前密码错误')
      return error(res, '当前密码错误', 400)
    }
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password_hash = hashedPassword
    await user.save()
    
    console.log('✅ 密码修改成功')
    
    return success(res, null, '密码修改成功')
    
  } catch (err: any) {
    console.error('❌ 修改密码错误:', err)
    return error(res, '修改失败，请稍后重试')
  }
}

// 获取用户统计信息
export async function getUserStats(req: Request, res: Response) {
  try {
    const userId = req.userId!
    
    // 获取用户信息（用于计算加入天数）
    const user = await User.findByPk(userId)
    if (!user) {
      return error(res, '用户不存在', 404)
    }
    
    // 计算加入天数
    const joinDate = new Date(user.created_at!)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - joinDate.getTime())
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // 获取好友数量
    const friendsCount = await Friend.count({
      where: { user_id: userId }
    })
    
    // 获取消息数量（用户发送的消息）
    const messagesCount = await Message.count({
      where: { sender_id: userId }
    })
    
    return success(res, {
      friends: friendsCount,
      messages: messagesCount,
      days: days
    }, '获取统计信息成功')
    
  } catch (err: any) {
    console.error('❌ 获取统计信息错误:', err)
    return error(res, '获取统计信息失败')
  }
}
