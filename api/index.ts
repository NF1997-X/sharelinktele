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
  res.json({ message: "MediaShareBridge API is running!" });
});

// Get all files
app.get("/api/files", async (req, res) => {
  try {
    const files = await storage.getAllUploadedFiles();
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
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const fileId = nanoid();
    const shareLink = nanoid(8);
    
    let telegramUpload: { fileId: string; messageId: number };
    
    // Upload to Telegram based on file type
    if (file.mimetype.startsWith('image/')) {
      telegramUpload = await uploadPhotoToTelegram(file.buffer, file.originalname);
    } else if (file.mimetype.startsWith('video/')) {
      telegramUpload = await uploadVideoToTelegram(file.buffer, file.originalname);
    } else {
      telegramUpload = await uploadDocumentToTelegram(file.buffer, file.originalname);
    }
    
    const telegramFileUrl = await getTelegramFileLink(telegramUpload.fileId);
    
    // Save to database
    const newFile = await storage.createUploadedFile({
      id: fileId,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      shareLink,
      telegramFileId: telegramUpload.fileId,
      telegramMessageId: telegramUpload.messageId,
      telegramFileUrl,
    });
    
    return res.json(newFile);
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