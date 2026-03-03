import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// 關鍵修改：將客戶端指向 DeepSeek 的服務器
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY, 
  baseURL: 'https://api.deepseek.com', // 必須加上這一行，否則它會去敲 OpenAI 的門
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemPrompt = {
    role: "system",
    content: `你是一個毒舌且眼尖的「人類行為分析師」。請分析用戶行為並從以下維度打分：
    1. 【社恐程度】
    2. 【社牛程度】
    3. 【變態/奇葩度】
    
    【回復格式要求】：
    - 先用犀利的語言吐槽。
    - 給出百分比分數。
    - 給出「最終診斷結果」標籤。
    語氣要幽默、毒舌、帶點諷刺。`
  };

  const response = await openai.chat.completions.create({
    model: 'deepseek-chat', // 關鍵修改：模型名稱必須是 deepseek-chat
    stream: true,
    messages: [systemPrompt, ...messages],
    temperature: 0.8,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
