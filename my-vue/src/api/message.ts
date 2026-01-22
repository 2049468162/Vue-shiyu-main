import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// 获取token
const getToken = () => localStorage.getItem('token')

// 配置axios请求头
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
})

/**
 * 获取或创建私聊会话
 */
export async function getOrCreatePrivateConversation(friendAccountId: string) {
  const response = await axios.post(
    `${API_URL}/api/messages/conversations/private`,
    { friendAccountId },
    { headers: getHeaders() }
  )
  return response.data
}

/**
 * 发送消息
 */
export async function sendMessage(conversationId: number, content: string) {
  const response = await axios.post(
    `${API_URL}/api/messages/send`,
    { conversationId, content },
    { headers: getHeaders() }
  )
  return response.data
}

/**
 * 获取会话消息列表
 */
export async function getMessages(conversationId: number, limit = 50, offset = 0) {
  const response = await axios.get(
    `${API_URL}/api/messages/conversations/${conversationId}/messages`,
    {
      params: { limit, offset },
      headers: getHeaders(),
    }
  )
  return response.data
}

/**
 * 获取用户的所有会话列表
 */
export async function getUserConversations() {
  const response = await axios.get(`${API_URL}/api/messages/conversations`, {
    headers: getHeaders(),
  })
  return response.data
}
