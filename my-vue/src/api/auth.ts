import request from '@/utils/request'
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '@/types'

// 用户登录
export function login(data: LoginRequest) {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

// 用户注册
export function register(data: RegisterRequest) {
  return request({
    url: '/auth/register',
    method: 'post',
    data,
  })
}

// 获取当前用户信息
export function getUserInfo() {
  return request({
    url: '/auth/user',
    method: 'get',
  })
}

// 登出
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post',
  })
}

