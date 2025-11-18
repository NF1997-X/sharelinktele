import "dotenv/config";
import express from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "../server/storage";
import multer from "multer";
import { nanoid } from "nanoid";
import {
  uploadPhotoToTelegram,
  uploadVideoToTelegram,
  uploadDocumentToTelegram,
  getTelegramFileLink,
  type TelegramFileUpload,
} from "../server/telegram";
import { insertUploadedFileSchema } from "../shared/schema";

// Validate required environment variables
function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'TELEGRAM_BOT_TOKEN', 
    'TELEGRAM_CHANNEL_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('Environment variables validated successfully');
}

// Validate on startup
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 1024 * 1024 * 1024, // 1GB limit for large videos
    fieldSize: 1024 * 1024 * 1024,
  },
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get("/api", (req, res) => {
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
});

// Get all files
app.get("/api/files", async (req, res) => {
  try {
    console.log('Fetching all files from database');
    const files = await storage.getAllUploadedFiles();
    console.log(`Found ${files.length} files`);
    return res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return res.status(500).json({ 
      error: "Failed to fetch files",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Upload file endpoint
app.post("/api/upload", upload.single("file"), async (req, res) => {
  console.log('Upload request received', {
    hasFile: !!req.file,
    fileName: req.file?.originalname,
    fileSize: req.file?.size,
    mimeType: req.file?.mimetype
  });
  
  try {
    // Validate environment first
    validateEnvironment();
    
    if (!req.file) {
      console.error('No file uploaded in request');
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
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
        fileType: file.mimetype.split('/')[0], // 'image', 'video', 'application', etc
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
});

// Get file by ID
app.get("/api/files/:id", async (req, res) => {
  try {
    const file = await storage.getUploadedFile(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    return res.json(file);
  } catch (error) {
    console.error("Error fetching file:", error);
    return res.status(500).json({ 
      error: "Failed to fetch file",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Delete file
app.delete("/api/files/:id", async (req, res) => {
  try {
    await storage.deleteUploadedFile(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ 
      error: "Failed to delete file",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Export the Express API handler for Vercel
export default app;