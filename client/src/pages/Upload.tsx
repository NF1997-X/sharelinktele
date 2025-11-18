import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import UploadZone from "@/components/UploadZone";
import MediaCard from "@/components/MediaCard";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Zap } from "lucide-react";

interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: "image" | "video" | "document";
  uploadedAt: string;
  shareLink: string;
  uploading?: boolean;
  progress?: number;
}

interface UploadProgress {
  progress: number;
  fileName: string;
  fileSize: number;
  uploadSpeed: number;
  timeRemaining: number;
  startTime: number;
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

function formatSpeed(bytesPerSecond: number): string {
  const mbps = bytesPerSecond / (1024 * 1024);
  return `${mbps.toFixed(1)} MB/s`;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

export default function Upload() {
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadProgress>>(new Map());
  const { toast } = useToast();

  const { data: files = [] } = useQuery<UploadedFile[]>({
    queryKey: ["/api/files"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "File deleted",
        description: "The file has been removed successfully",
      });
    },
  });

  const handleFilesSelected = async (selectedFiles: File[]) => {
    for (const file of selectedFiles) {
      // Validate file size before uploading
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is ${formatFileSize(file.size)}. Maximum file size is 50MB.`,
          variant: "destructive",
        });
        continue;
      }
      
      // Validate file type
      const allowedTypes = [
        'image/', 'video/', 'audio/', 'application/pdf', 
        'application/msword', 'application/vnd.openxmlformats-officedocument',
        'application/zip', 'application/x-rar', 'application/x-7z-compressed'
      ];
      
      const isValidType = allowedTypes.some(type => file.type.startsWith(type));
      if (!isValidType) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} - Please upload images, videos, documents, or archives only.`,
          variant: "destructive",
        });
        continue;
      }

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const startTime = Date.now();
      
      setUploadingFiles(prev => new Map(prev).set(tempId, {
        progress: 0,
        fileName: file.name,
        fileSize: file.size,
        uploadSpeed: 0,
        timeRemaining: 0,
        startTime,
      }));

      try {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        let lastLoaded = 0;
        let lastTime = startTime;

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            const now = Date.now();
            const timeDiff = (now - lastTime) / 1000; // seconds
            const bytesDiff = e.loaded - lastLoaded;
            
            // Calculate speed (bytes per second)
            const speed = timeDiff > 0 ? bytesDiff / timeDiff : 0;
            
            // Calculate time remaining
            const bytesRemaining = e.total - e.loaded;
            const timeRemaining = speed > 0 ? bytesRemaining / speed : 0;
            
            lastLoaded = e.loaded;
            lastTime = now;

            setUploadingFiles(prev => {
              const newMap = new Map(prev);
              const current = newMap.get(tempId);
              if (current) {
                newMap.set(tempId, {
                  ...current,
                  progress,
                  uploadSpeed: speed,
                  timeRemaining,
                });
              }
              return newMap;
            });
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            setUploadingFiles(prev => {
              const newMap = new Map(prev);
              newMap.delete(tempId);
              return newMap;
            });
            queryClient.invalidateQueries({ queryKey: ["/api/files"] });
            
            // Parse response to get file details
            try {
              const response = JSON.parse(xhr.responseText);
              toast({
                title: "Upload successful!",
                description: `${file.name} uploaded successfully${response.file?.shareLink ? ` - Share link: ${response.file.shareLink}` : ''}`,
              });
            } catch {
              toast({
                title: "Upload successful",
                description: `${file.name} has been uploaded`,
              });
            }
          } else {
            console.error('Upload failed with status:', xhr.status);
            console.error('Response text:', xhr.responseText);
            let errorMessage = "Upload failed";
            let errorDetails = "";
            try {
              const errorData = JSON.parse(xhr.responseText);
              errorMessage = errorData.message || errorData.error || errorMessage;
              errorDetails = errorData.details || "";
              
              // Show specific error for file size
              if (xhr.status === 413 || errorMessage.includes('too large')) {
                errorMessage = "File too large";
                errorDetails = "Maximum file size is 50MB. Please choose a smaller file.";
              }
            } catch {
              errorMessage = `Upload failed with status ${xhr.status}`;
              if (xhr.status === 413) {
                errorDetails = "File size exceeds the maximum limit.";
              }
            }
            
            setUploadingFiles(prev => {
              const newMap = new Map(prev);
              newMap.delete(tempId);
              return newMap;
            });
            
            toast({
              title: errorMessage,
              description: errorDetails || `Error uploading ${file.name}`,
              variant: "destructive",
            });
            
            throw new Error(errorMessage);
          }
        });

        xhr.addEventListener("error", () => {
          console.error('XHR error occurred during upload');
          setUploadingFiles(prev => {
            const newMap = new Map(prev);
            newMap.delete(tempId);
            return newMap;
          });
          toast({
            title: "Upload failed",
            description: `Network error while uploading ${file.name}`,
            variant: "destructive",
          });
        });

        xhr.open("POST", "/api/upload-simple");
        xhr.send(formData);
      } catch (error) {
        console.error('Upload setup error:', error);
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.delete(tempId);
          return newMap;
        });
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast({
          title: "Upload error",
          description: `${errorMessage} (File: ${file.name})`,
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const uploadingFilesArray = Array.from(uploadingFiles.entries());
  const totalFiles = files.length + uploadingFilesArray.length;

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground mb-1">
            Upload Media
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload your files and get shareable Telegram links instantly
          </p>
        </div>

        <div className="mb-8">
          <UploadZone onFilesSelected={handleFilesSelected} />
        </div>

        {totalFiles > 0 && (
          <div>
            <h2 className="text-base font-semibold text-foreground mb-4">
              Recent Uploads ({totalFiles})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadingFilesArray.map(([tempId, uploadInfo]) => (
                <div key={tempId} className="bg-card border border-card-border rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-primary/10 rounded-lg p-2 flex-shrink-0">
                      <Zap className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {uploadInfo.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadInfo.fileSize)}
                      </p>
                    </div>
                  </div>
                  
                  <Progress value={uploadInfo.progress} className="mb-2" />
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {formatSpeed(uploadInfo.uploadSpeed)}
                    </span>
                    {uploadInfo.timeRemaining > 0 && (
                      <span>
                        {formatTime(uploadInfo.timeRemaining)} left
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 text-right">
                    <span className="text-sm font-medium text-primary">
                      {uploadInfo.progress}%
                    </span>
                  </div>
                </div>
              ))}
              {files.map(file => (
                <MediaCard
                  key={file.id}
                  id={file.id}
                  fileName={file.fileName}
                  fileSize={formatFileSize(file.fileSize)}
                  fileType={file.fileType}
                  uploadDate={formatUploadDate(file.uploadedAt)}
                  shareLink={file.shareLink}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
