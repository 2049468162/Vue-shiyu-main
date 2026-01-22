import sequelize from '../config/database.js'
import { LoginAttempt } from '../models/LoginAttempt.js'

async function createLoginAttemptTable() {
  try {
    // 连接数据库
    await sequelize.authenticate()
    console.log('✅ 数据库连接成功')

    // 创建 LoginAttempt 表
    await LoginAttempt.sync({ force: false })
    console.log('✅ LoginAttempt 表创建成功')

    // 关闭连接
    await sequelize.close()
    console.log('✅ 数据库连接已关闭')
    
  } catch (error) {
    console.error('❌ 创建表失败:', error)
    process.exit(1)
  }
}

createLoginAttemptTable()
