import { Request, Response } from 'express'
import { User } from '../models/User.js'
import { UserTag } from '../models/UserTag.js'
import { Tag } from '../models/Tag.js'
import { success, error } from '../utils/response.js'
import sequelize from '../config/database.js'

// 获取统计数据
export async function getStats(req: Request, res: Response) {
  try {
    const userCount = await User.count()
    const tagCount = await Tag.count()
    const userTagCount = await UserTag.count()

    return success(res, {
      users: userCount,
      tags: tagCount,
      userTags: userTagCount,
      messages: 0, // 待实现
    })
  } catch (err: any) {
    console.error('获取统计错误:', err)
    return error(res, '服务器错误')
  }
}

// 获取所有用户
export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'account_id', 'email', 'nickname', 'gender', 'age', 'is_profile_set', 'created_at'],
      order: [['created_at', 'DESC']],
    })

    return success(res, users.map(user => ({
      id: user.id,
      accountId: user.account_id,
      email: user.email,
      nickname: user.nickname,
      gender: user.gender,
      age: user.age,
      isProfileSet: user.is_profile_set,
      createdAt: user.created_at,
    })))
  } catch (err: any) {
    console.error('获取用户列表错误:', err)
    return error(res, '服务器错误')
  }
}

// 删除单个用户
export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return error(res, '用户不存在', 404)
    }

    // 删除用户（级联删除会自动删除关联数据）
    await user.destroy()

    return success(res, null, '用户删除成功')
  } catch (err: any) {
    console.error('删除用户错误:', err)
    return error(res, '服务器错误')
  }
}

// 清空所有用户数据
export async function clearAllData(req: Request, res: Response) {
  try {
    // 清空用户标签
    await UserTag.destroy({ where: {}, truncate: true })
    
    // 清空用户
    await User.destroy({ where: {}, truncate: true })

    return success(res, null, '所有数据已清空')
  } catch (err: any) {
    console.error('清空数据错误:', err)
    return error(res, '服务器错误')
  }
}

// 重置数据库
export async function resetDatabase(req: Request, res: Response) {
  try {
    // 使用事务执行重置操作
    await sequelize.transaction(async (t) => {
      // 清空所有表（保留表结构）
      await UserTag.destroy({ where: {}, truncate: true, transaction: t })
      await User.destroy({ where: {}, truncate: true, transaction: t })
      
      // 标签表不清空，保留初始数据
    })

    return success(res, null, '数据库已重置')
  } catch (err: any) {
    console.error('重置数据库错误:', err)
    return error(res, '服务器错误')
  }
}

// 初始化测试数据 - 只创建一个测试账号
export async function initTestData(req: Request, res: Response) {
  try {
    const bcrypt = await import('bcryptjs')

    const testEmail = 'QWER1@qq.com'
    const testPassword = 'Test1234'
    
    // 检查是否已存在
    const existing = await User.findOne({ where: { email: testEmail } })
    if (existing) {
      return success(res, null, '测试账号已存在')
    }

    const passwordHash = await bcrypt.hash(testPassword, 10)

    // 创建测试用户
    await User.create({
      account_id: 'TEST01',  // 固定账号
      email: testEmail,
      password_hash: passwordHash,
      nickname: '测试账号',
      gender: 'male',
      age: 25,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
      is_profile_set: true,
    })

    return success(res, null, '测试账号已创建（邮箱：QWER1@qq.com，密码：Test1234）')
  } catch (err: any) {
    console.error('初始化测试数据错误:', err)
    return error(res, '服务器错误')
  }
}

// 批量创建1000个测试用户
export async function createBatchUsers(req: Request, res: Response) {
  try {
    const bcrypt = await import('bcryptjs')
    const { generateUniqueAccountId } = await import('../utils/generateAccountId.js')

    const userCount = 1000
    const password = 'Test1234'
    const passwordHash = await bcrypt.hash(password, 10)

    // 姓氏和名字库
    const lastNames = ['张', '李', '王', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗', '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹', '彭', '曾', '肖', '田', '董', '袁', '潘', '于', '蒋', '蔡', '余', '杜', '叶', '程', '苏', '魏', '吕', '丁', '任', '沈']
    const firstNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '华', '建华', '秀珍', '春梅', '桂兰', '玉兰', '玉梅', '丹', '婷', '雪', '慧', '宇', '波', '鹏', '鑫', '琳', '帆', '浩', '凯', '颖', '萍', '佳', '莉', '欣', '瑜', '欢']
    const genders: ('male' | 'female' | 'other')[] = ['male', 'female', 'other']

    const createdUsers = []
    let successCount = 0

    console.log(`开始创建 ${userCount} 个测试用户...`)

    for (let i = 0; i < userCount; i++) {
      try {
        // 生成唯一的账号ID
        const accountId = await generateUniqueAccountId()
        
        // 生成邮箱
        const email = `testuser${i + 1}@test.com`
        
        // 检查邮箱是否已存在
        const existing = await User.findOne({ where: { email } })
        if (existing) {
          continue
        }

        // 随机生成姓名
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const nickname = `${lastName}${firstName}`

        // 随机性别和年龄
        const gender = genders[Math.floor(Math.random() * genders.length)]
        const age = Math.floor(Math.random() * (60 - 18 + 1)) + 18 // 18-60岁

        // 创建用户
        const user = await User.create({
          account_id: accountId,
          email: email,
          password_hash: passwordHash,
          nickname: nickname,
          gender: gender,
          age: age,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${accountId}`,
          is_profile_set: true,
        })

        successCount++
        
        if (successCount % 100 === 0) {
          console.log(`已创建 ${successCount}/${userCount} 个用户...`)
        }

        createdUsers.push({
          accountId: user.account_id,
          email: user.email,
          nickname: user.nickname,
        })
      } catch (err) {
        console.error(`创建用户失败 (${i + 1}):`, err)
        continue
      }
    }

    console.log(`✅ 批量创建完成！成功创建 ${successCount} 个用户`)

    return success(res, {
      successCount,
      totalCount: userCount,
      password: password,
      sampleUsers: createdUsers.slice(0, 10) // 返回前10个用户作为示例
    }, `成功创建 ${successCount} 个测试用户（密码：${password}）`)
  } catch (err: any) {
    console.error('批量创建用户错误:', err)
    return error(res, '服务器错误')
  }
}

// 为所有用户随机分配标签
export async function assignRandomTags(req: Request, res: Response) {
  try {
    const { Tag } = await import('../models/Tag.js')
    
    // 获取所有标签
    const allTags = await Tag.findAll()
    if (allTags.length === 0) {
      return error(res, '系统中没有可用标签', 400)
    }
    
    // 获取所有用户
    const users = await User.findAll({
      where: { is_profile_set: true }
    })
    
    console.log(`开始为 ${users.length} 个用户分配随机标签...`)
    
    let successCount = 0
    
    for (const user of users) {
      try {
        // 删除用户现有标签
        await UserTag.destroy({ where: { user_id: user.id } })
        
        // 随机选择3-6个标签
        const tagCount = Math.floor(Math.random() * 4) + 3 // 3-6个标签
        const shuffledTags = [...allTags].sort(() => Math.random() - 0.5)
        const selectedTags = shuffledTags.slice(0, tagCount)
        
        // 创建用户标签关联
        const userTags = selectedTags.map(tag => ({
          user_id: user.id,
          tag_id: tag.id
        }))
        
        await UserTag.bulkCreate(userTags)
        successCount++
        
        if (successCount % 100 === 0) {
          console.log(`已为 ${successCount}/${users.length} 个用户分配标签...`)
        }
      } catch (err) {
        console.error(`为用户 ${user.id} 分配标签失败:`, err)
        continue
      }
    }
    
    console.log(`✅ 标签分配完成！成功为 ${successCount} 个用户分配标签`)
    
    return success(res, {
      successCount,
      totalCount: users.length
    }, `成功为 ${successCount} 个用户分配随机标签`)
  } catch (err: any) {
    console.error('分配标签错误:', err)
    return error(res, '服务器错误')
  }
}

