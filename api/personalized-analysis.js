// LLM連携用 パーソナライズド解説API
export default async function handler(req, res) {
  // CORS ヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

  try {
    const { personality, answers, userMessage } = req.body;

    // リクエストデータの検証
    if (!personality || !answers) {
      res.status(400).json({ 
        error: 'Missing required data: personality and answers are required' 
      });
      return;
    }

    // 現在はモックレスポンス（後でLLM APIに置き換え）
    const mockAnalysis = generateMockAnalysis(personality, answers, userMessage);

    res.status(200).json({
      success: true,
      analysis: mockAnalysis,
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

// 将来のLLM API連携用の関数（コメントアウト）
/*
async function generateLLMAnalysis(personality, answers, userMessage) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
あなたは心理分析の専門家です。以下の情報を基に、ユーザーにパーソナライズされた解説を生成してください。

診断結果: ${personality.name} (${personality.type})
名言: "${personality.quote}"
ユーザーの回答パターン: ${JSON.stringify(answers)}
${userMessage ? `ユーザーメッセージ: "${userMessage}"` : ''}

以下の要件で解説を作成してください：
1. 温かく励ましとなる内容
2. 具体的な回答に基づいた分析
3. 日本語で200-300文字程度
4. ${personality.name}の名言との関連性を含める
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'あなたは優しく洞察力のある心理カウンセラーです。' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
*/