import { Router } from 'express'
import { updatePaymentCount, getPaymentCount } from '../controllers/paymentController'

const router = Router()

// 更新支付计数（无需认证，因为这是支付确认操作）
router.post('/confirm', updatePaymentCount)

// 获取当前支付计数
router.get('/count', getPaymentCount)

export default router
