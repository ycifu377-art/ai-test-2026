import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// 創建 OpenAI 客戶端 (Vercel 會自動從環境變量讀取 API Key)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge'; // 使用 Edge Runtime 提升響應速度

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 這就是 AI 的「靈魂」：系統提示詞
  const systemPrompt = {
    role: "system",
    content: `你是一個毒舌且眼尖的「人類行為分析師」。你的任務是分析用戶發送的內容，並從以下三個維度進行評估：
    1. 【社恐程度】：分析用戶是否表現出恐縮、不敢社交、過度敏感。
    2. 【社牛程度】：分析用戶是否表現出社恐的對立面，如自來熟、厚臉皮、社交悍匪。
    3. 【變態/奇葩度】：分析用戶的行為是否脫離常理、令人震驚或純屬發瘋。

    【回復格式要求】：
    - 先用 1-2 句話犀利地吐槽用戶的行為。
    - 然後給出一個百分比分數（例如：社恐 0%, 社牛 10%, 變態 90%）。
    - 最後給出一個「最終診斷結果」標籤（例如：【人類早期馴服四肢現場】或【變態界的一顆新星】）。
    - 語氣必須幽默、毒舌、帶點諷刺，不要太一本正經。`
  };

  // 將系統提示詞插入到對話歷史的最前面
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // 或者 'gpt-4o'，取決於你的 Key
    stream: true,
    messages: [systemPrompt, ...messages],
    temperature: 0.8, // 提高隨機性，讓回答更多元化
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
