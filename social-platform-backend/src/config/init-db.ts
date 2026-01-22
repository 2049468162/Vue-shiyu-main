import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

async function initDatabase() {
  try {
    // 连接MySQL（不指定数据库）
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    })

    console.log('✅ MySQL 连接成功')

    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../../create_database.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // 分割SQL语句并执行
    const statements = sql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0)

    for (const statement of statements) {
      try {
        await connection.query(statement)
      } catch (error: any) {
        // 忽略已存在的错误
        if (!error.message.includes('already exists')) {
          console.error('SQL 执行错误:', error.message)
        }
      }
    }

    console.log('✅ 数据库初始化完成')

    // 验证数据
    await connection.query('USE social_platform')
    const [tags] = await connection.query('SELECT COUNT(*) as count FROM tags')
    console.log(`✅ 标签数据: ${(tags as any)[0].count} 条`)

    await connection.end()
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    process.exit(1)
  }
}

initDatabase()

