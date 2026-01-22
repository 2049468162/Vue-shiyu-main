<template>
  <div class="notification-bell" @click="togglePanel">
    <div class="bell-icon-wrapper">
      <!-- SVG 铃铛图标 -->
      <svg 
        class="bell-icon" 
        :class="{ 'ringing': hasUnread }"
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 铃铛主体 -->
        <path 
          d="M12 2C10.8954 2 10 2.89543 10 4C10 4.55228 9.55228 5 9 5C7.89543 5 7 5.89543 7 7V12C7 14.7614 5.23858 17 3 17H21C18.7614 17 17 14.7614 17 12V7C17 5.89543 16.1046 5 15 5C14.4477 5 14 4.55228 14 4C14 2.89543 13.1046 2 12 2Z" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
        <!-- 铃铛底部 -->
        <path 
          d="M9 17V18C9 19.6569 10.3431 21 12 21C13.6569 21 15 19.6569 15 18V17" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </svg>
      
      <!-- 小红点 -->
      <span v-if="hasUnread" class="red-dot">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </div>

    <!-- 通知面板 -->
    <transition name="fade-slide">
      <div v-if="showPanel" class="notification-panel" @click.stop>
        <div class="panel-header">
          <h3>通知</h3>
          <el-button text size="small" @click="markAllRead">全部已读</el-button>
        </div>

        <div class="notification-list">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon" :class="notification.type">
              <component :is="getIcon(notification.type)" />
            </div>
            <div class="notification-content">
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">{{ notification.time }}</span>
            </div>
            <span v-if="!notification.read" class="unread-indicator"></span>
          </div>
        </div>

        <div v-if="notifications.length === 0" class="empty-state">
          <el-icon class="empty-icon"><Bell /></el-icon>
          <p>暂无通知</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { UserFilled, Select, CloseBold, Bell } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Notification {
  id: number
  type: 'friend_request' | 'friend_accepted' | 'friend_rejected'
  message: string
  time: string
  read: boolean
  data?: any
}

const showPanel = ref(false)

// 从localStorage加载通知数据
const loadNotifications = (): Notification[] => {
  const stored = localStorage.getItem('notifications')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  // 默认空通知列表，新账号没有默认通知
  // TODO: 从后端API获取通知数据
  return []
}

const notifications = ref<Notification[]>(loadNotifications())

// 保存通知到localStorage
const saveNotifications = () => {
  localStorage.setItem('notifications', JSON.stringify(notifications.value))
}

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const hasUnread = computed(() => unreadCount.value > 0)

const togglePanel = () => {
  showPanel.value = !showPanel.value
}

const getIcon = (type: string) => {
  switch (type) {
    case 'friend_request':
      return UserFilled
    case 'friend_accepted':
      return Select
    case 'friend_rejected':
      return CloseBold
    default:
      return Bell
  }
}

const handleNotificationClick = (notification: Notification) => {
  notification.read = true
  saveNotifications()  // 保存到localStorage
  
  switch (notification.type) {
    case 'friend_request':
      ElMessage.info('打开好友请求处理页面')
      break
    case 'friend_accepted':
      ElMessage.success('好友已添加')
      break
    case 'friend_rejected':
      ElMessage.warning('好友请求被拒绝')
      break
  }
}

const markAllRead = () => {
  notifications.value.forEach(n => n.read = true)
  saveNotifications()  // 保存到localStorage
  ElMessage.success('已全部标记为已读')
}

// 点击外部关闭面板
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.notification-bell')) {
    showPanel.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.notification-bell {
  position: relative;
  cursor: pointer;
}

.bell-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.bell-icon-wrapper:hover {
  background: rgba(0, 112, 243, 0.1);
  transform: scale(1.05);
}

.bell-icon {
  width: 22px;
  height: 22px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.bell-icon-wrapper:hover .bell-icon {
  color: rgba(0, 112, 243, 1);
}

/* 铃铛摇晃动画 */
.bell-icon.ringing {
  animation: ring 2s ease-in-out infinite;
}

@keyframes ring {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(-15deg); }
  20%, 40% { transform: rotate(15deg); }
  50% { transform: rotate(0deg); }
}

/* 小红点 */
.red-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff4444, #cc0000);
  color: white;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.4);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 通知面板 */
.notification-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 360px;
  max-height: 500px;
  background: rgba(10, 14, 39, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 112, 243, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 1000;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: transparent;
}

.notification-list::-webkit-scrollbar-thumb {
  background: rgba(0, 112, 243, 0.3);
  border-radius: 3px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.notification-item:hover {
  background: rgba(0, 112, 243, 0.1);
}

.notification-item.unread {
  background: rgba(0, 112, 243, 0.05);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.notification-icon.friend_request {
  background: rgba(0, 112, 243, 0.2);
  color: #60a5fa;
}

.notification-icon.friend_accepted {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.notification-icon.friend_rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.unread-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0070f3;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

