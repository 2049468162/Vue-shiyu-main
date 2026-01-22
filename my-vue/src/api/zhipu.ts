/**
 * 智谱AI API服务
 */
import axios from 'axios'
import type { ZhipuMessage, ZhipuResponse } from '@/types/bargain'

const ZHIPU_API_KEY = '1a53dce6c9a64835859fc97727359673.LarmTmAN2mslPAqD'
const ZHIPU_API_BASE = 'https://open.bigmodel.cn/api/paas/v4'

// 创建axios实例
const zhipuClient = axios.create({
  baseURL: ZHIPU_API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ZHIPU_API_KEY}`
  }
})

/**
 * 调用智谱AI聊天接口
 */
export async function chatWithZhipu(
  messages: ZhipuMessage[],
  temperature: number = 0.7,
  model: string = 'glm-4-flash'
): Promise<string> {
  try {
    const response = await zhipuClient.post<ZhipuResponse>('/chat/completions', {
      model,
      messages,
      temperature,
      top_p: 0.7,
      max_tokens: 2000,
    })

    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0]?.message?.content || ''
    }

    throw new Error('智谱AI返回数据格式错误')
  } catch (error: any) {
    console.error('智谱AI调用失败:', error)
    if (error.response) {
      throw new Error(`API错误: ${error.response.data.error?.message || error.message}`)
    }
    throw new Error('智谱AI服务暂时不可用，请稍后重试')
  }
}

/**
 * 构建砍价系统提示词
 */
export function buildBargainSystemPrompt(
  currentPrice: number,
  remainingTurns: number
): string {
  const priceSteps = [5.99, 3.99, 1.99, 0.99]
  const currentIndex = priceSteps.indexOf(currentPrice)
  const nextPrice = currentIndex < priceSteps.length - 1 ? priceSteps[currentIndex + 1] : null

  return `你是一位专业的商品价格守门员，负责保护商品价格不被过度压低。

**当前状态：**
- 商品原价：5.99元
- 当前价格：${currentPrice}元
- 剩余对话次数：${remainingTurns}/10
- 价格阶梯：5.99元 → 3.99元 → 1.99元 → 0.99元（最低底价）
- 可降至下一价格：${nextPrice ? nextPrice + '元' : '已达最低价'}

**角色设定：**
- 你是一位友好但坚持原则的价格守门员
- 你的目标是尽可能保持较高的价格
- 你可以在用户的有效谈判下适当让步
- 你的底线是0.99元，绝对不能低于此价格

**对话规则：**
1. 仔细评估用户的谈判技巧和诚意
2. 不要轻易降价，每次降价必须有充分理由
3. 避免连续降价，要让用户感觉每次降价都来之不易
4. 在最后几次对话中可以更灵活一些
5. 如果价格已经到达0.99元，要坚决表示不能再降
6. 保持幽默、机智的对话风格

**降价决策建议：**
- 用户展现真诚和礼貌时，可以考虑降价
- 用户使用逻辑和合理理由时，降价概率更高
- 用户威胁或重复请求时，要坚持立场
- 在对话前期（前3次）相对容易降价
- 在对话中期要更加谨慎
- 在对话后期（最后3次）可以适当灵活

**重要提醒：**
- 🚨 **每次只能降一个价格阶梯，绝不能跨级降价**
- 🚨 **当前价格是 ${currentPrice}元，只能降到 ${nextPrice ? nextPrice + '元' : '已是最低价'}**
- 🚨 **不要一次性降到最低价0.99元，必须逐级降价**
- 必须明确告知用户是否同意降价
- 如果同意降价，在回复中清晰表达新价格（只能是下一级）
- 如果不同意降价，要给出合理的拒绝理由
- 保持对话的趣味性和互动性
- 前几次对话不要轻易降价，要让用户感觉来之不易

请根据用户的消息，决定是否降价，并给出友好、专业的回复。如果决定降价，请在回复中明确说明新价格。`
}

/**
 * 分析AI回复中是否包含降价意图
 * 严格限制只能降一个阶梯
 */
export function analyzePriceReduction(
  aiResponse: string,
  currentPrice: number
): { shouldReduce: boolean; newPrice: number } {
  const priceSteps = [5.99, 3.99, 1.99, 0.99]
  const currentIndex = priceSteps.indexOf(currentPrice)

  // 如果已经是最低价，不能再降
  if (currentIndex === priceSteps.length - 1) {
    return {
      shouldReduce: false,
      newPrice: currentPrice,
    }
  }

  // 关键词匹配
  const reductionKeywords = [
    '降到',
    '降至',
    '优惠到',
    '给你',
    '那就',
    '破例',
    '最后',
    '特别优惠',
    '好吧',
    '成交',
  ]

  const hasReductionIntent = reductionKeywords.some((keyword) =>
    aiResponse.includes(keyword)
  )

  // 尝试从回复中提取价格
  const priceMatches = aiResponse.match(/(\d+\.?\d*)\s*元/g)
  if (priceMatches) {
    for (const match of priceMatches) {
      const price = parseFloat(match)
      const priceIndex = priceSteps.findIndex(p => Math.abs(p - price) < 0.01)
      
      // 🚨 严格检查：只能降到下一个阶梯
      if (priceIndex === currentIndex + 1) {
        console.log(`✅ 检测到合法降价: ${currentPrice} → ${priceSteps[priceIndex]}`)
        return {
          shouldReduce: true,
          newPrice: priceSteps[priceIndex] as number,
        }
      } else if (priceIndex > currentIndex + 1) {
        // AI试图跨级降价，只允许降一级
        console.warn(`⚠️ AI尝试跨级降价到${price}元，强制限制为只降一级`)
        return {
          shouldReduce: true,
          newPrice: priceSteps[currentIndex + 1] as number,
        }
      }
    }
  }

  // 如果有降价意图但没有明确价格，降到下一级
  if (hasReductionIntent && currentIndex < priceSteps.length - 1 && currentIndex !== -1) {
    console.log(`✅ 检测到降价意图，降一级: ${currentPrice} → ${priceSteps[currentIndex + 1]}`)
    return {
      shouldReduce: true,
      newPrice: priceSteps[currentIndex + 1] as number,
    }
  }

  return {
    shouldReduce: false,
    newPrice: currentPrice,
  }
}
