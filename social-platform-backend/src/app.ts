import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sequelize from './config/database.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import adminRoutes from './routes/admin.js'
import socialRoutes from './routes/social.js'
import messageRoutes from './routes/message.js'
import notificationRoutes from './routes/notification.js'
import paymentRoutes from './routes/payment.js'
import './models/index.js' // 初始化模型关联

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes) // 管理员路由
app.use('/api/social', socialRoutes) // 社交功能路由
app.use('/api/messages', messageRoutes) // 消息路由
app.use('/api/notifications', notificationRoutes) // 通知路由
app.use('/api/payment', paymentRoutes) // 支付路由

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '社交平台后端运行中' })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' })
})

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err)
  res.status(500).json({ code: 500, message: '服务器内部错误' })
})

// 测试数据库连接并启动服务器
async function startServer() {
  try {
    await sequelize.authenticate()
    console.log('✅ 数据库连接成功')

    // 同步数据库（仅创建不存在的表，不修改现有表）
    await sequelize.sync()
    console.log('✅ 数据库同步成功')

    app.listen(PORT, () => {
      console.log(`✅ 服务器运行在 http://localhost:${PORT}`)
      console.log(`✅ 健康检查: http://localhost:${PORT}/api/health`)
      console.log(`\n可用的 API 端点:`)
      console.log(`  POST /api/auth/register     - 用户注册`)
      console.log(`  POST /api/auth/login        - 用户登录`)
      console.log(`  GET  /api/auth/user         - 获取用户信息 (需要 Token)`)
      console.log(`  POST /api/auth/logout       - 用户登出 (需要 Token)`)
      console.log(`  PUT  /api/user/profile      - 更新个人信息 (需要 Token)`)
      console.log(`  GET  /api/user/tags         - 获取所有标签 (需要 Token)`)
      console.log(`  POST /api/user/tags         - 更新用户标签 (需要 Token)`)
      console.log(`  POST /api/user/avatar       - 上传头像 (需要 Token)`)
      console.log(`\n社交功能接口:`)
      console.log(`  GET  /api/social/search     - 搜索用户 (需要 Token)`)
      console.log(`  GET  /api/social/recommend  - 推荐用户 (需要 Token)`)
      console.log(`\n管理员接口:`)
      console.log(`  GET    /api/admin/stats           - 获取统计数据`)
      console.log(`  GET    /api/admin/users           - 获取所有用户`)
      console.log(`  DELETE /api/admin/users/:id       - 删除用户`)
      console.log(`  POST   /api/admin/clear-all       - 清空所有数据`)
      console.log(`  POST   /api/admin/reset-database  - 重置数据库`)
      console.log(`  POST   /api/admin/init-test-data      - 初始化测试数据`)
      console.log(`  POST   /api/admin/create-batch-users  - 批量创建1000个用户`)
    })
  } catch (error) {
    console.error('❌ 无法连接到数据库:', error)
    process.exit(1)
  }
}

startServer()

export default app

