import { VercelRequest, VercelResponse } from '@vercel/node';
import "../server/envValidation";
import { storage } from "../server/storage";
import multer from "multer";
import { nanoid } from "nanoid";
import {
  uploadPhotoToTelegram,
  uploadVideoToTelegram,
  uploadDocumentToTelegram,
  getTelegramFileLink,
} from "../server/telegram";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 100 * 1024 * 1024, // 100MB limit (Vercel has 50MB body limit)
    fieldSize: 100 * 1024 * 1024,
  },
});

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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Upload API called with method:', req.method);

  try {
    // Check environment variables
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL_ID) {
      console.error('Missing Telegram credentials:', {
        hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
        hasChannelId: !!process.env.TELEGRAM_CHANNEL_ID
      });
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Parse multipart form data
    await new Promise<void>((resolve, reject) => {
      upload.single('file')(req as any, res as any, (err: any) => {
        if (err) {
          console.error('Multer error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    const file = (req as any).file;
    if (!file) {
      console.error('No file uploaded in request');
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileId = nanoid();
    const shareLink = nanoid(8);
    
    console.log('Starting upload process', {
      fileId,
      shareLink,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    });
    
    let telegramUpload: { fileId: string; messageId: number };
    
    // Upload to Telegram based on file type
    try {
      if (file.mimetype.startsWith('image/')) {
        console.log('Uploading as image to Telegram');
        telegramUpload = await uploadPhotoToTelegram(file.buffer, file.originalname);
      } else if (file.mimetype.startsWith('video/')) {
        console.log('Uploading as video to Telegram');
        telegramUpload = await uploadVideoToTelegram(file.buffer, file.originalname);
      } else {
        console.log('Uploading as document to Telegram');
        telegramUpload = await uploadDocumentToTelegram(file.buffer, file.originalname);
      }
      
      console.log('Telegram upload successful', {
        telegramFileId: telegramUpload.fileId,
        messageId: telegramUpload.messageId
      });
    } catch (telegramError) {
      console.error('Telegram upload failed:', telegramError);
      return res.status(500).json({
        error: "Failed to upload to Telegram",
        message: telegramError instanceof Error ? telegramError.message : "Unknown Telegram error"
      });
    }
    
    // Get Telegram file URL
    let telegramFileUrl: string;
    try {
      telegramFileUrl = await getTelegramFileLink(telegramUpload.fileId);
      console.log('Got Telegram file URL:', telegramFileUrl);
    } catch (urlError) {
      console.error('Failed to get Telegram file URL:', urlError);
      return res.status(500).json({
        error: "Failed to get file URL from Telegram",
        message: urlError instanceof Error ? urlError.message : "Unknown URL error"
      });
    }
    
    // Save to database
    try {
      const newFile = await storage.createUploadedFile({
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype.split('/')[0],
        mimeType: file.mimetype,
        shareLink,
        telegramFileId: telegramUpload.fileId,
        telegramMessageId: telegramUpload.messageId,
      });
      
      console.log('File saved to database:', newFile.id);
      return res.json(newFile);
    } catch (dbError) {
      console.error('Database save failed:', dbError);
      return res.status(500).json({
        error: "Failed to save file to database",
        message: dbError instanceof Error ? dbError.message : "Unknown database error"
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ 
      error: "Upload failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}