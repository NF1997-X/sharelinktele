import { Share2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center space-y-4 animate-in zoom-in-95 fade-in duration-500">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center animate-spin">
            <div className="w-20 h-20 border-4 border-transparent border-t-primary rounded-full"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Share2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">ShareLink Bot</h2>
          <p className="text-sm text-muted-foreground">Loading your files...</p>
        </div>
      </div>
    </div>
  );
}
