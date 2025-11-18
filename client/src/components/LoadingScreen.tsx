import { Share2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        {/* Simple spinner */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Share2 className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        {/* Simple text */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">ShareLink Bot</h2>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  );
}
