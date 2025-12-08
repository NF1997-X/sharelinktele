import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { pgTable, text, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { eq, desc } from 'drizzle-orm';

// Define schema directly in JS
const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  mimeType: text("mime_type").notNull(),
  telegramFileId: text("telegram_file_id").notNull(),
  telegramMessageId: integer("telegram_message_id").notNull(),
  objectStorageKey: text("object_storage_key"),
  shareLink: text("share_link").notNull().unique(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Fallback in-memory storage
let memoryStore = [];
let useMemoryFallback = false;

// Initialize database connection
let db = null;
let pool = null;

try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool });
    console.log('Database connection initialized');
  } else {
    console.warn('DATABASE_URL not set, using in-memory storage');
    useMemoryFallback = true;
  }
} catch (error) {
  console.error('Database connection failed, using in-memory storage:', error);
  useMemoryFallback = true;
}

// Get all files from database
export async function getAllFiles() {
  // Memory fallback
  if (useMemoryFallback) {
    console.log('Using memory store, files:', memoryStore.length);
    return [...memoryStore];
  }
  
  try {
    const files = await db.select().from(uploadedFiles).orderBy(desc(uploadedFiles.uploadedAt));
    return files.map(file => ({
      id: file.id,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      mimeType: file.mimeType,
      shareLink: file.shareLink,
      telegramFileId: file.telegramFileId,
      telegramMessageId: file.telegramMessageId,
      uploadedAt: file.uploadedAt.toISOString()
    }));
  } catch (error) {
    console.error('Database error in getAllFiles, switching to memory:', error);
    useMemoryFallback = true;
    return [...memoryStore];
  }
}

// Add file to database
export async function addFile(fileData) {
  const fileRecord = {
    id: fileData.id,
    fileName: fileData.fileName,
    fileSize: fileData.fileSize,
    fileType: fileData.fileType,
    mimeType: fileData.mimeType,
    shareLink: fileData.shareLink,
    telegramFileId: fileData.telegramFileId,
    telegramMessageId: fileData.telegramMessageId,
    uploadedAt: fileData.uploadedAt || new Date().toISOString()
  };
  
  // Memory fallback
  if (useMemoryFallback) {
    console.log('Adding file to memory store:', fileRecord.fileName);
    memoryStore.push(fileRecord);
    return fileRecord;
  }
  
  try {
    const [insertedFile] = await db.insert(uploadedFiles).values({
      ...fileRecord,
      uploadedAt: new Date(fileRecord.uploadedAt)
    }).returning();
    
    return {
      ...insertedFile,
      uploadedAt: insertedFile.uploadedAt.toISOString()
    };
  } catch (error) {
    console.error('Database error in addFile, switching to memory:', error);
    useMemoryFallback = true;
    memoryStore.push(fileRecord);
    return fileRecord;
  }
}

// Delete file from database
export async function deleteFile(id) {
  // Memory fallback
  if (useMemoryFallback) {
    const index = memoryStore.findIndex(f => f.id === id);
    if (index !== -1) {
      const deleted = memoryStore[index];
      memoryStore.splice(index, 1);
      console.log('Deleted from memory store:', deleted.fileName);
      return deleted;
    }
    return null;
  }
  
  try {
    const [deletedFile] = await db.delete(uploadedFiles)
      .where(eq(uploadedFiles.id, id))
      .returning();
    
    if (deletedFile) {
      return {
        ...deletedFile,
        uploadedAt: deletedFile.uploadedAt.toISOString()
      };
    }
    return null;
  } catch (error) {
    console.error('Database error in deleteFile, switching to memory:', error);
    useMemoryFallback = true;
    const index = memoryStore.findIndex(f => f.id === id);
    if (index !== -1) {
      const deleted = memoryStore[index];
      memoryStore.splice(index, 1);
      return deleted;
    }
    return null;
  }
}

// Get file by ID from database
export async function getFileById(id) {
  // Memory fallback
  if (useMemoryFallback) {
    return memoryStore.find(f => f.id === id) || null;
  }
  
  try {
    const [file] = await db.select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.id, id))
      .limit(1);
    
    if (file) {
      return {
        ...file,
        uploadedAt: file.uploadedAt.toISOString()
      };
    }
    return null;
  } catch (error) {
    console.error('Database error in getFileById, switching to memory:', error);
    useMemoryFallback = true;
    return memoryStore.find(f => f.id === id) || null;
  }
}

// Get file by share link from database
export async function getFileByShareLink(shareLink) {
  // Memory fallback
  if (useMemoryFallback) {
    return memoryStore.find(f => f.shareLink === shareLink) || null;
  }
  
  try {
    const [file] = await db.select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.shareLink, shareLink))
      .limit(1);
    
    if (file) {
      return {
        ...file,
        uploadedAt: file.uploadedAt.toISOString()
      };
    }
    return null;
  } catch (error) {
    console.error('Database error in getFileByShareLink, switching to memory:', error);
    useMemoryFallback = true;
    return memoryStore.find(f => f.shareLink === shareLink) || null;
  }
}
