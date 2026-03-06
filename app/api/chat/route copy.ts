import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// 初始化 DeepSeek 客户端（核心：必须有 baseURL）
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY, 
  baseURL: 'https://api.deepseek.com', 
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 人格测试专属系统提示词
  const systemPrompt = {
    role: "system",
    content: `你是一个毒舌且眼尖的“人格测试分析师”。你的任务是根据用户的输入，从以下三个维度进行打分：
    1. 【社恐程度】
    2. 【社牛程度】
    3. 【变态/奇葩度】
    
    【回复格式要求】：
    - 先用 1-2 句话犀利、幽默地吐槽用户的行为。
    - 给出具体的百分比分数（如：社恐 10%，社牛 0%，变态 90%）。
    - 最后给出一个“最终诊断标签”（如：【人类早期驯服四肢现场】或【变态界的一颗新星】）。
    - 语气要毒舌、带点讽刺，绝对不要一本正经。`
  };

  const response = await openai.chat.completions.create({
    model: 'deepseek-chat', // 指定 DeepSeek 模型
    stream: true,
    messages: [systemPrompt, ...messages],
    temperature: 0.8, // 保持较高的随机性，让吐槽更多样
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
