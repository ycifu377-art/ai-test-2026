import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

export const runtime = 'edge'

export async function POST(req: Request) {
  // 1. 每次请求都重新初始化，确保环境变量刷新
  const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
    // 【关键修改点】：加上 /v1，这是 DeepSeek 官方推荐的最稳妥路径
    baseURL: 'https://api.deepseek.com/v1', 
  })

  try {
    const { messages } = await req.json()

    // 2. 调用 DeepSeek
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一個毒舌且眼尖的「人類行為分析師」。請分析用戶行為并給出犀利吐槽和評分。格式要求：吐槽文字 + 百分比分數 + 診斷標籤。語氣要幽默諷刺。'
        },
        ...messages
      ],
      stream: true,
      temperature: 0.8,
    })

    // 3. 转换为兼容 Vercel AI SDK 的流
    const stream = OpenAIStream(response);
    
    // 4. 返回流式响应
    return new StreamingTextResponse(stream);

  } catch (err: any) {
    // 如果出错了，至少在日志里打印出具体的报错内容
    console.error('DeepSeek API Error:', err.message || err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
