import { User } from '../models/User.js'

export async function generateUniqueAccountId(): Promise<string> {
  let accountId: string
  let exists = true

  while (exists) {
    // 生成 6 位随机数字
    accountId = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 检查是否已存在
    const user = await User.findOne({ where: { account_id: accountId } })
    exists = !!user
  }

  return accountId!
}

