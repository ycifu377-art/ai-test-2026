import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. 提取前端发来的完整数据
    const body = await req.json();
    console.log("📥 收到前端发来的原始数据:", body);

    // 2. 兼容各种常见的变量名，把用户输入的内容揪出来
    const userMessage = body.message || body.prompt || body.content || "用户啥也没说";
    
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      console.log("❌ 秘钥读取状态: 未找到");
      return NextResponse.json({ error: '请在 .env.local 中配置 DEEPSEEK_API_KEY' }, { status: 500 });
    }
    console.log("✅ 秘钥读取状态: 已找到");

    // 3. 向 DeepSeek 发起请求
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个毒舌幽默的心理鉴定师，专门鉴定社恐。请根据用户描述的行为，给出一个搞笑的社恐等级和毒舌点评。' },
          { role: 'user', content: userMessage }, // 确保这里绝对不会是空的
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("👉 DeepSeek 返回结果:", JSON.stringify(data));

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'API 报错了' }, { status: 500 });
    }

    return NextResponse.json(data.choices[0].message);
  } catch (error) {
    console.error("❌ 致命错误:", error);
    return NextResponse.json({ error: '连接服务器失败' }, { status: 500 });
  }
  }
