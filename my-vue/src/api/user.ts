import request from '@/utils/request'
import type { User, Tag, ApiResponse } from '@/types'

// 更新用户个人信息
export function updateProfile(data: Partial<User>) {
  return request({
    url: '/user/profile',
    method: 'put',
    data,
  })
}

// 获取所有标签
export function getTags() {
  return request({
    url: '/user/tags',
    method: 'get',
  })
}

// 更新用户标签
export function updateUserTags(tagIds: number[]) {
  return request({
    url: '/user/tags',
    method: 'post',
    data: { tagIds },
  })
}

// 上传头像
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatar', file)
  return request({
    url: '/user/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 获取用户统计信息
export function getUserStats() {
  return request({
    url: '/user/stats',
    method: 'get',
  })
}

// 激活卡密
export function activateCardKey(cardKey: string) {
  return request({
    url: '/user/activate-member',
    method: 'post',
    data: { cardKey },
  })
}

// 修改密码
export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return request({
    url: '/user/password',
    method: 'put',
    data,
  })
}

