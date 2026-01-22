import { Router } from 'express'
import {
  getStats,
  getAllUsers,
  deleteUser,
  clearAllData,
  resetDatabase,
  initTestData,
  createBatchUsers,
  assignRandomTags,
} from '../controllers/adminController.js'

const router = Router()

// 注意：这些是管理员接口，实际项目中应该添加管理员认证中间件
// 现在为了测试方便，暂不添加认证

router.get('/stats', getStats)
router.get('/users', getAllUsers)
router.delete('/users/:id', deleteUser)
router.post('/clear-all', clearAllData)
router.post('/reset-database', resetDatabase)
router.post('/init-test-data', initTestData)
router.post('/create-batch-users', createBatchUsers)
router.post('/assign-random-tags', assignRandomTags)

export default router

