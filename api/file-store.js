// Simple in-memory store for uploaded files
// In production, this would be replaced with a real database
// Note: In serverless environments, this resets between cold starts

let uploadedFiles = [];

// Only add demo files if no real files exist
function ensureDemoFiles() {
  if (uploadedFiles.length === 0) {
    uploadedFiles = [
      {
        id: "demo-1",
        fileName: "demo-image.jpg",
        fileSize: 2048000,
        fileType: "image",
        mimeType: "image/jpeg",
        shareLink: "abc123",
        uploadedAt: "2025-11-18T12:00:00.000Z",
        telegramFileId: "demo-file-id-1",
        telegramMessageId: 123,
        isDemo: true
      },
      {
        id: "demo-2", 
        fileName: "demo-video.mp4",
        fileSize: 10485760,
        fileType: "video",
        mimeType: "video/mp4", 
        shareLink: "def456",
        uploadedAt: "2025-11-18T11:30:00.000Z",
        telegramFileId: "demo-file-id-2",
        telegramMessageId: 124,
        isDemo: true
      }
    ];
  }
}

export function getAllFiles() {
  ensureDemoFiles();
  return [...uploadedFiles];
}

export function addFile(file) {
  ensureDemoFiles();
  // Remove demo files when real file is added
  uploadedFiles = uploadedFiles.filter(f => !f.isDemo);
  uploadedFiles.push(file);
  return file;
}

export function deleteFile(id) {
  ensureDemoFiles();
  const index = uploadedFiles.findIndex(file => file.id === id);
  if (index !== -1) {
    const deletedFile = uploadedFiles[index];
    uploadedFiles.splice(index, 1);
    return deletedFile;
  }
  return null;
}

export function getFileById(id) {
  ensureDemoFiles();
  return uploadedFiles.find(file => file.id === id);
}