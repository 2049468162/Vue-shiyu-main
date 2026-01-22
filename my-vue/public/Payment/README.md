# Payment 文件夹说明

## 📁 文件夹结构

```
Payment/
├── qrcodes/              # 支付二维码图片存储
│   └── {sessionId}_{amount}.png
└── logs/                 # 支付日志文件
    └── payment_{date}.log
```

## 🎯 使用说明

### 二维码存储

当用户完成砍价后，系统会自动生成支付二维码。由于浏览器安全限制，二维码无法自动保存到文件系统，但提供了下载功能：

1. **砍价完成后**，在支付对话框中点击"下载二维码到 Payment 文件夹"按钮
2. 浏览器会下载二维码文件，文件名格式：`{sessionId}_{金额}.png`
3. **手动将下载的文件保存到**: `public/Payment/qrcodes/` 文件夹

**示例文件名**：
- `bargain_1701936000000_abc123_5.99.png`
- `bargain_1701936000000_abc123_3.99.png`
- `bargain_1701936000000_abc123_0.99.png`

### 日志导出

系统会自动记录所有支付订单信息，可以导出为日志文件：

1. 在支付对话框中点击"导出日志"按钮
2. 下载 `payment_{日期}.log` 文件
3. **手动将文件保存到**: `public/Payment/logs/` 文件夹

**日志格式（JSON）**：
```json
[
  {
    "timestamp": "2025-12-07T15:55:30.123Z",
    "orderId": "order_1701936000000_xyz789",
    "sessionId": "bargain_1701936000000_abc123",
    "amount": 3.99,
    "status": "pending",
    "qrCodePath": "https://api.qrserver.com/v1/create-qr-code/..."
  }
]
```

## 💾 数据持久化

### LocalStorage 存储

系统使用浏览器 LocalStorage 临时存储：
- `bargain_payment_orders`: 订单列表
- `payment_logs`: 支付日志（最多100条）
- `qrcode_{sessionId}`: 二维码的 Blob URL

### 生产环境建议

在生产环境中，建议：
1. **后端API集成**: 创建后端服务处理二维码生成和存储
2. **真实支付网关**: 集成微信支付或支付宝SDK
3. **数据库存储**: 将订单和日志保存到数据库
4. **文件服务器**: 使用OSS或CDN存储二维码图片

## 🔧 API集成示例

### 后端接口设计

```typescript
// POST /api/payment/create-order
{
  "sessionId": "bargain_xxx",
  "amount": 3.99
}

// Response
{
  "orderId": "order_xxx",
  "qrCodeUrl": "https://cdn.example.com/qrcodes/xxx.png",
  "qrCodeLocalPath": "/Payment/qrcodes/xxx.png",
  "expireTime": 1701936000000
}
```

### 微信支付集成

```javascript
// 生成微信支付二维码
const wechatPay = require('wechatpay-node-v3')

async function generateWeChatQRCode(orderId, amount) {
  const result = await wechatPay.native({
    description: 'AI砍价商品',
    out_trade_no: orderId,
    amount: {
      total: Math.floor(amount * 100), // 分
      currency: 'CNY'
    }
  })
  
  // 保存二维码到 Payment 文件夹
  const qrCodePath = `public/Payment/qrcodes/${orderId}.png`
  await saveQRCodeImage(result.code_url, qrCodePath)
  
  return qrCodePath
}
```

## 📊 文件管理

### 自动清理策略

建议设置定时任务清理过期文件：

```bash
# Linux/Mac crontab 示例
# 每天凌晨3点清理30天前的二维码
0 3 * * * find /path/to/public/Payment/qrcodes -name "*.png" -mtime +30 -delete

# 每周日清理60天前的日志
0 3 * * 0 find /path/to/public/Payment/logs -name "*.log" -mtime +60 -delete
```

### 手动清理

```bash
# 进入项目目录
cd public/Payment

# 查看文件大小
du -sh qrcodes/
du -sh logs/

# 清空二维码文件夹（谨慎操作）
rm -rf qrcodes/*.png

# 清空日志文件夹（谨慎操作）
rm -rf logs/*.log
```

## 🔒 安全建议

1. **访问控制**: 设置适当的文件权限
   ```bash
   chmod 755 public/Payment
   chmod 644 public/Payment/qrcodes/*.png
   chmod 644 public/Payment/logs/*.log
   ```

2. **防止目录遍历**: 配置 Web 服务器禁止列出目录
   ```nginx
   # Nginx 配置示例
   location /Payment/ {
       autoindex off;
   }
   ```

3. **HTTPS**: 确保使用 HTTPS 传输支付信息

4. **文件名验证**: 防止路径遍历攻击
   ```javascript
   function sanitizeFilename(filename) {
     return filename.replace(/[^a-zA-Z0-9._-]/g, '_')
   }
   ```

## 📈 监控建议

### 文件数量监控

```bash
# 检查文件数量
echo "二维码数量: $(ls -1 public/Payment/qrcodes/*.png 2>/dev/null | wc -l)"
echo "日志文件数量: $(ls -1 public/Payment/logs/*.log 2>/dev/null | wc -l)"
```

### 磁盘空间监控

```bash
# 检查磁盘使用
df -h public/Payment
du -sh public/Payment/*
```

## 🎉 快速开始

1. **确保文件夹存在**：
   ```bash
   mkdir -p public/Payment/qrcodes
   mkdir -p public/Payment/logs
   ```

2. **测试砍价功能**：
   - 访问 `/ai-chat` 页面
   - 完成砍价对话
   - 点击下载二维码和导出日志

3. **查看生成的文件**：
   - 检查下载目录中的二维码和日志文件
   - 手动移动到 `public/Payment` 对应文件夹

## ⚠️ 注意事项

1. **浏览器限制**: 前端无法直接写入文件系统，所有保存操作需要用户手动确认
2. **临时存储**: LocalStorage 存储是临时的，清除浏览器数据会丢失
3. **生产部署**: 务必集成后端服务处理文件存储
4. **定期备份**: 重要数据应该定期备份到数据库或云存储

## 📞 技术支持

如有问题，请查看：
- 主文档: `AI砍价守门员实现说明.md`
- 源代码: `src/services/PaymentService.ts`
- 界面组件: `src/views/ai/AIChat.vue`
