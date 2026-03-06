// 文件：app/api/chat/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com', // 若不使用 DeepSeek 代理，可移除此行
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    // 基本校验
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response('Bad Request: messages must be a non-empty array', { status: 400 });
    }

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
    };

    // 调用 DeepSeek / OpenAI 兼容接口（开启流式）
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat', // 根据你平台实际模型名调整
      stream: true,
      messages: [systemPrompt, ...messages],
      temperature: 0.8,
    });

    // 把 SDK 的流包装成可以返回给浏览器的 Response
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (err) {
    console.error('[/api/chat] error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
