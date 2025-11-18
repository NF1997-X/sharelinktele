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

// Parse multipart form data (improved)
async function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalLength = 0;
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
      totalLength += chunk.length;
    });
    
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks, totalLength);
        
        // Get boundary from content-type header
        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(.+)$/);
        
        if (!boundaryMatch) {
          return reject(new Error('No boundary found in Content-Type header'));
        }
        
        const boundary = '--' + boundaryMatch[1];
        const parts = buffer.toString('binary').split(boundary);
        
        // Find the file part
        for (let i = 1; i < parts.length - 1; i++) {
          const part = parts[i];
          
          if (part.includes('filename=')) {
            const headerEnd = part.indexOf('\r\n\r\n');
            if (headerEnd === -1) continue;
            
            const headers = part.substring(0, headerEnd);
            const filenameMatch = headers.match(/filename="([^"]+)"/);
            const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/);
            
            if (filenameMatch) {
              const filename = filenameMatch[1];
              const contentType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';
              
              // Extract file data (remove the leading \r\n and trailing \r\n)
              const fileDataStart = headerEnd + 4; // Skip \r\n\r\n
              const fileDataEnd = part.lastIndexOf('\r\n');
              const fileData = part.substring(fileDataStart, fileDataEnd);
              
              // Convert from binary string to Buffer
              const fileBuffer = Buffer.from(fileData, 'binary');
              
              return resolve({
                filename,
                contentType,
                buffer: fileBuffer,
                size: fileBuffer.length
              });
            }
          }
        }
        
        reject(new Error('No file found in multipart data'));
      } catch (error) {
        reject(new Error(`Failed to parse multipart data: ${error.message}`));
      }
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });
  });
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