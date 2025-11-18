import { getAllFiles, deleteFile } from './file-store.js';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all files from store
      const files = getAllFiles();
      return res.status(200).json(files);
    }

    if (req.method === 'DELETE') {
      // Handle file deletion
      const { pathname } = new URL(req.url, 'http://localhost');
      const fileId = pathname.split('/').pop();
      
      console.log(`Delete request for file ID: ${fileId}`);
      
      const deletedFile = deleteFile(fileId);
      
      if (!deletedFile) {
        return res.status(404).json({
          error: 'File not found',
          message: `File with ID ${fileId} does not exist`
        });
      }
      
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
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Files API error:', error);
    return res.status(500).json({
      error: 'API error',
      message: error.message || 'Unknown error'
    });
  }
}