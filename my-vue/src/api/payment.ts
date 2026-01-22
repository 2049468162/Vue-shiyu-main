import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * 确认支付，更新计数器
 */
export async function confirmPayment() {
  try {
    const response = await axios.post(`${API_BASE_URL}/payment/confirm`)
    return response.data
  } catch (error: any) {
    console.error('确认支付失败:', error)
    throw error
  }
}

/**
 * 获取当前支付计数
 */
export async function getPaymentCount() {
  try {
    const response = await axios.get(`${API_BASE_URL}/payment/count`)
    return response.data
  } catch (error: any) {
    console.error('获取支付计数失败:', error)
    throw error
  }
}
