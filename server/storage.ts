import { uploadedFiles, type UploadedFile, type InsertUploadedFile } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile>;
  getUploadedFile(id: string): Promise<UploadedFile | undefined>;
  getUploadedFileByShareLink(shareLink: string): Promise<UploadedFile | undefined>;
  getAllUploadedFiles(): Promise<UploadedFile[]>;
  deleteUploadedFile(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createUploadedFile(insertFile: InsertUploadedFile): Promise<UploadedFile> {
    const [file] = await db
      .insert(uploadedFiles)
      .values(insertFile)
      .returning();
    return file;
  }

  async getUploadedFile(id: string): Promise<UploadedFile | undefined> {
    const [file] = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.id, id));
    return file || undefined;
  }

  async getUploadedFileByShareLink(shareLink: string): Promise<UploadedFile | undefined> {
    const [file] = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.shareLink, shareLink));
    return file || undefined;
  }

  async getAllUploadedFiles(): Promise<UploadedFile[]> {
    return await db
      .select()
      .from(uploadedFiles)
      .orderBy(desc(uploadedFiles.uploadedAt));
  }

  async deleteUploadedFile(id: string): Promise<void> {
    await db
      .delete(uploadedFiles)
      .where(eq(uploadedFiles.id, id));
  }
}

export const storage = new DatabaseStorage();
