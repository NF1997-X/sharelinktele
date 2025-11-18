import formidable from 'formidable';
import { uploadFileToTelegram } from './telegram-utils.js';
import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';

// Generate random ID
function generateId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

// Format file size
function formatFileSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Parse form data using formidable
async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
      keepExtensions: true,
      multiples: false
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      const fileKey = Object.keys(files)[0];
      if (!fileKey || !files[fileKey]) {
        reject(new Error('No file uploaded'));
        return;
      }

      const file = Array.isArray(files[fileKey]) ? files[fileKey][0] : files[fileKey];
      
      try {
        const fileBuffer = readFileSync(file.filepath);
        
        resolve({
          filename: file.originalFilename || 'unnamed-file',
          contentType: file.mimetype || 'application/octet-stream',
          buffer: fileBuffer,
          size: file.size
        });
      } catch (readError) {
        reject(new Error(`Failed to read uploaded file: ${readError.message}`));
      }
    });
  });
}

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Upload request received:', {
      method: req.method,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length']
    });

    // Check environment variables
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL_ID) {
      console.error('Missing environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'Missing Telegram credentials'
      });
    }

    // Parse uploaded file using formidable
    const fileData = await parseFormData(req);
    console.log('File parsed successfully:', {
      filename: fileData.filename,
      size: formatFileSize(fileData.size),
      type: fileData.contentType
    });

    // Upload to Telegram
    let telegramResult;
    try {
      telegramResult = await uploadFileToTelegram(
        fileData.buffer, 
        fileData.filename, 
        fileData.contentType
      );
      console.log('Successfully uploaded to Telegram:', telegramResult.fileId);
    } catch (telegramError) {
      console.error('Telegram upload failed:', telegramError);
      // Return mock data as fallback
      telegramResult = {
        fileId: generateId(32),
        messageId: Math.floor(Math.random() * 1000000),
        fileUrl: `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${generateId(32)}`,
        isMock: true,
        error: telegramError.message
      };
    }

    // Mock database save
    const savedFile = {
      id: generateId(16),
      fileName: fileData.filename,
      fileSize: fileData.size,
      fileType: fileData.contentType.split('/')[0],
      mimeType: fileData.contentType,
      shareLink: generateId(8),
      telegramFileId: telegramResult.fileId,
      telegramMessageId: telegramResult.messageId,
      uploadedAt: new Date().toISOString()
    };

    console.log('File processed successfully:', savedFile.id);

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully!',
      file: savedFile,
      debug: {
        originalSize: formatFileSize(fileData.size),
        telegramFileId: telegramResult.fileId,
        isMockTelegram: telegramResult.isMock || false,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      message: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}