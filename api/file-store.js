// Simple in-memory store for uploaded files
// In production, this would be replaced with a real database

let uploadedFiles = [
  {
    id: "demo-1",
    fileName: "demo-image.jpg",
    fileSize: 2048000,
    fileType: "image",
    mimeType: "image/jpeg",
    shareLink: "abc123",
    uploadedAt: "2025-11-18T12:00:00.000Z",
    telegramFileId: "demo-file-id-1",
    telegramMessageId: 123
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
    telegramMessageId: 124
  }
];

export function getAllFiles() {
  return [...uploadedFiles];
}

export function addFile(file) {
  uploadedFiles.push(file);
  return file;
}

export function deleteFile(id) {
  const index = uploadedFiles.findIndex(file => file.id === id);
  if (index !== -1) {
    const deletedFile = uploadedFiles[index];
    uploadedFiles.splice(index, 1);
    return deletedFile;
  }
  return null;
}

export function getFileById(id) {
  return uploadedFiles.find(file => file.id === id);
}