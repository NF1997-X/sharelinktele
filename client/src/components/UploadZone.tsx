import { Upload, FileImage, FileVideo, File } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onFilesSelected?: (files: File[]) => void;
}

export default function UploadZone({ onFilesSelected }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
      console.log('Files dropped:', files.map(f => f.name));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
      console.log('Files selected:', files.map(f => f.name));
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all
        hover-elevate active-elevate-2 cursor-pointer
        ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      data-testid="upload-zone"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip,.rar,.7z"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-upload"
      />
      
      <div className="flex flex-col items-center gap-3">
        <div className="bg-primary/10 rounded-full p-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1.5">
            {isDragging ? 'Drop files here' : 'Upload Your Media'}
          </h3>
          <p className="text-sm text-muted-foreground mb-1">
            Drag and drop files or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Up to 1GB per file • All video formats supported
          </p>
        </div>

        <div className="flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileImage className="h-3.5 w-3.5" />
            <span>Images</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileVideo className="h-3.5 w-3.5" />
            <span>Videos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <File className="h-3.5 w-3.5" />
            <span>Documents</span>
          </div>
        </div>

        <Button variant="outline" size="default" className="mt-1 text-xs" data-testid="button-browse-files">
          Browse Files
        </Button>
      </div>
    </div>
  );
}
