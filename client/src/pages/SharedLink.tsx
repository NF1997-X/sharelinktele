import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Download, X, FileImage, FileVideo, File, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";

interface SharedFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: "image" | "video" | "document";
  uploadedAt: string;
  shareLink: string;
  fileUrl: string;
}

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatUploadDate(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

export default function SharedLink() {
  const [, params] = useRoute("/s/:linkId");
  const linkId = params?.linkId;
  const [showControls, setShowControls] = useState(true);
  const [imageZoom, setImageZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: file, isLoading, error } = useQuery<SharedFile>({
    queryKey: ["/api/share", linkId],
    enabled: !!linkId,
  });

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimeout = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    resetTimeout();
    window.addEventListener("mousemove", resetTimeout);
    window.addEventListener("touchstart", resetTimeout);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimeout);
      window.removeEventListener("touchstart", resetTimeout);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        window.close();
      } else if (e.key === "+" && file?.fileType === "image") {
        setImageZoom(prev => Math.min(prev + 0.25, 3));
      } else if (e.key === "-" && file?.fileType === "image") {
        setImageZoom(prev => Math.max(prev - 0.25, 0.5));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [file?.fileType]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return FileImage;
      case "video":
        return FileVideo;
      default:
        return File;
    }
  };

  const handleDownload = () => {
    if (file?.fileUrl) {
      window.open(file.fileUrl, "_blank");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetZoom = () => {
    setImageZoom(1);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-sm text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-center px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">File Not Found</h1>
          <p className="text-sm text-white/70">The file you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const FileIcon = getFileIcon(file.fileType);

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div 
        className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex-1 min-w-0 mr-4">
            <h1 className="text-sm font-medium text-white truncate" data-testid="text-shared-filename">
              {file.fileName}
            </h1>
            <p className="text-xs text-white/60">
              {formatFileSize(file.fileSize)} · Uploaded {formatUploadDate(file.uploadedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {file.fileType === "image" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setImageZoom(prev => Math.max(prev - 0.25, 0.5))}
                  disabled={imageZoom <= 0.5}
                  data-testid="button-zoom-out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <button
                  onClick={resetZoom}
                  className="text-xs text-white/80 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-all"
                  data-testid="button-zoom-reset"
                >
                  {Math.round(imageZoom * 100)}%
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setImageZoom(prev => Math.min(prev + 0.25, 3))}
                  disabled={imageZoom >= 3}
                  data-testid="button-zoom-in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
              data-testid="button-fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => window.close()}
              data-testid="button-close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Media Content */}
      <div className="flex-1 flex items-center justify-center p-0 overflow-hidden">
        {file.fileType === "image" && file.fileUrl ? (
          <div className="w-full h-full flex items-center justify-center overflow-auto">
            <img 
              src={file.fileUrl} 
              alt={file.fileName} 
              className="transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${imageZoom})`,
                maxWidth: imageZoom > 1 ? 'none' : '100%',
                maxHeight: imageZoom > 1 ? 'none' : '100%',
                objectFit: 'contain',
              }}
              data-testid="img-shared-media"
            />
          </div>
        ) : file.fileType === "video" && file.fileUrl ? (
          <video 
            src={file.fileUrl} 
            controls 
            autoPlay
            className="max-w-full max-h-full"
            data-testid="video-shared-media"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white/5 rounded-full p-8">
              <FileIcon className="h-24 w-24 text-white/40" />
            </div>
            <p className="text-sm text-white/50">Preview not available</p>
            <Button
              variant="outline"
              className="mt-2 border-white/20 text-white hover:bg-white/10"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-center gap-3 max-w-7xl mx-auto">
          <Button
            size="default"
            className="px-6 bg-white text-black hover:bg-white/90"
            onClick={handleDownload}
            data-testid="button-download-shared"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Hint overlay (only shown briefly on load) */}
      {file.fileType === "image" && showControls && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-xs text-white/70">Press + / - to zoom · ESC to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
