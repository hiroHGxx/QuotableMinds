// テスト用API エンドポイント
export default function handler(req, res) {
  // CORS ヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS リクエスト（プリフライト）への対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET リクエストの処理
  if (req.method === 'GET') {
    res.status(200).json({
      message: 'Quotable Minds API is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
    return;
  }

  // POST リクエストの処理
  if (req.method === 'POST') {
    const { name } = req.body;
    res.status(200).json({
      message: `Hello, ${name || 'Anonymous'}!`,
      received: req.body,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // その他のメソッドは 405 Method Not Allowed
  res.status(405).json({ error: 'Method not allowed' });
}