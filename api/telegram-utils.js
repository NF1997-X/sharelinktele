// Real Telegram upload implementation
export async function uploadFileToTelegram(fileBuffer, filename, contentType) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    throw new Error('Telegram credentials not configured');
  }

  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: contentType });
  
  formData.append('chat_id', TELEGRAM_CHANNEL_ID);
  formData.append('caption', filename);
  
  let endpoint;
  if (contentType.startsWith('image/')) {
    formData.append('photo', blob, filename);
    endpoint = 'sendPhoto';
  } else if (contentType.startsWith('video/')) {
    formData.append('video', blob, filename);
    endpoint = 'sendVideo';
  } else {
    formData.append('document', blob, filename);
    endpoint = 'sendDocument';
  }
  
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${endpoint}`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Telegram API error:', errorText);
    throw new Error(`Telegram upload failed: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (!result.ok) {
    console.error('Telegram API error:', result);
    throw new Error(`Telegram error: ${result.description || 'Unknown error'}`);
  }
  
  // Extract file info from response
  let fileId;
  if (result.result.photo) {
    fileId = result.result.photo[result.result.photo.length - 1].file_id;
  } else if (result.result.video) {
    fileId = result.result.video.file_id;
  } else if (result.result.document) {
    fileId = result.result.document.file_id;
  } else {
    throw new Error('No file ID found in Telegram response');
  }
  
  return {
    fileId,
    messageId: result.result.message_id,
    fileUrl: `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileId}`
  };
}

// Get file download URL from Telegram
export async function getTelegramFileUrl(fileId) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('Telegram bot token not configured');
  }
  
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get file info: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (!result.ok) {
    throw new Error(`Telegram error: ${result.description || 'Unknown error'}`);
  }
  
  const filePath = result.result.file_path;
  return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
}