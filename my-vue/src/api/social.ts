import request from '@/utils/request'

// 搜索用户
export function searchUsers(query: string) {
  return request({
    url: '/social/search',
    method: 'get',
    params: { query }
  })
}

// 推荐用户（基于标签匹配）
export function recommendUsers() {
  return request({
    url: '/social/recommend',
    method: 'get'
  })
}
