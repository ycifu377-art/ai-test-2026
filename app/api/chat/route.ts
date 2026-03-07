import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/v1',
  });

  try {
    const { messages } = await req.json();

    // 1. 发起请求 (注意 stream 改为 false)
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一個毒舌且眼尖的「人格測試分析師」。請根據輸入给出犀利吐槽。'
        },
        ...messages
      ],
      stream: false, 
      temperature: 0.8,
    });

    // 2. 提取文本内容
    const content = response.choices[0].message.content;

    // 3. 返回标准的 JSON 对象，确保前端能用 .json() 解析成功
    return new Response(JSON.stringify({ content }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('API Error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
