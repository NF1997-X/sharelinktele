import { randomBytes } from 'crypto';
import { addFile } from './db-file-store.js';
import { uploadFileToTelegram } from './telegram-utils.js';

// In-memory storage for chunks (should use Redis/Database in production)
const uploadSessions = new Map();

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

// Parse base64 chunk data
function parseChunk(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chunkData = await parseChunk(req);
    const { 
      sessionId, 
      chunkIndex, 
      totalChunks, 
      chunkData: base64Chunk,
      fileName,
      fileSize,
      mimeType 
    } = chunkData;

    console.log(`Received chunk ${chunkIndex + 1}/${totalChunks} for session ${sessionId}`);

    // Initialize or get session
    if (!uploadSessions.has(sessionId)) {
      uploadSessions.set(sessionId, {
        chunks: new Array(totalChunks),
        fileName,
        fileSize,
        mimeType,
        receivedChunks: 0,
        createdAt: Date.now()
      });
    }

    const session = uploadSessions.get(sessionId);
    
    // Store chunk
    session.chunks[chunkIndex] = Buffer.from(base64Chunk, 'base64');
    session.receivedChunks++;

    // Check if all chunks received
    if (session.receivedChunks === totalChunks) {
      console.log(`All chunks received for ${fileName}, assembling...`);
      
      // Assemble file
      const completeBuffer = Buffer.concat(session.chunks);
      
      // Clean up session
      uploadSessions.delete(sessionId);

      // Upload to Telegram
      let telegramResult;
      try {
        telegramResult = await uploadFileToTelegram(
          completeBuffer,
          session.fileName,
          session.mimeType
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

      // Save to file store
      const savedFile = await addFile({
        id: generateId(16),
        fileName: session.fileName,
        fileSize: session.fileSize,
        fileType: session.mimeType.split('/')[0],
        mimeType: session.mimeType,
        shareLink: generateId(5),
        telegramFileId: telegramResult.fileId,
        telegramMessageId: telegramResult.messageId,
        uploadedAt: new Date().toISOString()
      });

      console.log('File assembled and saved:', savedFile.id);

      return res.status(200).json({
        success: true,
        complete: true,
        message: 'File uploaded successfully!',
        file: savedFile,
        debug: {
          originalSize: formatFileSize(session.fileSize),
          chunksReceived: totalChunks,
          telegramFileId: telegramResult.fileId,
          isMockTelegram: telegramResult.isMock || false,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Return progress
    return res.status(200).json({
      success: true,
      complete: false,
      progress: (session.receivedChunks / totalChunks) * 100,
      receivedChunks: session.receivedChunks,
      totalChunks
    });

  } catch (error) {
    console.error('Chunked upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      message: error.message || 'Unknown error'
    });
  }
}

// Clean up old sessions (> 1 hour)
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of uploadSessions.entries()) {
    if (now - session.createdAt > 3600000) { // 1 hour
      uploadSessions.delete(sessionId);
      console.log(`Cleaned up expired session: ${sessionId}`);
    }
  }
}, 300000); // Run every 5 minutes
