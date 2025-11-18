export default async function handler(req: any, res: any) {
  try {
    const envStatus = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHANNEL_ID: !!process.env.TELEGRAM_CHANNEL_ID,
    };
    
    res.json({ 
      message: "MediaShareBridge API is running!",
      timestamp: new Date().toISOString(),
      environment: envStatus
    });
  } catch (error) {
    res.status(500).json({
      error: "Health check failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}