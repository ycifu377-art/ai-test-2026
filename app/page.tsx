'use client';
import React, { useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';

const Page: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [resultText, setResultText] = useState<string>('');
  const [score, setScore] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    setResultText('');
    setScore(null);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: userInput }] }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // 假设后端返回 { content: '分析文本 [SCORE: XX]' }
      let text: string = data.content || data.text || '';
      // 提取 [SCORE: XX] 并设置 score
      const scoreMatch = text.match(/\[SCORE:\s*(\d+)\]/i);
      if (scoreMatch) {
        setScore(scoreMatch[1]);
        text = text.replace(scoreMatch[0], '').trim();
      }
      setResultText(text);
    } catch (error) {
      console.error('Error:', error);
      setResultText('出现错误，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (reportRef.current === null) return;
    htmlToImage.toPng(reportRef.current)
      .then((dataUrl: string) => {
        // 创建隐藏链接，触发下载图片
        const link = document.createElement('a');
        link.download = 'report.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((error: any) => {
        console.error('Error generating image:', error);
      });
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-purple-400 mb-6">毒舌人格测试</h1>
      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        rows={4}
        className="w-full max-w-lg bg-gray-800 text-white placeholder-gray-500 p-4 rounded-lg shadow-md resize-none focus:outline-none mb-4"
        placeholder="请输入你的问题"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`mt-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-pink-500 hover:to-purple-500'
        }`}
      >
        {loading ? '鉴定中...' : '开始鉴定'}
      </button>

      {resultText && (
        <div className="mt-8 text-center">
          <div
            ref={reportRef}
            className="inline-block bg-gray-800 p-6 rounded-lg shadow-lg text-left"
          >
            {score !== null && (
              <div className="text-5xl font-extrabold text-purple-400">
                {score} <span className="text-xl align-middle">分</span>
              </div>
            )}
            <blockquote className="mt-4 border-l-4 border-purple-500 pl-4 italic text-purple-200">
              “{resultText}”
            </blockquote>
          </div>
          <button
            onClick={handleSave}
            className="mt-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:scale-105"
          >
            保存鉴定报告
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;
