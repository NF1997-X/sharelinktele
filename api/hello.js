import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.json({
      status: 'ok',
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      environment: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasTelegramToken: !!process.env.TELEGRAM_BOT_TOKEN,
        hasTelegramChannel: !!process.env.TELEGRAM_CHANNEL_ID
      }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}