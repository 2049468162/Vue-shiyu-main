# Vue时语助手 - 全栈社交平台

> 一个集成了前端、后端和AI功能的完整Web应用平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-blue.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

## 📋 项目简介

Vue时语助手是一个功能完整的全栈社交平台，包含用户系统、社交功能、会员系统、支付系统和AI聊天功能。

### 核心功能

- 🔐 **用户系统**: 注册/登录、JWT认证、个人信息管理
- 👥 **社交功能**: 好友管理、消息系统、推荐算法
- 💎 **会员系统**: 卡密激活、会员权益管理
- 💰 **支付系统**: 支付二维码、订单管理
- 🤖 **AI功能**: AI聊天、智能砍价
- 🛠️ **管理后台**: 用户管理、数据统计

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3.5.22 + TypeScript 5.9.3
- **构建工具**: Vite 6.0.0
- **UI框架**: Element Plus 2.11.5
- **样式**: TailwindCSS 3.4.18
- **状态管理**: Pinia 3.0.3
- **路由**: Vue Router 4.6.3
- **HTTP**: Axios 1.12.2

### 后端
- **运行时**: Node.js 20.18.1
- **框架**: Express 5.1.0 + TypeScript 5.9.3
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize 6.37.7
- **认证**: JWT + bcryptjs
- **工具**: tsx 4.20.6

## 📦 快速开始

### 环境要求

- Node.js >= 18.0.0 (推荐 20.x LTS)
- MySQL >= 8.0.0
- pnpm (推荐) 或 npm

### 安装依赖

```bash
# 安装前端依赖
cd my-vue
pnpm install

# 安装后端依赖
cd ../social-platform-backend
pnpm install
```

### 配置数据库

1. 创建MySQL数据库:
```sql
CREATE DATABASE vue_web_shiyu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 配置后端环境变量:
```bash
cd social-platform-backend
cp .env.example .env
# 编辑 .env 文件，填入数据库配置
```

3. 初始化数据库表:
```bash
pnpm run init-db
```

### 启动项目

```bash
# 终端1 - 启动前端 (http://localhost:5173)
cd my-vue
pnpm dev

# 终端2 - 启动后端 (http://localhost:3000)
cd social-platform-backend
pnpm dev
```

## 📁 项目结构

```
vue-xiaozhi-web/
├── my-vue/                    # 前端应用
│   ├── src/
│   │   ├── api/              # API接口
│   │   ├── components/       # 组件
│   │   ├── views/            # 页面
│   │   ├── stores/           # 状态管理
│   │   ├── router/           # 路由
│   │   ├── services/         # 业务服务
│   │   ├── types/            # 类型定义
│   │   └── utils/            # 工具函数
│   └── public/               # 静态资源
│
├── social-platform-backend/   # 后端API
│   ├── src/
│   │   ├── config/           # 配置
│   │   ├── models/           # 数据模型
│   │   ├── controllers/      # 控制器
│   │   ├── routes/           # 路由
│   │   ├── middleware/       # 中间件
│   │   └── utils/            # 工具函数
│   └── .env.example          # 环境变量模板
│
└── 核心技术栈文档.md          # 详细技术文档
```

## 🔑 默认账号

- **管理员**: admin / admin123456
- **普通用户**: 需要注册

## 📖 API文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/user` - 获取用户信息
- `POST /api/auth/logout` - 用户登出

### 用户接口
- `PUT /api/user/profile` - 更新个人信息
- `POST /api/user/avatar` - 上传头像
- `GET /api/user/tags` - 获取标签
- `POST /api/user/tags` - 更新用户标签
- `POST /api/user/activate-member` - 激活会员

### 社交接口
- `GET /api/social/search` - 搜索用户
- `GET /api/social/recommend` - 推荐用户

### 消息接口
- `GET /api/messages/conversations` - 获取会话列表
- `POST /api/messages/send` - 发送消息

## 🗄️ 数据库设计

项目包含11张核心数据表:
- users (用户表)
- tags (标签表)
- user_tags (用户标签关联)
- friends (好友关系)
- friend_requests (好友请求)
- conversations (会话)
- conversation_members (会话成员)
- messages (消息)
- notifications (通知)
- card_keys (卡密)
- login_attempts (登录尝试)

## 🚀 部署

### 开发环境
```bash
# 前端
cd my-vue && pnpm dev

# 后端
cd social-platform-backend && pnpm dev
```

### 生产环境
```bash
# 前端构建
cd my-vue && pnpm build

# 后端构建
cd social-platform-backend && pnpm build

# 启动后端
pnpm start
```

推荐使用 PM2 进行进程管理，Nginx 作为反向代理。

## 🔒 安全特性

- ✅ 密码加密 (bcrypt)
- ✅ JWT Token 认证
- ✅ 登录失败保护 (自动冻结)
- ✅ SQL注入防护 (Sequelize ORM)
- ✅ XSS防护 (Vue自动转义)
- ✅ CORS配置

## 📝 开发规范

- **代码风格**: ESLint + Prettier
- **提交规范**: Conventional Commits
- **类型检查**: TypeScript严格模式
- **分支策略**: Git Flow

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE.txt](LICENSE.txt)

## 📞 联系方式

如有问题或建议，欢迎提交 Issue。

## 🙏 致谢

感谢所有开源项目的贡献者！

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**

