import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { error } from '../utils/response.js'

interface JwtPayload {
  userId: number
}

declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return error(res, '未授权，请先登录', 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.userId = decoded.userId
    next()
  } catch (err) {
    return error(res, 'Token 无效或已过期', 401)
  }
}

