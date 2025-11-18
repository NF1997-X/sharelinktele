import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('Test API called:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHANNEL_ID: !!process.env.TELEGRAM_CHANNEL_ID
    }
  });

  try {
    return res.status(200).json({
      success: true,
      message: 'Test API working',
      timestamp: new Date().toISOString(),
      env: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHANNEL_ID: !!process.env.TELEGRAM_CHANNEL_ID
      }
    });
  } catch (error) {
    console.error('Test API error:', error);
    return res.status(500).json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}