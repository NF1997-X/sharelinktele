import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import MediaCard from "@/components/MediaCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface MediaFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: "image" | "video" | "document";
  uploadedAt: string;
  shareLink: string;
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

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: files = [], isLoading } = useQuery<MediaFile[]>({
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

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const filteredFiles = files.filter(file =>
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: files.length,
    images: files.filter(f => f.fileType === "image").length,
    videos: files.filter(f => f.fileType === "video").length,
    documents: files.filter(f => f.fileType === "document").length,
  };

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground mb-1">
            Media Library
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all your uploaded files and share links
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
              data-testid="input-search-files"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="px-3 text-xs">
              Total: {stats.total}
            </Badge>
            <Badge variant="outline" className="px-3 text-xs">
              Images: {stats.images}
            </Badge>
            <Badge variant="outline" className="px-3 text-xs">
              Videos: {stats.videos}
            </Badge>
            <Badge variant="outline" className="px-3 text-xs">
              Docs: {stats.documents}
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading files...</p>
          </div>
        ) : filteredFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map(file => (
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
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {searchQuery ? "No files found matching your search" : "No files uploaded yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
