import { deleteFile, getFileById } from './file-store.js';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract file ID from URL or query
    let fileId;
    
    if (req.query && req.query.id) {
      fileId = req.query.id;
    } else if (req.url) {
      const urlParts = req.url.split('/');
      fileId = urlParts[urlParts.length - 1];
    }

    if (!fileId) {
      return res.status(400).json({
        error: 'File ID required',
        message: 'Please provide a file ID to delete'
      });
    }

    console.log(`Delete request for file ID: ${fileId}`);

    // Check if file exists first
    const existingFile = getFileById(fileId);
    if (!existingFile) {
      return res.status(404).json({
        error: 'File not found',
        message: `File with ID ${fileId} does not exist`
      });
    }

    // Delete the file
    const deletedFile = deleteFile(fileId);
    
    // In production, you would also delete from Telegram here
    console.log(`Successfully deleted file: ${deletedFile.fileName}`);
    
    return res.status(200).json({
      success: true,
      message: `File ${deletedFile.fileName} deleted successfully`,
      deletedFile: {
        id: deletedFile.id,
        fileName: deletedFile.fileName
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete API error:', error);
    return res.status(500).json({
      error: 'Delete failed',
      message: error.message || 'Unknown error'
    });
  }
}