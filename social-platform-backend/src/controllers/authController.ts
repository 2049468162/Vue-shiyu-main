import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { LoginAttempt } from '../models/LoginAttempt.js'
import { generateUniqueAccountId } from '../utils/generateAccountId.js'
import { success, error } from '../utils/response.js'
import { Op } from 'sequelize'

// 用户注册
export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    // 验证必填字段
    if (!email || !password) {
      return error(res, '邮箱和密码不能为空', 400)
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return error(res, '邮箱格式不正确', 400)
    }

    // 验证密码强度（至少8位，包含大写、小写、数字）
    if (password.length < 8) {
      return error(res, '密码长度至少8位', 400)
    }
    if (!/[A-Z]/.test(password)) {
      return error(res, '密码必须包含大写字母', 400)
    }
    if (!/[a-z]/.test(password)) {
      return error(res, '密码必须包含小写字母', 400)
    }
    if (!/[0-9]/.test(password)) {
      return error(res, '密码必须包含数字', 400)
    }

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return error(res, '该邮箱已被注册', 400)
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(password, 10)

    // 生成唯一账号
    const accountId = await generateUniqueAccountId()

    // 创建用户
    const user = await User.create({
      account_id: accountId,
      email,
      password_hash: passwordHash,
      is_profile_set: false,
    })

    // 生成 JWT Token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return success(res, {
      token,
      user: {
        id: user.id,
        accountId: user.account_id,
        email: user.email,
        isProfileSet: user.is_profile_set,
        createdAt: user.created_at,
      },
    }, '注册成功')
  } catch (err: any) {
    console.error('注册错误:', err)
    return error(res, '服务器错误')
  }
}

// 用户登录（带账号冻结保护）
export async function login(req: Request, res: Response) {
  try {
    const { account, password } = req.body

    // 验证必填字段
    if (!account || !password) {
      return error(res, '账号和密码不能为空', 400)
    }

    const normalizedAccount = account.trim().toLowerCase()

    // 1. 检查账号是否被冻结
    let loginAttempt = await LoginAttempt.findOne({
      where: { account: normalizedAccount },
    })

    if (loginAttempt && loginAttempt.is_frozen) {
      const now = new Date()
      if (loginAttempt.frozen_until && loginAttempt.frozen_until > now) {
        const remainingMinutes = Math.ceil(
          (loginAttempt.frozen_until.getTime() - now.getTime()) / 60000
        )
        return error(
          res,
          `账号已被冻结，请在 ${remainingMinutes} 分钟后重试`,
          423
        )
      } else {
        // 冻结时间已过，解除冻结但保留失败记录
        loginAttempt.is_frozen = false
        loginAttempt.frozen_until = undefined
        await loginAttempt.save()
      }
    }

    // 2. 查找用户（支持邮箱或6位账号）
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: account },
          { account_id: account },
        ],
      },
    })

    // 3. 处理用户不存在的情况
    if (!user) {
      if (!loginAttempt) {
        loginAttempt = await LoginAttempt.create({
          account: normalizedAccount,
          failed_attempts: 1,
          is_frozen: false,
          last_attempt_at: new Date(),
        })
      } else {
        loginAttempt.failed_attempts += 1
        loginAttempt.last_attempt_at = new Date()
      }

      // 用户不存在：第5次错误冻结10分钟
      if (loginAttempt.failed_attempts >= 5) {
        const frozenMinutes = 10 * Math.pow(2, Math.floor((loginAttempt.failed_attempts - 5) / 5))
        loginAttempt.is_frozen = true
        loginAttempt.frozen_until = new Date(Date.now() + frozenMinutes * 60000)
        await loginAttempt.save()
        return error(res, `连续失败次数过多，账号已被冻结 ${frozenMinutes} 分钟`, 423)
      }

      await loginAttempt.save()
      return error(res, `用户不存在（剩余尝试次数：${5 - loginAttempt.failed_attempts}）`, 401)
    }

    // 4. 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      if (!loginAttempt) {
        loginAttempt = await LoginAttempt.create({
          account: normalizedAccount,
          failed_attempts: 1,
          is_frozen: false,
          last_attempt_at: new Date(),
        })
      } else {
        loginAttempt.failed_attempts += 1
        loginAttempt.last_attempt_at = new Date()
      }

      // 用户存在但密码错误：第3次开始冻结10分钟
      if (loginAttempt.failed_attempts >= 3) {
        const frozenMinutes = 10 * Math.pow(2, Math.floor((loginAttempt.failed_attempts - 3) / 3))
        loginAttempt.is_frozen = true
        loginAttempt.frozen_until = new Date(Date.now() + frozenMinutes * 60000)
        await loginAttempt.save()
        return error(res, `密码错误次数过多，账号已被冻结 ${frozenMinutes} 分钟`, 423)
      }

      await loginAttempt.save()
      return error(res, `密码错误（剩余尝试次数：${3 - loginAttempt.failed_attempts}）`, 401)
    }

    // 5. 登录成功，清除冻结记录
    if (loginAttempt) {
      await loginAttempt.destroy()
    }

    // 6. 生成 JWT Token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return success(res, {
      token,
      user: {
        id: user.id,
        accountId: user.account_id,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        gender: user.gender,
        age: user.age,
        isProfileSet: user.is_profile_set,
        isMember: user.is_member,
        memberExpireDate: user.member_expire_date,
        createdAt: user.created_at,
      },
    }, '登录成功')
  } catch (err: any) {
    console.error('登录错误:', err)
    return error(res, '服务器错误')
  }
}

// 获取当前用户信息
export async function getUserInfo(req: Request, res: Response) {
  try {
    const userId = req.userId

    const user = await User.findByPk(userId)
    if (!user) {
      return error(res, '用户不存在', 404)
    }

    return success(res, {
      id: user.id,
      accountId: user.account_id,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatar_url,
      gender: user.gender,
      age: user.age,
      isProfileSet: user.is_profile_set,
      isMember: user.is_member,
      memberExpireDate: user.member_expire_date,
      createdAt: user.created_at,
    })
  } catch (err: any) {
    console.error('获取用户信息错误:', err)
    return error(res, '服务器错误')
  }
}

// 登出
export async function logout(req: Request, res: Response) {
  // JWT 是无状态的，前端删除 token 即可
  return success(res, null, '登出成功')
}

