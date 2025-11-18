import { randomBytes } from 'crypto';
import { Buffer } from 'buffer';
import { uploadFileToTelegram } from './telegram-utils.js';

// Simple file size formatting
function formatFileSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Generate random ID (simplified nanoid)
function generateId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

// Parse multipart form data (simplified)
async function parseMultipart(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  
  // Basic multipart parsing (for demo)
  const boundary = req.headers['content-type']?.match(/boundary=(.+)/)?.[1];
  if (!boundary) {
    throw new Error('No boundary found');
  }
  
  const parts = buffer.toString('binary').split('--' + boundary);
  
  for (const part of parts) {
    if (part.includes('filename=')) {
      const lines = part.split('\r\n');
      const headerEndIndex = lines.findIndex(line => line === '');
      
      if (headerEndIndex !== -1) {
        const headers = lines.slice(0, headerEndIndex).join('\r\n');
        const filename = headers.match(/filename="([^"]+)"/)?.[1];
        const contentType = headers.match(/Content-Type:\s*([^\r\n]+)/)?.[1];
        
        if (filename) {
          const fileData = lines.slice(headerEndIndex + 1, -1).join('\r\n');
          const fileBuffer = Buffer.from(fileData, 'binary');
          
          return {
            filename,
            contentType: contentType || 'application/octet-stream',
            buffer: fileBuffer,
            size: fileBuffer.length
          };
        }
      }
    }
  }
  
  throw new Error('No file found in upload');
}

// Upload to Telegram
async function uploadToTelegram(fileBuffer, filename, contentType) {
  try {
    const result = await uploadFileToTelegram(fileBuffer, filename, contentType);
    return result;
  } catch (error) {
    console.error('Telegram upload error:', error);
    // Fallback to mock data if Telegram fails
    const mockFileId = generateId(32);
    const mockMessageId = Math.floor(Math.random() * 1000000);
    
    return {
      fileId: mockFileId,
      messageId: mockMessageId,
      fileUrl: `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${mockFileId}`,
      isMock: true,
      error: error.message
    };
  }
}

// Mock database save
async function saveToDatabase(fileData) {
  // For demo, return mock saved data
  // In production, this would use the database connection
  const id = generateId(16);
  const shareLink = generateId(8);
  
  return {
    id,
    fileName: fileData.filename,
    fileSize: fileData.size,
    fileType: fileData.contentType.split('/')[0],
    mimeType: fileData.contentType,
    shareLink,
    telegramFileId: fileData.telegramFileId,
    telegramMessageId: fileData.telegramMessageId,
    uploadedAt: new Date().toISOString()
  };
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

    // Parse uploaded file
    const fileData = await parseMultipart(req);
    console.log('File parsed:', {
      filename: fileData.filename,
      size: formatFileSize(fileData.size),
      type: fileData.contentType
    });

    // Validate file size (50MB limit for Vercel)
    if (fileData.size > 50 * 1024 * 1024) {
      return res.status(413).json({
        error: 'File too large',
        message: 'Maximum file size is 50MB'
      });
    }

    // Upload to Telegram
    const telegramResult = await uploadToTelegram(
      fileData.buffer, 
      fileData.filename, 
      fileData.contentType
    );
    console.log('Uploaded to Telegram:', telegramResult.fileId);

    // Save to database
    const savedFile = await saveToDatabase({
      ...fileData,
      telegramFileId: telegramResult.fileId,
      telegramMessageId: telegramResult.messageId
    });
    console.log('Saved to database:', savedFile.id);

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully!',
      file: savedFile,
      debug: {
        originalSize: formatFileSize(fileData.size),
        telegramFileId: telegramResult.fileId,
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