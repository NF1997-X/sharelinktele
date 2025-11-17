import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  uploadedAt: true,
});

export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;
export type UploadedFile = typeof uploadedFiles.$inferSelect;
