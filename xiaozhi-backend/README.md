# 小智AI后端服务

> 基于 FastAPI 的 AI 语音对话后端服务

## 📋 简介

这是小智AI的后端服务，提供WebSocket连接、语音识别(STT)、大语言模型(LLM)和语音合成(TTS)功能。

## 🛠️ 技术栈

- **Python**: 3.13+
- **FastAPI**: 0.116.1+
- **WebSocket**: 15.0.1+
- **Opus**: 音频编解码
- **Numpy**: 数值计算

## 📦 安装依赖

### 方式一：使用 uv (推荐)

```bash
# 安装 uv
pip install uv

# 同步依赖
uv sync
```

### 方式二：使用 pip

```bash
pip install -r requirements.txt
```

### 核心依赖

```
fastapi>=0.116.1       # Web框架
uvicorn>=0.35.0        # ASGI服务器
websockets>=15.0.1     # WebSocket支持 (⚠️ 必须 >= 15.0.1)
opuslib>=3.0.1         # Opus音频编解码
numpy>=2.3.2           # 数值计算
colorlog>=6.9.0        # 彩色日志
python-dotenv>=1.1.1   # 环境变量管理
requests>=2.32.4       # HTTP请求
```

## ⚙️ 配置

### 配置文件

编辑 `config/config.json`:

```json
{
  "WS_URL": "wss://your-xiaozhi-server.com",
  "WS_PROXY_URL": "ws://0.0.0.0:5000",
  "BACKEND_URL": "http://0.0.0.0:8081",
  "OTA_VERSION_URL": "https://your-ota-server.com/version",
  "TOKEN_ENABLE": false,
  "TOKEN": "",
  "DEVICE_ID": ""
}
```

### 配置说明

- **WS_URL**: 远程小智服务器WebSocket地址
- **WS_PROXY_URL**: 本地WebSocket代理地址
- **BACKEND_URL**: 后端API服务地址
- **OTA_VERSION_URL**: OTA版本检查地址
- **TOKEN_ENABLE**: 是否启用Token认证
- **TOKEN**: 设备Token（如需要）
- **DEVICE_ID**: 设备ID（如需要）

## 🚀 启动服务

### 使用 uv (推荐)

```bash
uv run main.py
```

### 使用 Python

```bash
python main.py
```

### 启动成功

应该看到以下输出：

```
INFO: Uvicorn running on http://0.0.0.0:8081
[websockets.server] - INFO - server listening on 0.0.0.0:5000
```

## 📡 API 端点

### HTTP API

- `GET /config` - 获取配置信息
- `GET /health` - 健康检查

### WebSocket

- `ws://localhost:5000` - WebSocket连接端点

## 🔧 开发说明

### 项目结构

```
xiaozhi-backend/
├── app/
│   ├── __init__.py           # 应用初始化
│   ├── config.py             # 配置管理
│   ├── constants.py          # 常量定义
│   ├── constant/             # 常量模块
│   ├── proxy/                # WebSocket代理
│   ├── router/               # API路由
│   └── utils/                # 工具函数
├── config/
│   └── config.json           # 配置文件
├── libs/                     # 第三方库
│   ├── win/                  # Windows库
│   ├── mac/                  # macOS库
│   └── linux/                # Linux库
├── logs/                     # 日志目录
├── main.py                   # 主入口
├── run.py                    # 运行脚本
├── pyproject.toml            # 项目配置
└── requirements.txt          # 依赖列表
```

### 日志

日志文件位置: `logs/app.log`

## ⚠️ 注意事项

### 1. WebSocket 版本要求

**必须使用 websockets >= 15.0.1**，低版本会导致API不兼容。

```bash
# 检查版本
pip show websockets

# 如果版本过低，升级
pip install --upgrade websockets
```

### 2. Opus 库

Windows系统需要手动加载 opus.dll 动态链接库，已在代码中处理。

### 3. Python 版本

推荐使用 Python 3.13，最低要求 3.9。

### 4. 启动方式

**⚠️ 重要**: 必须使用 `uv run main.py` 启动，不要直接使用 `python main.py`。

```bash
# ✅ 正确
uv run main.py

# ❌ 错误（可能导致依赖版本问题）
python main.py
```

## 🐛 常见问题

### 问题 1: WebSocket 连接失败

**原因**: websockets 版本过低

**解决方案**:
```bash
pip install --upgrade "websockets>=15.0.1"
```

### 问题 2: 端口被占用

**错误**: `OSError: [Errno 48] Address already in use`

**解决方案**:
```bash
# 查找占用端口的进程
# Windows
netstat -ano | findstr :8081
netstat -ano | findstr :5000

# macOS/Linux
lsof -ti:8081
lsof -ti:5000

# 终止进程
# Windows
taskkill /F /PID <进程ID>

# macOS/Linux
kill -9 <进程ID>
```

### 问题 3: 模块导入错误

**错误**: `ModuleNotFoundError`

**解决方案**:
```bash
# 重新安装依赖
uv sync

# 或
pip install -r requirements.txt
```

### 问题 4: Opus 库加载失败

**错误**: `OSError: cannot load library 'opus'`

**解决方案**:

Windows系统已在代码中处理，确保 `libs/win/` 目录下有 opus.dll。

macOS/Linux:
```bash
# macOS
brew install opus

# Ubuntu/Debian
sudo apt-get install libopus0

# CentOS/RHEL
sudo yum install opus
```

## 🔒 安全建议

1. **不要在生产环境中禁用Token认证**
2. **使用HTTPS/WSS协议**
3. **定期更新依赖包**
4. **不要将Token提交到Git**

## 📝 环境变量

可以通过环境变量覆盖配置：

```bash
export WS_URL="wss://your-server.com"
export BACKEND_URL="http://0.0.0.0:8081"
export TOKEN_ENABLE="true"
export TOKEN="your-device-token"
```

## 🆘 获取帮助

如果遇到问题：

1. 查看日志文件 `logs/app.log`
2. 检查配置文件 `config/config.json`
3. 确认依赖版本正确
4. 在GitHub仓库提交Issue

## 📄 许可证

本项目基于第三方开源项目，请遵守相应的许可证。

---

**注意**: 此服务需要连接到真实的小智AI服务器才能正常工作。如果只是测试主应用功能，可以不启动此服务。
