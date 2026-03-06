'use client';
import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';

export default function SocialTest() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ text: string; score: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const startTest = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'user', content: input }] }),
      });
      const data = await res.json();
      const text = data.content;
      const scoreMatch = text.match(/\[SCORE: (\d+)\]/);
      setResult({ text: text.replace(/\[SCORE: \d+\]/, ''), score: scoreMatch ? scoreMatch[1] : '99' });
    } catch (e) {
      alert('连接失败');
    }
    setLoading(false);
  };

  const saveImage = async () => {
    if (cardRef.current) {
      const dataUrl = await toPng(cardRef.current);
      const link = document.createElement('a');
      link.download = '毒舌人格测试.png';
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-purple-500">毒舌人格测试</h1>
      
      <div className="w-full max-w-md space-y-4">
        <textarea 
          className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl focus:outline-none focus:border-purple-500"
          placeholder="把你的事情写在这里，让本机器来分析
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button 
          onClick={startTest}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-xl font-bold transition-all"
        >
          {loading ? '正在分析Ꙭ̰ʹ̣ʹ̣...' : '开始鉴定'}
        </button>
      </div>

      {result && (
        <div className="mt-12 flex flex-col items-center">
          <div ref={cardRef} className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border-2 border-purple-500 w-80 shadow-2xl">
            <div className="text-center">
              <p className="text-sm text-purple-300 mb-2">毒舌人格测试</p>
              <div className="text-6xl font-black text-white mb-4">{result.score}%</div>
              <p className="text-gray-300 leading-relaxed italic">"{result.text}"</p>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700 text-[10px] text-gray-500 text-center">
              此报告由 AI 鉴定 ·让你看看本机器人对你的分析ᗜ◞ᗜ ( ᓀ◞ᓂ..) (๑•̀ㅂ•́)و✧ 略略略~
            </div>
          </div>
          <button onClick={saveImage} className="mt-6 text-sm text-gray-400 underline">保存鉴定报告</button>
        </div>
      )}
    </main>
  );
}
