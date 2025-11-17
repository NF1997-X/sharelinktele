import { Download, Copy, Trash2, FileImage, FileVideo, File, CheckCircle, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface MediaCardProps {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: "image" | "video" | "document";
  uploadDate: string;
  shareLink: string;
  thumbnailUrl?: string;
  onDelete?: (id: string) => void;
}

export default function MediaCard({
  id,
  fileName,
  fileSize,
  fileType,
  uploadDate,
  shareLink,
  thumbnailUrl,
  onDelete
}: MediaCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>("");
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fileName,
          text: `Check out this file: ${fileName}`,
          url: shareLink,
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadClick = () => {
    setShowDownloadDialog(true);
  };

  const handleDownloadConfirm = async () => {
    try {
      setDownloading(true);
      setShowDownloadDialog(false);
      
      const response = await fetch(`/api/files/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }
      
      const data = await response.json();
      
      if (data.fileUrl) {
        window.open(data.fileUrl, "_blank");
        toast({
          title: "Download started",
          description: `Downloading ${fileName}`,
        });
      } else {
        throw new Error("File URL not available");
      }
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const response = await fetch(`/api/files/${id}`);
      if (!response.ok) throw new Error("Failed to fetch file");
      
      const data = await response.json();
      if (data.fileUrl) {
        setFileUrl(data.fileUrl);
        setShowPreview(true);
      }
    } catch (error) {
      toast({
        title: "Preview failed",
        description: "Could not load preview",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    if (onDelete) {
      onDelete(id);
    }
  };

  const getFileIcon = () => {
    switch (fileType) {
      case "image":
        return FileImage;
      case "video":
        return FileVideo;
      default:
        return File;
    }
  };

  const FileIcon = getFileIcon();

  return (
    <>
      <div className="bg-card border border-card-border rounded-xl overflow-hidden hover-elevate transition-all duration-150">
        <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={fileName} className="w-full h-full object-cover" />
          ) : (
            <FileIcon className="h-16 w-16 text-muted-foreground" />
          )}
          <Badge className="absolute top-2 right-2 text-xs">
            {fileType}
          </Badge>
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-medium text-foreground truncate" data-testid={`text-filename-${id}`}>
              {fileName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>{fileSize}</span>
              <span>•</span>
              <span>{uploadDate}</span>
            </div>
          </div>

          {/* Shareable Link Display */}
          <div className="bg-muted/50 border border-border rounded-lg p-3 transition-all duration-150">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Share Link</p>
            <p className="text-xs font-mono text-foreground truncate" data-testid={`text-share-link-${id}`}>
              {shareLink}
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              data-testid={`button-copy-${id}`}
              aria-label="Copy link"
              className="flex-shrink-0 transition-all duration-150"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-chart-2" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleShare}
              data-testid={`button-share-${id}`}
              aria-label="Share"
              className="flex-shrink-0 transition-all duration-150"
            >
              <Share2 className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleDownloadClick}
              disabled={downloading}
              data-testid={`button-download-${id}`}
              aria-label="Download"
              className="flex-shrink-0 transition-all duration-150"
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={handlePreview}
              data-testid={`button-preview-${id}`}
              aria-label="Preview"
              className="flex-shrink-0 transition-all duration-150"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleDeleteClick}
              data-testid={`button-delete-${id}`}
              aria-label="Delete"
              className="flex-shrink-0 text-destructive hover:text-destructive transition-all duration-150"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none transition-all duration-150" aria-describedby="preview-description">
          <DialogTitle className="sr-only">{fileName} Preview</DialogTitle>
          <div id="preview-description" className="sr-only">Preview of {fileName}</div>
          <div className="relative w-full">
            {fileType === "image" && fileUrl && (
              <img 
                src={fileUrl} 
                alt={fileName}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
            {fileType === "video" && fileUrl && (
              <video
                src={fileUrl}
                controls
                autoPlay
                className="w-full h-auto max-h-[80vh]"
                onLoadedMetadata={(e) => {
                  // Set video to play only first 10 seconds
                  const video = e.currentTarget;
                  video.addEventListener('timeupdate', () => {
                    if (video.currentTime >= 10) {
                      video.pause();
                      video.currentTime = 0;
                    }
                  });
                }}
              >
                Your browser does not support video playback.
              </video>
            )}
            {fileType === "document" && (
              <div className="p-8 text-center">
                <FileIcon className="h-16 w-16 text-white mx-auto mb-4" />
                <p className="text-white mb-4">Document preview not available</p>
                <Button onClick={handleDownloadClick} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download to view
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Download Confirmation Dialog */}
      <AlertDialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <AlertDialogContent className="transition-all duration-150 ease-in-out">
          <AlertDialogHeader>
            <AlertDialogTitle>Download File?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to download <span className="font-semibold">{fileName}</span> ({fileSize})?
              <br />
              The file will open in a new tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="transition-all duration-150">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDownloadConfirm}
              className="transition-all duration-150"
            >
              Download
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="transition-all duration-150 ease-in-out">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{fileName}</span>?
              <br />
              This action cannot be undone and the file will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="transition-all duration-150">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 transition-all duration-150"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
