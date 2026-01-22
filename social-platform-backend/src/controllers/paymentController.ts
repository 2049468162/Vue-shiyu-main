import { Request, Response } from 'express'
import mysql from 'mysql2/promise'
import { success, error } from '../utils/response'

/**
 * 更新支付计数
 */
export async function updatePaymentCount(req: Request, res: Response) {
  let connection
  
  try {
    // 创建独立的数据库连接（使用用户提供的远程数据库）
    connection = await mysql.createConnection({
      host: '175.178.245.165',
      port: 13306,
      user: 'root',
      password: 'WkBZHNjP8nycGkaD',
      database: 'vue_web_shiyu'  // 需要确认数据库名
    })

    // 执行更新操作
    const [result] = await connection.execute('UPDATE counts SET id = id + 1')
    
    console.log('支付计数更新成功:', result)
    
    return success(res, {
      updated: true,
      message: '支付计数已更新'
    }, '支付确认成功')
    
  } catch (err: any) {
    console.error('更新支付计数失败:', err)
    return error(res, '更新支付计数失败: ' + err.message)
  } finally {
    // 关闭连接
    if (connection) {
      await connection.end()
    }
  }
}

/**
 * 获取当前支付计数
 */
export async function getPaymentCount(req: Request, res: Response) {
  let connection
  
  try {
    // 创建独立的数据库连接
    connection = await mysql.createConnection({
      host: '175.178.245.165',
      port: 13306,
      user: 'root',
      password: 'WkBZHNjP8nycGkaD',
      database: 'vue_web_shiyu'
    })

    // 查询当前计数
    const [rows] = await connection.execute('SELECT id FROM counts LIMIT 1')
    
    const count = Array.isArray(rows) && rows.length > 0 ? (rows[0] as any).id : 0
    
    return success(res, {
      count: count
    }, '获取支付计数成功')
    
  } catch (err: any) {
    console.error('获取支付计数失败:', err)
    return error(res, '获取支付计数失败: ' + err.message)
  } finally {
    // 关闭连接
    if (connection) {
      await connection.end()
    }
  }
}
