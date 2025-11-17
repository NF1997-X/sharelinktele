import TelegramBot from "node-telegram-bot-api";

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is required");
}

if (!process.env.TELEGRAM_CHANNEL_ID) {
  throw new Error("TELEGRAM_CHANNEL_ID is required");
}

// Validate channel ID format
const channelId = process.env.TELEGRAM_CHANNEL_ID;
if (channelId.startsWith('http://') || channelId.startsWith('https://')) {
  throw new Error(
    'TELEGRAM_CHANNEL_ID should not be a URL. Use the numeric channel ID (e.g., -1001234567890) or username format (e.g., @channelname)'
  );
}

export const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: false,
});

export const CHANNEL_ID = channelId;

export interface TelegramFileUpload {
  fileId: string;
  messageId: number;
}

export async function uploadPhotoToTelegram(
  fileBuffer: Buffer,
  fileName: string,
  caption?: string
): Promise<TelegramFileUpload> {
  const message = await bot.sendPhoto(CHANNEL_ID, fileBuffer, {
    caption: caption || fileName,
  }, {
    filename: fileName,
    contentType: 'application/octet-stream',
  });
  
  const photo = message.photo?.[message.photo.length - 1];
  if (!photo) {
    throw new Error("Failed to upload photo to Telegram");
  }

  return {
    fileId: photo.file_id,
    messageId: message.message_id,
  };
}

export async function uploadVideoToTelegram(
  fileBuffer: Buffer,
  fileName: string,
  caption?: string
): Promise<TelegramFileUpload> {
  const message = await bot.sendVideo(CHANNEL_ID, fileBuffer, {
    caption: caption || fileName,
  }, {
    filename: fileName,
    contentType: 'application/octet-stream',
  });

  if (!message.video) {
    throw new Error("Failed to upload video to Telegram");
  }

  return {
    fileId: message.video.file_id,
    messageId: message.message_id,
  };
}

export async function uploadDocumentToTelegram(
  fileBuffer: Buffer,
  fileName: string,
  caption?: string
): Promise<TelegramFileUpload> {
  const message = await bot.sendDocument(CHANNEL_ID, fileBuffer, {
    caption: caption || fileName,
  }, {
    filename: fileName,
    contentType: 'application/octet-stream',
  });

  if (!message.document) {
    throw new Error("Failed to upload document to Telegram");
  }

  return {
    fileId: message.document.file_id,
    messageId: message.message_id,
  };
}

export async function getTelegramFileLink(fileId: string): Promise<string> {
  const file = await bot.getFile(fileId);
  return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
}
