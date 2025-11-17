import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { nanoid } from "nanoid";
import {
  uploadPhotoToTelegram,
  uploadVideoToTelegram,
  uploadDocumentToTelegram,
  getTelegramFileLink,
} from "./telegram";
import { insertUploadedFileSchema } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 1024 * 1024 * 1024, // 1GB limit for large videos
    fieldSize: 1024 * 1024 * 1024,
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload file endpoint
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      const fileType = file.mimetype.startsWith("image/")
        ? "image"
        : file.mimetype.startsWith("video/")
        ? "video"
        : "document";

      // Upload to Telegram based on file type and size
      // Telegram limits: photos 10MB, videos 50MB, documents 2GB
      let telegramUpload;
      if (fileType === "image" && file.size <= 10 * 1024 * 1024) {
        telegramUpload = await uploadPhotoToTelegram(
          file.buffer,
          file.originalname,
          file.originalname
        );
      } else if (fileType === "video" && file.size <= 50 * 1024 * 1024) {
        telegramUpload = await uploadVideoToTelegram(
          file.buffer,
          file.originalname,
          file.originalname
        );
      } else {
        // Send as document for large files or documents
        telegramUpload = await uploadDocumentToTelegram(
          file.buffer,
          file.originalname,
          file.originalname
        );
      }

      // Generate share link ID
      const shareLinkId = nanoid(6);
      const shareLink = `${req.protocol}://${req.get("host")}/s/${shareLinkId}`;

      // Save to database
      const uploadedFile = await storage.createUploadedFile({
        fileName: file.originalname,
        fileSize: file.size,
        fileType,
        mimeType: file.mimetype,
        telegramFileId: telegramUpload.fileId,
        telegramMessageId: telegramUpload.messageId,
        shareLink: shareLinkId,
        objectStorageKey: null,
      });

      res.json({
        id: uploadedFile.id,
        fileName: uploadedFile.fileName,
        fileSize: uploadedFile.fileSize,
        fileType: uploadedFile.fileType,
        shareLink: shareLink,
        uploadedAt: uploadedFile.uploadedAt,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Get all uploaded files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getAllUploadedFiles();
      const filesWithFullLinks = files.map(file => ({
        ...file,
        shareLink: `${req.protocol}://${req.get("host")}/s/${file.shareLink}`,
      }));
      res.json(filesWithFullLinks);
    } catch (error) {
      console.error("Get files error:", error);
      res.status(500).json({ error: "Failed to retrieve files" });
    }
  });

  // Get file by share link
  app.get("/api/share/:linkId", async (req, res) => {
    try {
      const { linkId } = req.params;
      const file = await storage.getUploadedFileByShareLink(linkId);

      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      // Get the actual file URL from Telegram
      const fileUrl = await getTelegramFileLink(file.telegramFileId);

      res.json({
        ...file,
        fileUrl,
      });
    } catch (error) {
      console.error("Get share link error:", error);
      res.status(500).json({ error: "Failed to retrieve file" });
    }
  });

  // Get file by ID
  app.get("/api/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const file = await storage.getUploadedFile(id);

      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      const fileUrl = await getTelegramFileLink(file.telegramFileId);

      res.json({
        ...file,
        fileUrl,
        shareLink: `${req.protocol}://${req.get("host")}/s/${file.shareLink}`,
      });
    } catch (error) {
      console.error("Get file error:", error);
      res.status(500).json({ error: "Failed to retrieve file" });
    }
  });

  // Delete file
  app.delete("/api/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUploadedFile(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete file error:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
