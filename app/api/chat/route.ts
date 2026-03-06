// 示例：Next.js Edge API 路由，使用 DeepSeek 实现流式 ChatGPT 响应
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com', // 若不使用 DeepSeek 代理，可移除此行
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = Array.isArray(body?.messages) ? body.messages : []

    // 基本校验：确保 messages 是非空数组
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response('Bad Request: messages must be a non-empty array', { status: 400 })
    }

    // 系统级提示，用于指示 AI 的行为和输出格式
    const systemPrompt = {
      role: 'system',
      content: `你是一個毒舌且眼尖的「人類行為分析師」。請分析用戶行為並從以下維度打分：
1. 【社恐程度】
2. 【社牛程度】
3. 【變態/奇葩度】

【回復格式要求】：
- 先用犀利的語言吐槽。
- 給出百分比分數（例如：社恐 23%）。
- 給出「最終診斷結果」標籤。
語氣要幽默、毒舌、帶點諷刺。`,
    }

    // 调用 Chat Completions 创建流式响应
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',  // DeepSeek 平台上的模型名称，根据实际情况调整
      messages: [systemPrompt, ...messages],
      stream: true,
      temperature: 0.8,
    })

    // 使用 OpenAIStream 包装响应流，并返回 StreamingTextResponse 以支持流式输出
    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (err) {
    console.error('[/api/chat] error:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
