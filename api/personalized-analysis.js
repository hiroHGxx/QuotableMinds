// LLM連携用 パーソナライズド解説API
const rateLimitMap = new Map();
const MAX_REQUESTS_PER_MINUTE = 10;
const REQUEST_SIZE_LIMIT = 50000; // 50KB

export default async function handler(req, res) {
  // セキュリティヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // OPTIONS リクエスト（プリフライト）への対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST リクエストのみ受け付け
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  // レート制限チェック
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const currentTime = Date.now();
  const windowStart = currentTime - 60000; // 1分間のウィンドウ
  
  // 古いエントリをクリーンアップ
  for (const [ip, requests] of rateLimitMap.entries()) {
    const filteredRequests = requests.filter(time => time > windowStart);
    if (filteredRequests.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, filteredRequests);
    }
  }
  
  // 現在のIPのリクエスト履歴を取得
  const clientRequests = rateLimitMap.get(clientIP) || [];
  const recentRequests = clientRequests.filter(time => time > windowStart);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    res.status(429).json({ 
      error: 'Too many requests. Please try again later.',
      retryAfter: 60 
    });
    return;
  }
  
  // 新しいリクエストを記録
  recentRequests.push(currentTime);
  rateLimitMap.set(clientIP, recentRequests);

  // リクエストサイズチェック
  const requestSize = JSON.stringify(req.body).length;
  if (requestSize > REQUEST_SIZE_LIMIT) {
    res.status(413).json({ 
      error: 'Request payload too large',
      maxSize: REQUEST_SIZE_LIMIT 
    });
    return;
  }

  try {
    const { personality, answers, userMessage } = req.body;

    // リクエストデータの詳細検証
    if (!personality || !answers) {
      res.status(400).json({ 
        error: 'Missing required data: personality and answers are required' 
      });
      return;
    }

    // データ型と構造の検証
    if (typeof personality !== 'object' || !personality.id || !personality.name) {
      res.status(400).json({ 
        error: 'Invalid personality data structure' 
      });
      return;
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ 
        error: 'Answers must be a non-empty array' 
      });
      return;
    }

    // userMessageの検証（任意フィールド）
    if (userMessage && (typeof userMessage !== 'string' || userMessage.length > 1000)) {
      res.status(400).json({ 
        error: 'User message must be a string with max 1000 characters' 
      });
      return;
    }

    // GEMINI API を使用してパーソナライズされた解説を生成
    let analysis;
    let llmUsed = false;
    let llmStatus = 'mock'; // 'gemini', 'mock', 'error'
    let errorMessage = null;
    
    try {
      analysis = await generateGeminiAnalysis(personality, answers, userMessage);
      llmUsed = true;
      llmStatus = 'gemini';
      console.log('✅ Gemini API successfully used for analysis');
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      errorMessage = error.message;
      // フォールバックとしてモック解説を使用
      analysis = generateMockAnalysis(personality, answers, userMessage);
      llmStatus = 'mock_fallback';
      console.log('⚠️ Fallback to mock analysis due to Gemini API error');
    }

    res.status(200).json({
      success: true,
      analysis: analysis,
      llmUsed: llmUsed,
      llmStatus: llmStatus,
      errorMessage: errorMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// モック解説生成関数（後でLLM APIに置き換え）
function generateMockAnalysis(personality, answers, userMessage) {
  const personalizedMessages = {
    jobs: `あなたは${personality.name}タイプですね。あなたの回答から、革新的な思考と完璧主義的な傾向が見て取れます。特に「${answers[0]?.text || ''}」という選択からは、既存の枠にとらわれない創造性が伺えます。`,
    chanel: `${personality.name}タイプのあなたは、自分らしさを大切にする独立した精神の持ち主です。あなたの回答パターンは、他人の期待よりも自分の信念を優先する傾向を示しています。`,
    einstein: `あなたは${personality.name}タイプ。知的好奇心と論理的思考が際立っています。あなたの回答からは、物事の本質を理解しようとする探究心が強く感じられます。`,
    disney: `${personality.name}タイプのあなたは、前向きで希望に満ちた人生観を持っています。あなたの選択には、人々を喜ばせたいという温かい気持ちが表れています。`,
    mandela: `あなたは${personality.name}タイプ。平和と調和を重視し、他者との協力を大切にする人です。あなたの回答からは、包容力と忍耐強さが伝わってきます。`,
    curie: `${personality.name}タイプのあなたは、困難に立ち向かう勇気と情熱を持っています。あなたの選択パターンには、挑戦を恐れない強い意志が現れています。`
  };

  const baseMessage = personalizedMessages[personality.id] || `あなたは${personality.name}タイプです。`;
  
  const additionalInsight = userMessage 
    ? `\n\n「${userMessage}」というあなたのメッセージからは、現在の状況に対する真摯な向き合い方が感じられます。${personality.name}の言葉「${personality.quote}」は、きっとあなたの今の気持ちに寄り添ってくれるでしょう。`
    : `\n\n${personality.name}の言葉「${personality.quote}」を胸に、あなたらしい道を歩んでいってください。`;

  return baseMessage + additionalInsight;
}

// GEMINI API を使用したパーソナライズされた解説生成関数
async function generateGeminiAnalysis(personality, answers, userMessage) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  // ユーザーの回答パターンを整理
  const answerSummary = answers.map((answer, index) => {
    if (!answer || typeof answer !== 'object') {
      return `質問${index + 1}: 無効な回答`;
    }
    return `質問${index + 1}: ${answer.text || '選択済み'}`;
  }).join(', ');

  const prompt = `
あなたは優しく洞察力のある心理カウンセラーです。以下の情報を基に、ユーザーにパーソナライズされた解説を日本語で生成してください。

診断結果: ${personality.name} (${personality.type})
名言: "${personality.quote}"
ユーザーの回答パターン: ${answerSummary}
${userMessage ? `ユーザーメッセージ: "${userMessage}"` : ''}

以下の要件で解説を作成してください：
1. 温かく励ましとなる内容
2. 具体的な回答に基づいた分析
3. 日本語で200-300文字程度
4. ${personality.name}の名言との関連性を含める
5. 敬語を使用し、親しみやすい語りかけるような文体
`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
}