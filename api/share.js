import { getFileById } from './file-store.js';
import { getTelegramFileUrl } from './telegram-utils.js';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract share link from URL path
    const { pathname } = new URL(req.url, 'http://localhost');
    const shareLink = pathname.split('/').pop();
    
    if (!shareLink) {
      return res.status(400).json({
        error: 'Share link required',
        message: 'Please provide a share link'
      });
    }

    console.log(`Looking up share link: ${shareLink}`);

    // Find file by share link
    const files = await import('./file-store.js').then(m => m.getAllFiles());
    const file = files.find(f => f.shareLink === shareLink);

    if (!file) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The requested file does not exist or has been deleted'
      });
    }

    // Get actual Telegram file URL
    let fileUrl;
    try {
      fileUrl = await getTelegramFileUrl(file.telegramFileId);
    } catch (error) {
      console.error('Failed to get Telegram URL:', error);
      // Fallback URL for demo
      fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.telegramFileId}`;
    }

    return res.status(200).json({
      success: true,
      file: {
        id: file.id,
        fileName: file.fileName,
        fileSize: file.fileSize,
        fileType: file.fileType,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt,
        downloadUrl: fileUrl
      },
      shareInfo: {
        shareLink: file.shareLink,
        accessedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Share API error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message || 'Unknown error'
    });
  }
}